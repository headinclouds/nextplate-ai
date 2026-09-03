import 'server-only';

import slugify from 'slugify';

import { uploadImage } from './storage';

export async function persistGeneratedMealImage(dataUrl: string, title: string): Promise<string> {
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) {
    throw new Error('Invalid generated image format.');
  }

  const mimeType = match[1];
  const base64Data = match[2];
  const extensionMap: Record<string, string> = {
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

  return uploadImage(buffer, fileName, mimeType);
}
