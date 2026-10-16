import { consumeLimit } from '../middleware/rateLimit';
import { HttpError } from '../utils/validation';
export interface EmailOptions { to: string; subject: string; html: string; }
export async function sendTransactionalEmail({ to, subject, html }: EmailOptions): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY;
  const sender = process.env.EMAIL_FROM;
  if (!apiKey || !sender) throw new HttpError(503, 'Email is not configured yet. Please contact the store.');
  // Reserve capacity before sending. Keep a margin under Brevo's free daily allowance.
  const configuredLimit = Number(process.env.EMAIL_DAILY_LIMIT || 250);
  const dailyLimit = Number.isSafeInteger(configuredLimit) && configuredLimit > 0 ? Math.min(configuredLimit, 250) : 250;
  await consumeLimit('email:daily', dailyLimit, 86400000);
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': apiKey, 'Content-Type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({ sender: { name: 'PlayCastHub', email: sender }, to: [{ email: to }], subject, htmlContent: html }),
    signal: AbortSignal.timeout(12000),
  });
  if (!response.ok) throw new HttpError(503, 'Email delivery is temporarily unavailable. Please try again later.');
}
