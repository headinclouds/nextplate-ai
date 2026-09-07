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
  process.env.POSTGRES_URL || process.env.STORAGE_POSTGRES_URL || process.env.STORAGE_URL || '';

if (!postgresUrl) {
  throw new Error('POSTGRES_URL (or STORAGE_POSTGRES_URL/STORAGE_URL) is required.');
}

// Local Postgres (e.g. Docker) has no SSL listener; hosted providers require it.
const isLocalPostgres = ['localhost', '127.0.0.1'].includes(new URL(postgresUrl).hostname);
const postgresClient = createPostgresClient(postgresUrl, {
  ssl: isLocalPostgres ? false : 'require',
});

export async function getMeals(page = 1, pageSize = 12) {
  try {
    const offset = (page - 1) * pageSize;

    const mealsResult = await postgresClient`
      SELECT * FROM meals
      ORDER BY id DESC
      LIMIT ${pageSize}
      OFFSET ${offset}
    `;

    const totalResult = await postgresClient`
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
  } catch {
    throw new Error('Failed to fetch meals.');
  }
}

export async function getMeal(slug) {
  try {
    const result = await postgresClient`
      SELECT * FROM meals WHERE slug = ${slug} LIMIT 1
    `;

    return result[0];
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

  while (true) {
    const existing = await postgresClient`
      SELECT slug FROM meals WHERE slug = ${slug} LIMIT 1
    `;

    if (existing.length === 0) {
      break;
    }

    slug = `${baseSlug}-${counter++}`;
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
    await postgresClient`
      INSERT INTO meals
        (slug, title, image, summary, instructions, creator, creator_email)
      VALUES
        (${dbMeal.slug}, ${dbMeal.title}, ${dbMeal.image}, ${dbMeal.summary}, ${dbMeal.instructions}, ${dbMeal.creator}, ${dbMeal.creator_email})
    `;
  } catch (error) {
    console.error('Database save error:', error);
    throw new Error('Unable to save meal to database. Please try again.');
  }
}
