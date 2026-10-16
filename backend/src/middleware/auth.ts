import jwt from 'jsonwebtoken';
import User from '../models/User';
import { asyncRoute } from '../utils/http';
import { HttpError } from '../utils/validation';
export function jwtSecret(): string {
  const value = process.env.JWT_SECRET;
  if (!value || value.length < 32) throw new Error('JWT_SECRET must contain at least 32 random characters.');
  return value;
}
async function resolveUser(req: any) {
  const header = req.header('Authorization');
  if (!header?.startsWith('Bearer ')) return null;
  let payload: jwt.JwtPayload;
  try { payload = jwt.verify(header.slice(7), jwtSecret(), { algorithms: ['HS256'] }) as jwt.JwtPayload; } catch { return null; }
  const user = await User.findById(payload.id).select('-password');
  if (!user || user.tokenVersion !== payload.version) return null;
  return user;
}
export const authenticate = (req: any, res: any, next: any) => {
  resolveUser(req).then(user => {
    if (!user) throw new HttpError(401, 'Please sign in to continue.');
    req.user = user; next();
  }).catch(next);
};
export const optionalAuthenticate = (req: any, res: any, next: any) => {
  resolveUser(req).then(user => { req.user = user; next(); }).catch(next);
};
export const authorizeAdmin = (req: any, res: any, next: any) => {
  if (req.user?.role !== 'admin') return next(new HttpError(403, 'Admin access required.'));
  next();
};
