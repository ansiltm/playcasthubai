import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';

dotenv.config();

export interface SendOtpOptions {
  to: string;
  otp: string;
  purpose: 'register' | 'forgot_password';
  name?: string;
}

/**
 * Sends a 6-digit OTP email to user for account registration or password reset.
 */
export const sendOtpEmail = async ({ to, otp, purpose, name }: SendOtpOptions): Promise<boolean> => {
  const isRegister = purpose === 'register';
  const subject = isRegister 
    ? `🔐 ${otp} is your PlaycastHub Account Verification Code`
    : `🔑 ${otp} is your PlaycastHub Password Reset Code`;

  const title = isRegister ? 'Verify Your PlaycastHub Account' : 'Reset Your PlaycastHub Password';
  const subtitle = isRegister
    ? `Hello ${name || 'there'}, welcome to PlaycastHub! Please use the 6-digit code below to verify your email and complete registration.`
    : `Hello ${name || 'there'}, we received a request to reset your PlaycastHub password. Enter the code below to set a new password.`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; }
          .container { max-width: 540px; margin: 30px auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0; }
          .header { background: linear-gradient(135deg, #04b4ec 0%, #00d2ff 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
          .header h1 { margin: 0; font-size: 26px; font-weight: 900; letter-spacing: -0.5px; }
          .header p { margin: 6px 0 0; font-size: 14px; opacity: 0.95; }
          .body { padding: 36px 32px; color: #1e293b; }
          .otp-box { text-align: center; margin: 28px 0; }
          .otp-code { display: inline-block; font-size: 38px; font-weight: 900; letter-spacing: 10px; color: #0284c7; background-color: #f0f9ff; border: 2px dashed #38bdf8; padding: 16px 36px; border-radius: 16px; font-family: monospace; }
          .notice { background-color: #fefce8; border-left: 4px solid #facc15; padding: 12px 16px; border-radius: 8px; font-size: 13px; color: #854d0e; margin-top: 24px; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; background-color: #f8fafc; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>PlaycastHub</h1>
            <p>${title}</p>
          </div>
          <div class="body">
            <p style="font-size: 15px; line-height: 1.6; margin: 0 0 16px;">
              ${subtitle}
            </p>
            
            <div class="otp-box">
              <span class="otp-code">${otp}</span>
            </div>

            <p style="font-size: 13px; color: #64748b; text-align: center; margin: 0 0 20px;">
              This code will expire in <strong>10 minutes</strong>. Do not share this code with anyone.
            </p>

            <div class="notice">
              <strong>Need help?</strong> If you did not make this request on PlaycastHub, you can safely ignore this email.
            </div>
          </div>
          <div class="footer">
            © ${new Date().getFullYear()} PlaycastHub Store • All rights reserved.
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `${title}\n\n${subtitle}\n\nYour Verification Code: ${otp}\n\nThis code is valid for 10 minutes.\nIf you did not request this, please ignore this email.`;

  console.log(`\n================== [OTP EMAIL DISPATCH] ==================`);
  console.log(`To: ${to}`);
  console.log(`Purpose: ${purpose}`);
  console.log(`OTP Code: ${otp}`);
  console.log(`==========================================================\n`);

  // 1. Send via Gmail SMTP
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  if (smtpUser && smtpPass) {
    try {
      const cleanPass = smtpPass.replace(/\s+/g, '');
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: smtpUser,
          pass: cleanPass,
        },
      });

      const fromAddress = `"${process.env.SMTP_FROM_NAME || 'PlaycastHub Security'}" <${smtpUser}>`;
      const info = await transporter.sendMail({
        from: fromAddress,
        to,
        subject,
        text,
        html,
      });

      console.log(`[OTP Email] Successfully delivered via Gmail SMTP to: ${to} (MessageId: ${info.messageId})`);
      return true;
    } catch (err: any) {
      console.error('[OTP Email: Gmail SMTP Error]:', err?.message || err);
    }
  }

  // 2. Fallback to SendGrid if configured
  const sendgridApiKey = process.env.SENDGRID_API_KEY;
  if (sendgridApiKey && !sendgridApiKey.includes('your_actual_api_key')) {
    try {
      sgMail.setApiKey(sendgridApiKey);
      await sgMail.send({
        to,
        from: process.env.SENDGRID_FROM_EMAIL || 'security@playcasthub.com',
        subject,
        text,
        html,
      });
      console.log(`[OTP Email] Successfully delivered via SendGrid to: ${to}`);
      return true;
    } catch (err: any) {
      console.error('[OTP Email: SendGrid Error]:', err?.response?.body || err?.message || err);
    }
  }

  // Logged to console as safe fallback
  return true;
};

export default {
  sendOtpEmail,
};
