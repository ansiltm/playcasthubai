import multer from 'multer';
import cloudinary from '../config/cloudinary';
import { HttpError } from '../utils/validation';
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024, files: 4, fields: 25, fieldSize: 20000 },
  fileFilter: (_req, file, callback) => {
    if (!['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm'].includes(file.mimetype)) return callback(new HttpError(400, 'Use JPG, PNG, WebP, GIF, MP4 or WebM files.'));
    callback(null, true);
  },
});
export function uploadToCloudinary(file: Express.Multer.File): Promise<string> {
  if (!process.env.CLOUDINARY_API_SECRET || !process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) throw new HttpError(503, 'Media uploads are not configured yet.');
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder: 'playcasthub_products', resource_type: file.mimetype.startsWith('video/') ? 'video' : 'image' }, (error, result) => {
      if (error || !result?.secure_url) return reject(new HttpError(502, 'Media upload failed. Please try again.'));
      resolve(result.secure_url);
    });
    stream.end(file.buffer);
  });
}
