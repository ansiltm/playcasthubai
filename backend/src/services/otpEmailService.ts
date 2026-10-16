import { sendTransactionalEmail } from './emailService';
export async function sendOtpEmail({ to, otp, purpose }: { to: string; otp: string; purpose: string }) {
  await sendTransactionalEmail({ to, subject: `Your PlayCastHub ${purpose === 'register' ? 'verification' : 'password reset'} code`, html: `<h2>PlayCastHub</h2><p>Your verification code is:</p><p style="font-size:32px;letter-spacing:6px"><strong>${otp}</strong></p><p>This code expires in 10 minutes. Do not share it. If you did not request this, ignore this email.</p>` });
}
