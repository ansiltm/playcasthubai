const sgMail = require('@sendgrid/mail');
require('dotenv').config();

// Initialize SendGrid API key from environment variable
const apiKey = process.env.SENDGRID_API_KEY || '';
if (apiKey && apiKey !== 'SG.your_actual_api_key_here') {
  sgMail.setApiKey(apiKey);
}

// Configurable sender email address (placeholder: update in .env or here)
const DEFAULT_FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'no-reply@playcasthub.com';

/**
 * Reusable asynchronous function to send transactional emails using SendGrid
 * @param {Object} params
 * @param {string} params.to - Recipient email address
 * @param {string} params.subject - Email subject line
 * @param {string} [params.text] - Plain text email body
 * @param {string} [params.html] - HTML formatted email body
 * @param {string} [params.from] - Sender email address (defaults to DEFAULT_FROM_EMAIL)
 * @returns {Promise<any>}
 */
const sendTransactionalEmail = async ({
  to,
  subject,
  text,
  html,
  from = DEFAULT_FROM_EMAIL,
}) => {
  try {
    const currentApiKey = process.env.SENDGRID_API_KEY || '';
    if (currentApiKey && currentApiKey !== 'SG.your_actual_api_key_here') {
      sgMail.setApiKey(currentApiKey);
    } else {
      console.warn('[SendGrid] SENDGRID_API_KEY is not configured with a valid key. Email simulated.');
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
    console.log(`[SendGrid] Transactional email sent to: ${to}`);
    return response;
  } catch (error) {
    console.error('[SendGrid] Failed to send email:', {
      message: error.message,
      code: error.code,
      response: error.response && error.response.body ? JSON.stringify(error.response.body, null, 2) : error.response,
    });
    throw error;
  }
};

module.exports = {
  sendTransactionalEmail,
};
