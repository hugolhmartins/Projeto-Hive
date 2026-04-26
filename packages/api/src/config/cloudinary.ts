import { v2 as cloudinary } from 'cloudinary';
import { env } from './env';

let configured = false;

function ensureConfigured() {
  if (configured) return;
  if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
    throw new Error('Cloudinary not configured — set CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET');
  }
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  configured = true;
}

export function isCloudinaryConfigured(): boolean {
  return !!(env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET);
}

/**
 * Upload an image buffer to Cloudinary and return the public secure URL.
 * folder: organisational prefix in Cloudinary (e.g. "openhive/instagram").
 */
export async function uploadBufferToCloudinary(
  buffer: Buffer,
  folder = 'openhive/instagram',
): Promise<string> {
  ensureConfigured();
  return new Promise<string>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error || !result) return reject(error || new Error('Cloudinary upload returned no result'));
        resolve(result.secure_url);
      },
    );
    stream.end(buffer);
  });
}
