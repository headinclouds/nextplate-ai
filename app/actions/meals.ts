'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';

import { persistGeneratedMealImage } from '@/lib/meal-images';
import { saveMeal } from '@/lib/meals';
import { generateMealImage as requestMealImage } from '@/lib/pollinations';
import { checkRateLimit } from '@/lib/rate-limit';
import { validateMealDetails, validateMealImage } from '@/lib/meal-validation';
import {
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  RATE_LIMIT_MAX_REQUESTS,
  RATE_LIMIT_WINDOW_MS,
} from '@/lib/constants';
import { getCurrentSession } from '@/lib/auth';

export async function generateMealImage(prevState, formData) {
  const createImageState = (message, imagePath) => ({
    message,
    imagePath,
    requestId: Date.now(),
  });

  // Rate limiting: prevent API abuse
  const ip = headers().get('x-forwarded-for') || headers().get('x-real-ip') || 'unknown';
  const rateLimit = checkRateLimit(
    `ai-generation:${ip}`,
    RATE_LIMIT_MAX_REQUESTS,
    RATE_LIMIT_WINDOW_MS,
  );

  if (!rateLimit.success) {
    const resetTime = rateLimit.resetTime.toLocaleTimeString();
    return createImageState(
      `Too many requests. Please try again after ${resetTime}.`,
      prevState?.imagePath || '',
    );
  }

  const title = formData.get('title');
  const summary = formData.get('summary');

  if (
    typeof title !== 'string' ||
    typeof summary !== 'string' ||
    !title.trim() ||
    !summary.trim()
  ) {
    return createImageState(ERROR_MESSAGES.REQUIRED_FIELDS, prevState?.imagePath || '');
  }

  try {
    const imageDataUrl = await requestMealImage(title, summary);
    return createImageState(SUCCESS_MESSAGES.IMAGE_GENERATED, imageDataUrl);
  } catch (error) {
    console.error('Image generation error:', error);

    return createImageState(
      'Unable to generate image. Please check your internet connection and try again.',
      prevState?.imagePath || '',
    );
  }
}

export async function shareMeal(prevState, formData) {
  const session = await getCurrentSession();
  if (!session) {
    return { message: 'Please log in to share a meal.' };
  }

  const title = formData.get('title');
  const summary = formData.get('summary');
  const instructions = formData.get('instructions');
  const image = formData.get('image');
  const generatedImage = formData.get('generatedImage');
  const creator = session.user.name;
  const creatorEmail = session.user.email;

  const detailsError = validateMealDetails(title, summary, instructions, creator, creatorEmail);
  if (detailsError) {
    return { message: detailsError };
  }

  const imageError = validateMealImage(image, generatedImage);
  if (imageError) {
    return { message: imageError };
  }

  const hasGeneratedImage = typeof generatedImage === 'string' && generatedImage.trim() !== '';
  const generatedImagePath = typeof generatedImage === 'string' ? generatedImage.trim() : '';

  const meal = {
    title: title.trim(),
    summary: summary.trim(),
    instructions: instructions.trim(),
    image: image instanceof File ? image : undefined,
    imagePath: '',
    creator: creator.trim(),
    creator_email: creatorEmail.trim(),
  };

  if (hasGeneratedImage) {
    try {
      meal.imagePath = await persistGeneratedMealImage(generatedImagePath, meal.title);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === 'Cloudinary is not configured in production environment.'
      ) {
        return {
          message:
            'Image storage is not configured on the server. Add Cloudinary environment variables and redeploy.',
        };
      }

      return { message: 'Unable to save generated image. Please try uploading an image instead.' };
    }
  }

  try {
    await saveMeal(meal);
  } catch (error) {
    const errorMessage =
      error instanceof Error &&
      error.message === 'Cloudinary is not configured in production environment.'
        ? 'Image storage is not configured on the server. Add Cloudinary environment variables and redeploy.'
        : error instanceof Error && error.message === 'Failed to upload image to cloud storage.'
          ? 'Unable to upload image. Please check your internet connection.'
          : 'Unable to save meal. Please try again.';
    return { message: errorMessage };
  }

  revalidatePath('/meals');
  redirect('/meals?success=true');
}
