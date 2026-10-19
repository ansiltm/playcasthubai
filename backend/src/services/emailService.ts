import nodemailer, { Transporter } from 'nodemailer';
import { consumeLimit } from '../middleware/rateLimit';
import { HttpError } from '../utils/validation';

export interface EmailOptions { to: string; subject: string; html: string; }

let cachedTransporterKey = '';
let cachedTransporter: Transporter | null = null;

function getSmtpTransporter() {
  const host = process.env.BREVO_SMTP_SERVER || process.env.SMTP_HOST || 'smtp-relay.brevo.com';
  const port = Number(process.env.BREVO_SMTP_PORT || process.env.SMTP_PORT || 587);
  const user = process.env.BREVO_SMTP_USER || process.env.SMTP_USER;
  const pass = process.env.BREVO_SMTP_KEY || process.env.SMTP_PASS;
  
  if (!user || !pass) return null;
  const key = `${host}:${port}:${user}:${pass}`;
  if (!cachedTransporter || cachedTransporterKey !== key) {
    cachedTransporterKey = key;
    cachedTransporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      tls: { rejectUnauthorized: false }
    });
  }
  return cachedTransporter;
}

export async function sendTransactionalEmail({ to, subject, html }: EmailOptions): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY;
  const sender = process.env.EMAIL_FROM || process.env.ADMIN_FROM_EMAIL || 'playcasthub@gmail.com';

  const configuredLimit = Number(process.env.EMAIL_DAILY_LIMIT || 250);
  const dailyLimit = Number.isSafeInteger(configuredLimit) && configuredLimit > 0 ? Math.min(configuredLimit, 250) : 250;
  await consumeLimit('email:daily', dailyLimit, 86400000);

  // If a Brevo REST API key is configured (or in unit tests)
  if (apiKey && (apiKey === 'test-only' || apiKey.startsWith('xkeysib-'))) {
    if (!sender) throw new HttpError(503, 'Email is not configured yet. Please contact the store.');
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': apiKey, 'Content-Type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({ sender: { name: 'PlayCastHub', email: sender }, to: [{ email: to }], subject, htmlContent: html }),
      signal: AbortSignal.timeout(12000),
    });
    if (!response.ok) throw new HttpError(503, 'Email delivery is temporarily unavailable. Please try again later.');
    return;
  }

  // Otherwise use Brevo SMTP Relay via nodemailer
  const transporter = getSmtpTransporter();
  if (!transporter) throw new HttpError(503, 'Email is not configured yet. Please contact the store.');

  try {
    await transporter.sendMail({
      from: `"PlayCastHub" <${sender}>`,
      to,
      subject,
      html
    });
  } catch (error: any) {
    console.error('SMTP sending error:', error.message);
    throw new HttpError(503, 'Email delivery is temporarily unavailable. Please try again later.');
  }
}
