import { Request, Response, NextFunction } from 'express';
import { HttpError } from './validation';
export const asyncRoute = (fn: (req: any, res: Response) => Promise<unknown>) => (req: Request, res: Response, next: NextFunction) => { Promise.resolve(fn(req, res)).catch(next); };
export function errorHandler(error: any, _req: Request, res: Response, _next: NextFunction) {
  if (error instanceof HttpError) return res.status(error.status).json({ message: error.message });
  if (error.code === 11000) return res.status(409).json({ message: 'This record already exists. Refresh and try again.' });
  if (error.name === 'ValidationError' || error.name === 'CastError' || error.name === 'MulterError') return res.status(400).json({ message: 'Please check the submitted fields or upload size.' });
  console.error('Request failed:', error.name || 'Error');
  return res.status(500).json({ message: 'Something went wrong. Please try again.' });
}
