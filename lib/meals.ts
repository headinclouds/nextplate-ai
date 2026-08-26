import 'server-only';
import sql from 'better-sqlite3';
import slugify from 'slugify';
import xss from 'xss';
import { uploadImage } from './storage';

const dbPath = process.env.SQLITE_PATH || 'meals.db';
const db = sql(dbPath);

export async function getMeals(page = 1, pageSize = 12) {
  try {
    const offset = (page - 1) * pageSize;
    
    const meals = db.prepare(
      'SELECT * FROM meals ORDER BY id DESC LIMIT ? OFFSET ?'
    ).all(pageSize, offset);
    
    const totalResult = db.prepare('SELECT COUNT(*) as count FROM meals').get();
    const total = totalResult.count;
    
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
    return db.prepare('SELECT * FROM meals WHERE slug = ?').get(slug);
  } catch {
    throw new Error('Failed to fetch meal details.');
  }
}


export async function saveMeal(meal) {
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
  
  while (db.prepare('SELECT slug FROM meals WHERE slug = ?').get(slug)) {
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
    } catch (error) {
      throw new Error('Failed to upload image to cloud storage.');
    }
  }

  const dbMeal = {
    slug: String(slug),
    title: sanitizedTitle,
    summary: sanitizedSummary,
    instructions: sanitizedInstructions,
    image: String(storedImagePath || ''),
    creator: sanitizedCreator,
    creator_email: sanitizedEmail,
  };

  try {
    db.prepare(
      `
        INSERT INTO meals
          (slug, title, image, summary, instructions, creator, creator_email)
        VALUES
          (@slug, @title, @image, @summary, @instructions, @creator, @creator_email)
      `
    ).run(dbMeal);
  } catch (error) {
    console.error('Database save error:', error);
    throw new Error('Unable to save meal to database. Please try again.');
  }
}
