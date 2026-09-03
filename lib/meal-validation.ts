import {
  ALLOWED_IMAGE_TYPES,
  ERROR_MESSAGES,
  MAX_FILE_SIZE,
  MAX_INSTRUCTIONS_LENGTH,
  MAX_NAME_LENGTH,
  MAX_SUMMARY_LENGTH,
  MAX_TITLE_LENGTH,
} from './constants';

function isNonEmptyText(value: FormDataEntryValue | null): value is string {
  return typeof value === 'string' && value.trim() !== '';
}

export function validateMealDetails(
  title: FormDataEntryValue | null,
  summary: FormDataEntryValue | null,
  instructions: FormDataEntryValue | null,
  creator: string,
  creatorEmail: string,
): string | null {
  if (
    !isNonEmptyText(title) ||
    !isNonEmptyText(summary) ||
    !isNonEmptyText(instructions) ||
    !creator.trim() ||
    !creatorEmail.includes('@')
  ) {
    return ERROR_MESSAGES.REQUIRED_FIELDS;
  }

  if (title.trim().length > MAX_TITLE_LENGTH) {
    return ERROR_MESSAGES.TITLE_TOO_LONG;
  }
  if (summary.trim().length > MAX_SUMMARY_LENGTH) {
    return ERROR_MESSAGES.SUMMARY_TOO_LONG;
  }
  if (instructions.trim().length > MAX_INSTRUCTIONS_LENGTH) {
    return ERROR_MESSAGES.INSTRUCTIONS_TOO_LONG;
  }
  if (creator.trim().length > MAX_NAME_LENGTH) {
    return ERROR_MESSAGES.NAME_TOO_LONG;
  }

  return null;
}

export function validateMealImage(
  image: FormDataEntryValue | null,
  generatedImage: FormDataEntryValue | null,
): string | null {
  const hasGeneratedImage = typeof generatedImage === 'string' && generatedImage.trim() !== '';
  const hasUploadedImage = image instanceof File && image.size > 0;

  if (!hasGeneratedImage && !hasUploadedImage) {
    return ERROR_MESSAGES.IMAGE_REQUIRED;
  }

  if (hasUploadedImage) {
    if (image.size > MAX_FILE_SIZE) {
      return ERROR_MESSAGES.IMAGE_TOO_LARGE;
    }

    if (!ALLOWED_IMAGE_TYPES.includes(image.type)) {
      return ERROR_MESSAGES.INVALID_IMAGE_TYPE;
    }
  }

  return null;
}
