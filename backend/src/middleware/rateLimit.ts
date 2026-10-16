import { createHash } from 'crypto';
import RateLimit from '../models/RateLimit';
import { HttpError } from '../utils/validation';
import { asyncRoute } from '../utils/http';
export async function consumeLimit(key: string, max: number, milliseconds: number) {
  const window = Math.floor(Date.now() / milliseconds);
  const id = createHash('sha256').update(`${key}:${window}`).digest('hex');
  let bucket;
  try {
    bucket = await RateLimit.findOneAndUpdate({ _id: id }, { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date((window + 1) * milliseconds) } }, { upsert: true, new: true });
  } catch (error: any) {
    if (error.code !== 11000) throw error;
    bucket = await RateLimit.findByIdAndUpdate(id, { $inc: { count: 1 } }, { new: true });
  }
  if (!bucket || bucket.count > max) throw new HttpError(429, 'Too many attempts. Please wait and try again.');
}
export function rateLimit(scope: string, max: number, milliseconds: number) {
  return (req: any, res: any, next: any) => consumeLimit(`${scope}:${req.ip}`, max, milliseconds).then(() => next()).catch(next);
}
