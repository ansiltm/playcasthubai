import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'spaw0nsv',
  api_key: process.env.CLOUDINARY_API_KEY || '816784522331676',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'WO_DZjnz7encpSVP0AtBDvjk6KQ',
  secure: true,
});

export default cloudinary;
