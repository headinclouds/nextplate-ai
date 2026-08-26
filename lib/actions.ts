'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import slugify from 'slugify';

import { saveMeal } from '@/lib/meals';
import { checkRateLimit } from '@/lib/rate-limit';
import { uploadImage } from '@/lib/storage';
import {
  MAX_FILE_SIZE,
  ALLOWED_IMAGE_TYPES,
  MAX_TITLE_LENGTH,
  MAX_SUMMARY_LENGTH,
  MAX_INSTRUCTIONS_LENGTH,
  MAX_NAME_LENGTH,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  RATE_LIMIT_MAX_REQUESTS,
  RATE_LIMIT_WINDOW_MS,
} from '@/lib/constants';

function isInvalidText(value) {
  return !value || value.trim() === '';
}

function isInvalidEmail(email) {
  return !email || !email.includes('@');
}

async function persistGeneratedImage(dataUrl: string, title: string): Promise<string> {
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) {
    throw new Error('Invalid generated image format.');
  }

  const mimeType = match[1];
  const base64Data = match[2];

  const extensionMap = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
  };

  const extension = extensionMap[mimeType];
  if (!extension) {
    throw new Error('Unsupported generated image type.');
  }

  const slug = slugify(title, { lower: true, strict: true });
  const fileName = `${slug}-ai-${Date.now()}.${extension}`;
  const buffer = Buffer.from(base64Data, 'base64');

  // Upload to cloud storage (Cloudinary) or local fallback
  return await uploadImage(buffer, fileName, mimeType);
}

export async function generateMealImage(prevState, formData) {
  const createImageState = (message, imagePath) => ({
    message,
    imagePath,
    requestId: Date.now(),
  });

  // Rate limiting: prevent API abuse
  const ip = headers().get('x-forwarded-for') || headers().get('x-real-ip') || 'unknown';
  const rateLimit = checkRateLimit(`ai-generation:${ip}`, RATE_LIMIT_MAX_REQUESTS, RATE_LIMIT_WINDOW_MS);
  
  if (!rateLimit.success) {
    const resetTime = rateLimit.resetTime.toLocaleTimeString();
    return createImageState(
      `Too many requests. Please try again after ${resetTime}.`,
      prevState?.imagePath || ''
    );
  }
  
  const title = formData.get('title');
  const summary = formData.get('summary');

  if (isInvalidText(title) || isInvalidText(summary)) {
    return createImageState(ERROR_MESSAGES.REQUIRED_FIELDS, prevState?.imagePath || '');
  }

  let imageBuffer;
  try {
    const prompt = encodeURIComponent(
      `Food photography of ${title}. ${summary}. Studio lighting, realistic textures, appetizing composition.`
    );
    const imageUrl = `https://image.pollinations.ai/prompt/${prompt}?width=1024&height=1024&nologo=true`;

    const response = await fetch(imageUrl);
    if (!response.ok) {
      return createImageState(
        `Image generation service error (${response.status}). Please try again in a moment.`,
        prevState?.imagePath || ''
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    imageBuffer = Buffer.from(arrayBuffer);

    if (!imageBuffer.length) {
      return createImageState(
        'Image generation returned an empty file. Please try again.',
        prevState?.imagePath || ''
      );
    }
  } catch (error) {
    return createImageState(
      'Unable to generate image. Please check your internet connection and try again.',
      prevState?.imagePath || ''
    );
  }

  const imageDataUrl = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;

  return createImageState(SUCCESS_MESSAGES.IMAGE_GENERATED, imageDataUrl);
}

export async function shareMeal(prevState, formData) {
  const title = formData.get('title');
  const summary = formData.get('summary');
  const instructions = formData.get('instructions');
  const image = formData.get('image');
  const generatedImage = formData.get('generatedImage');
  const creator = formData.get('name');
  const creatorEmail = formData.get('email');

  // Validate all required fields
  if (
    isInvalidText(title) ||
    isInvalidText(summary) ||
    isInvalidText(instructions) ||
    isInvalidText(creator) ||
    isInvalidEmail(creatorEmail)
  ) {
    return { message: 'Please fill in all required fields correctly.' };
  }
  
  // Validate input lengths
  if (title.trim().length > MAX_TITLE_LENGTH) {
    return { message: ERROR_MESSAGES.TITLE_TOO_LONG };
  }
  if (summary.trim().length > MAX_SUMMARY_LENGTH) {
    return { message: ERROR_MESSAGES.SUMMARY_TOO_LONG };
  }
  if (instructions.trim().length > MAX_INSTRUCTIONS_LENGTH) {
    return { message: ERROR_MESSAGES.INSTRUCTIONS_TOO_LONG };
  }
  if (creator.trim().length > MAX_NAME_LENGTH) {
    return { message: ERROR_MESSAGES.NAME_TOO_LONG };
  }

  const hasGeneratedImage =
    typeof generatedImage === 'string' && generatedImage.trim() !== '';
  const generatedImagePath = typeof generatedImage === 'string' ? generatedImage.trim() : '';
  const hasUploadedImage = image && image.size > 0;

  if (!hasGeneratedImage && !hasUploadedImage) {
    return { message: ERROR_MESSAGES.IMAGE_REQUIRED };
  }

  if (hasUploadedImage) {
    // Validate file size
    if (image.size > MAX_FILE_SIZE) {
      return { message: ERROR_MESSAGES.IMAGE_TOO_LARGE };
    }
    
    // Validate file type
    if (!image.type || !ALLOWED_IMAGE_TYPES.includes(image.type)) {
      return { message: ERROR_MESSAGES.INVALID_IMAGE_TYPE };
    }
  }

  const meal = {
    title: title.trim(),
    summary: summary.trim(),
    instructions: instructions.trim(),
    image,
    imagePath: '',
    creator: creator.trim(),
    creator_email: creatorEmail.trim(),
  };

  if (hasGeneratedImage) {
    try {
      meal.imagePath = await persistGeneratedImage(generatedImagePath, meal.title);
    } catch {
      return { message: 'Unable to save generated image. Please try uploading an image instead.' };
    }
  }

  try {
    await saveMeal(meal);
  } catch (error) {
    const errorMessage = error.message === 'Failed to upload image to cloud storage.'
      ? 'Unable to upload image. Please check your internet connection.'
      : 'Unable to save meal. Please try again.';
    return { message: errorMessage };
  }

  revalidatePath('/meals');
  redirect('/meals?success=true');
}
