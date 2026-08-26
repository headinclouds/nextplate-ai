// Configuration constants for the application

// File Upload
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Rate Limiting
export const RATE_LIMIT_MAX_REQUESTS = 15;
export const RATE_LIMIT_WINDOW_MS = 3600000; // 1 hour

// Pagination
export const DEFAULT_PAGE_SIZE = 12;
export const MAX_PAGE_SIZE = 50;

// Input Validation
export const MAX_TITLE_LENGTH = 200;
export const MAX_SUMMARY_LENGTH = 500;
export const MAX_INSTRUCTIONS_LENGTH = 10000;
export const MAX_NAME_LENGTH = 100;

// Image Dimensions
export const MAX_IMAGE_WIDTH = 1200;
export const MAX_IMAGE_HEIGHT = 1200;

// Messages
export const SUCCESS_MESSAGES = {
  MEAL_SHARED: '🎉 Your meal has been shared successfully!',
  IMAGE_GENERATED: 'AI image generated. Apply it and submit to save permanently.',
};

export const ERROR_MESSAGES = {
  REQUIRED_FIELDS: 'Please fill in all required fields correctly.',
  IMAGE_REQUIRED: 'Please pick an image or generate one with AI.',
  IMAGE_TOO_LARGE: 'Image must be under 5MB.',
  INVALID_IMAGE_TYPE: 'Image must be JPEG, PNG, or WebP format.',
  TITLE_TOO_LONG: 'Title must be under 200 characters.',
  SUMMARY_TOO_LONG: 'Summary must be under 500 characters.',
  INSTRUCTIONS_TOO_LONG: 'Instructions must be under 10,000 characters.',
  NAME_TOO_LONG: 'Name must be under 100 characters.',
  RATE_LIMIT_EXCEEDED: 'Too many requests. Please try again later.',
  UPLOAD_FAILED: 'Unable to upload image. Please check your internet connection.',
  SAVE_FAILED: 'Unable to save meal. Please try again.',
  GENERATION_FAILED: 'Unable to generate image. Please check your internet connection and try again.',
};
