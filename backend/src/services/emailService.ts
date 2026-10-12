import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';

dotenv.config();

// Initialize SendGrid API key from environment
const apiKey = process.env.SENDGRID_API_KEY || '';
if (apiKey && apiKey !== 'SG.your_actual_api_key_here') {
  sgMail.setApiKey(apiKey);
}

// Configurable sender email address with fallback placeholder
const DEFAULT_FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'no-reply@playcasthub.com';

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  from?: string;
}

/**
 * Reusable asynchronous function to send transactional emails via Twilio SendGrid
 * @param {EmailOptions} options - Email destination, subject, and body content
 * @returns {Promise<any>} - SendGrid response or throws error
 */
export const sendTransactionalEmail = async ({
  to,
  subject,
  text,
  html,
  from = DEFAULT_FROM_EMAIL,
}: EmailOptions): Promise<any> => {
  try {
    // If the API key was updated at runtime or lazily set
    const currentApiKey = process.env.SENDGRID_API_KEY || '';
    if (currentApiKey && currentApiKey !== 'SG.your_actual_api_key_here') {
      sgMail.setApiKey(currentApiKey);
    } else {
      console.warn('[SendGrid] SENDGRID_API_KEY is not configured with a valid key. Email sending simulated.');
      return { simulated: true, to, subject };
    }

    const msg = {
      to,
      from, // Verified sender email in SendGrid
      subject,
      text: text || (html ? html.replace(/<[^>]+>/g, '') : ''),
      html: html || text || '',
    };

    const response = await sgMail.send(msg);
    console.log(`[SendGrid] Transactional email successfully sent to: ${to}`);
    return response;
  } catch (error: any) {
    console.error('[SendGrid] Error sending transactional email:', {
      message: error?.message,
      code: error?.code,
      response: error?.response?.body || error?.response,
    });
    throw error;
  }
};

export default {
  sendTransactionalEmail,
};
