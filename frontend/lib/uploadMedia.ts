import axios from 'axios';
import api from './api';

export async function uploadProductMedia(file: File): Promise<string> {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime'];
  if (!allowed.includes(file.type) || file.size > 8 * 1024 * 1024) throw new Error('Use JPG, PNG, WebP, GIF, MP4, WebM or MOV files under 8 MB.');
  const { data } = await api.post('/products/media/sign');
  const body = new FormData();
  body.append('file', file);
  body.append('api_key', data.apiKey);
  body.append('signature', data.signature);
  for (const [key, value] of Object.entries(data.params)) body.append(key, String(value));
  // Deliberately use a separate client: never send the store's login token to Cloudinary.
  const response = await axios.post(`https://api.cloudinary.com/v1_1/${encodeURIComponent(data.cloudName)}/${file.type.startsWith('video/') ? 'video' : 'image'}/upload`, body, { timeout: 120000 });
  if (!response.data?.secure_url) throw new Error('Upload did not return an image URL. Please try again.');
  return response.data.secure_url;
}
