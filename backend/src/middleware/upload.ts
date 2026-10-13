import multer from 'multer';
import cloudinary from '../config/cloudinary';

// Store incoming files in memory for fast direct streaming to Cloudinary
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size
  },
});

/**
 * Uploads a file buffer from Multer directly to Cloudinary CDN
 */
export const uploadToCloudinary = (
  file: Express.Multer.File,
  folder: string = 'playcasthub_products'
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const isVideo = file.mimetype ? file.mimetype.startsWith('video') : false;
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: isVideo ? 'video' : 'auto',
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        if (!result?.secure_url) {
          return reject(new Error('Cloudinary upload returned no secure URL'));
        }
        resolve(result.secure_url);
      }
    );
    uploadStream.end(file.buffer);
  });
};
