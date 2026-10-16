import mongoose from 'mongoose';
export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export function text(value: unknown, label: string, max = 200, required = true): string {
  if (value === undefined && !required) return '';
  if (typeof value !== 'string' || value.trim().length > max || (required && !value.trim())) throw new HttpError(400, `Please provide a valid ${label}.`);
  return value.trim();
}
export function email(value: unknown): string {
  const result = text(value, 'email address', 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result)) throw new HttpError(400, 'Please provide a valid email address.');
  return result;
}
export function password(value: unknown): string {
  if (typeof value !== 'string' || value.length < 8 || Buffer.byteLength(value) > 72) throw new HttpError(400, 'Use a password with at least 8 characters and at most 72 bytes.');
  return value;
}
export function objectId(value: unknown): string {
  if (typeof value !== 'string' || !mongoose.isObjectIdOrHexString(value)) throw new HttpError(400, 'Invalid record ID.');
  return value;
}
export function quantity(value: unknown): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 1 || value > 99) throw new HttpError(400, 'Quantity must be a whole number between 1 and 99.');
  return value;
}
export function money(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 10000000) throw new HttpError(400, 'Invalid price.');
  return Math.round(value * 100) / 100;
}
export function phone(value: unknown): string {
  const result = text(value, '10-digit Indian phone number', 10);
  if (!/^[6-9]\d{9}$/.test(result)) throw new HttpError(400, 'Enter a valid 10-digit Indian phone number.');
  return result;
}
export function escapeHtml(value: unknown): string {
  return String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]!));
}
