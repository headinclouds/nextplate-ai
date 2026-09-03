'use server';

import { v2 as cloudinary } from 'cloudinary';
import fs from 'node:fs';
import path from 'node:path';

const isProduction = process.env.NODE_ENV === 'production';
const hasCloudinaryConfig =
  Boolean(process.env.CLOUDINARY_CLOUD_NAME) &&
  Boolean(process.env.CLOUDINARY_API_KEY) &&
  Boolean(process.env.CLOUDINARY_API_SECRET);

// Configure Cloudinary (only in production)
if (isProduction && hasCloudinaryConfig) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

/**
 * Upload image to Cloudinary with automatic optimization
 */
async function uploadToCloudinary(
  buffer: Buffer,
  filename: string,
  mimeType: string,
): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'foodies-meals',
        public_id: filename.replace(/\.[^/.]+$/, ''), // Remove extension
        transformation: [
          { width: 1200, height: 1200, crop: 'limit' }, // Max 1200x1200
          { quality: 'auto:good' }, // Automatic quality
          { fetch_format: 'auto' }, // Auto WebP/AVIF
        ],
        resource_type: 'image',
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(new Error('Failed to upload image to cloud storage.'));
        } else if (result?.secure_url) {
          resolve(result.secure_url);
        } else {
          reject(new Error('Cloudinary upload returned no URL.'));
        }
      },
    );

    uploadStream.end(buffer);
  });
}

/**
 * Upload image to local filesystem (fallback for development)
 */
async function uploadToLocal(buffer: Buffer, filename: string): Promise<string> {
  const imagesDir = path.join(process.cwd(), 'public', 'images');
  const localImagePath = path.join(imagesDir, filename);

  fs.mkdirSync(imagesDir, { recursive: true });

  try {
    fs.writeFileSync(localImagePath, buffer);
    return `/images/${filename}`;
  } catch (error) {
    throw new Error('Failed to store image locally.');
  }
}

/**
 * Main upload function - automatically chooses storage provider
 * Can be extended to support AWS S3, Vercel Blob, etc.
 */
export async function uploadImage(
  buffer: Buffer,
  filename: string,
  mimeType: string,
): Promise<string> {
  // In production, require Cloudinary so uploads persist and do not rely on local FS.
  if (isProduction) {
    if (!hasCloudinaryConfig) {
      throw new Error('Cloudinary is not configured in production environment.');
    }

    return await uploadToCloudinary(buffer, filename, mimeType);
  }

  // Fallback to local storage for development
  return await uploadToLocal(buffer, filename);
}

/**
 * Future: Add AWS S3 support
 * Uncomment and install @aws-sdk/client-s3 when ready
 */
/*
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

async function uploadToS3(buffer, filename, mimeType) {
  const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: `meals/${filename}`,
    Body: buffer,
    ContentType: mimeType,
    ACL: 'public-read',
  });

  await s3Client.send(command);
  return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/meals/${filename}`;
}

// Then in uploadImage function, add:
// if (process.env.AWS_S3_BUCKET) {
//   return await uploadToS3(buffer, filename, mimeType);
// }
*/
