import 'server-only';
import createPostgresClient from 'postgres';
import slugify from 'slugify';
import xss from 'xss';
import { uploadImage } from './storage';

type DbMeal = {
  id?: number;
  slug: string;
  title: string;
  image: string;
  summary: string;
  instructions: string;
  creator: string;
  creator_email: string;
};

type MealInput = {
  title: string;
  summary: string;
  instructions: string;
  image?: File;
  imagePath?: string;
  creator: string;
  creator_email: string;
};

const postgresUrl =
  process.env.POSTGRES_URL ||
  process.env.STORAGE_POSTGRES_URL ||
  process.env.STORAGE_URL ||
  '';

const usePostgres = Boolean(postgresUrl);
const dbPath = process.env.SQLITE_PATH || 'meals.db';
const postgresClient = usePostgres
  ? createPostgresClient(postgresUrl, { ssl: 'require' })
  : null;

let sqliteDb: any | null = null;
let postgresSchemaPromise: Promise<void> | null = null;

function getSqliteDb() {
  if (!sqliteDb) {
    const sqlite = require('better-sqlite3');
    sqliteDb = sqlite(dbPath);
  }

  return sqliteDb;
}

async function ensurePostgresSchema() {
  if (!usePostgres) {
    return;
  }

  if (!postgresSchemaPromise) {
    postgresSchemaPromise = (async () => {
      await postgresClient!`
        CREATE TABLE IF NOT EXISTS meals (
          id SERIAL PRIMARY KEY,
          slug TEXT NOT NULL UNIQUE,
          title TEXT NOT NULL,
          image TEXT NOT NULL,
          summary TEXT NOT NULL,
          instructions TEXT NOT NULL,
          creator TEXT NOT NULL,
          creator_email TEXT NOT NULL
        )
      `;

      await postgresClient!`
        CREATE INDEX IF NOT EXISTS idx_meals_slug ON meals(slug)
      `;

      await postgresClient!`
        CREATE INDEX IF NOT EXISTS idx_meals_creator_email ON meals(creator_email)
      `;
    })();
  }

  await postgresSchemaPromise;
}

export async function getMeals(page = 1, pageSize = 12) {
  try {
    const offset = (page - 1) * pageSize;

    if (usePostgres) {
      await ensurePostgresSchema();

      const mealsResult = await postgresClient!`
        SELECT * FROM meals
        ORDER BY id DESC
        LIMIT ${pageSize}
        OFFSET ${offset}
      `;

      const totalResult = await postgresClient!`
        SELECT COUNT(*)::int AS count FROM meals
      `;

      const total = Number(totalResult[0]?.count ?? 0);

      return {
        meals: mealsResult,
        pagination: {
          currentPage: page,
          pageSize,
          totalPages: Math.ceil(total / pageSize),
          totalItems: total,
        },
      };
    }

    const db = getSqliteDb();
    const meals = db
      .prepare('SELECT * FROM meals ORDER BY id DESC LIMIT ? OFFSET ?')
      .all(pageSize, offset);

    const totalResult = db.prepare('SELECT COUNT(*) as count FROM meals').get();
    const total = Number(totalResult.count || 0);
    
    return {
      meals,
      pagination: {
        currentPage: page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
        totalItems: total,
      },
    };
  } catch {
    throw new Error('Failed to fetch meals.');
  }
}

export async function getMeal(slug) {
  try {
    if (usePostgres) {
      await ensurePostgresSchema();

      const result = await postgresClient!`
        SELECT * FROM meals WHERE slug = ${slug} LIMIT 1
      `;

      return result[0];
    }

    const db = getSqliteDb();
    return db.prepare('SELECT * FROM meals WHERE slug = ?').get(slug);
  } catch {
    throw new Error('Failed to fetch meal details.');
  }
}


export async function saveMeal(meal: MealInput) {
  // Sanitize all user inputs to prevent XSS and ensure they're strings
  const sanitizedTitle = String(xss(meal.title || ''));
  const sanitizedSummary = String(xss(meal.summary || ''));
  const sanitizedInstructions = String(xss(meal.instructions || ''));
  const sanitizedCreator = String(xss(meal.creator || ''));
  const sanitizedEmail = String(meal.creator_email || '');

  // Generate unique slug, handle duplicates
  const baseSlug = slugify(sanitizedTitle, { lower: true, strict: true });
  let slug = baseSlug;
  let counter = 1;

  if (usePostgres) {
    await ensurePostgresSchema();

    while (true) {
      const existing = await postgresClient!`
        SELECT slug FROM meals WHERE slug = ${slug} LIMIT 1
      `;

      if (existing.length === 0) {
        break;
      }

      slug = `${baseSlug}-${counter++}`;
    }
  } else {
    const db = getSqliteDb();
    while (db.prepare('SELECT slug FROM meals WHERE slug = ?').get(slug)) {
      slug = `${baseSlug}-${counter++}`;
    }
  }

  let storedImagePath = meal.imagePath;

  if (!storedImagePath) {
    if (!meal.image || meal.image.size === 0) {
      throw new Error('Image is required.');
    }

    if (!meal.image.type || !meal.image.type.startsWith('image/')) {
      throw new Error('Uploaded file must be an image.');
    }

    const extension = meal.image.name.split('.').pop() || 'jpg';
    const fileName = `${slug}-${Date.now()}.${extension}`;

    let bufferedImage;
    try {
      bufferedImage = Buffer.from(await meal.image.arrayBuffer());
    } catch {
      throw new Error('Failed to process uploaded image.');
    }

    try {
      // Upload to cloud storage (Cloudinary) or local fallback
      storedImagePath = await uploadImage(bufferedImage, fileName, meal.image.type);
    } catch {
      throw new Error('Failed to upload image to cloud storage.');
    }
  }

  const dbMeal: DbMeal = {
    slug: String(slug),
    title: sanitizedTitle,
    summary: sanitizedSummary,
    instructions: sanitizedInstructions,
    image: String(storedImagePath || ''),
    creator: sanitizedCreator,
    creator_email: sanitizedEmail,
  };

  try {
    if (usePostgres) {
      await ensurePostgresSchema();

      await postgresClient!`
        INSERT INTO meals
          (slug, title, image, summary, instructions, creator, creator_email)
        VALUES
          (${dbMeal.slug}, ${dbMeal.title}, ${dbMeal.image}, ${dbMeal.summary}, ${dbMeal.instructions}, ${dbMeal.creator}, ${dbMeal.creator_email})
      `;
    } else {
      const db = getSqliteDb();
      db.prepare(
        `
          INSERT INTO meals
            (slug, title, image, summary, instructions, creator, creator_email)
          VALUES
            (@slug, @title, @image, @summary, @instructions, @creator, @creator_email)
        `
      ).run(dbMeal);
    }
  } catch (error) {
    console.error('Database save error:', error);
    throw new Error('Unable to save meal to database. Please try again.');
  }
}
