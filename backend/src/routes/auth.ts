import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomInt } from 'crypto';
import mongoose from 'mongoose';
import { User, Otp } from '../models';
import { sendOtpEmail } from '../services/otpEmailService';
import { authenticate, jwtSecret } from '../middleware/auth';
import { consumeLimit, rateLimit } from '../middleware/rateLimit';
import { asyncRoute } from '../utils/http';
import * as v from '../utils/validation';
const router = Router();
router.use(rateLimit('auth', 40, 3600000));
const expiry = () => new Date(Date.now() + 600000);
function sessionResult(user: any) {
  const token = jwt.sign({ id: user.id, version: user.tokenVersion }, jwtSecret(), { expiresIn: '7d', algorithm: 'HS256' });
  return { token, user: user.toJSON() };
}
for (const [route, purpose] of [['/send-register-otp', 'register'], ['/forgot-password-otp', 'forgot_password']] as const) {
  router.post(route, asyncRoute(async (req, res) => {
    const email = v.email(req.body.email);
    await consumeLimit(`otp:${email}`, 1, 60000);
    await consumeLimit(`otp-hour:${email}`, 5, 3600000);
    const user = await User.findOne({ email });
    if ((purpose === 'register' && user) || (purpose === 'forgot_password' && !user)) return res.json({ message: 'If this email is eligible, a verification code will arrive shortly.' });
    const otp = randomInt(100000, 1000000).toString();
    const hash = await bcrypt.hash(otp, 10);
    const record = await Otp.findOneAndUpdate({ email, purpose }, { hash, attempts: 0, expiresAt: expiry() }, { upsert: true, new: true });
    try { await sendOtpEmail({ to: email, otp, purpose }); }
    catch (error) { await Otp.deleteOne({ _id: record._id, hash }); throw error; }
    res.json({ message: 'If this email is eligible, a verification code will arrive shortly.' });
  }));
}
async function verifyOtp(email: string, purpose: 'register' | 'forgot_password' | 'verify_email', input: unknown) {
  if (typeof input !== 'string' || !/^\d{6}$/.test(input)) throw new v.HttpError(400, 'Enter the six-digit code from your email.');
  const record = await Otp.findOneAndUpdate({ email, purpose, expiresAt: { $gt: new Date() }, attempts: { $lt: 5 } }, { $inc: { attempts: 1 } }, { new: true });
  if (!record || !(await bcrypt.compare(input, record.hash))) throw new v.HttpError(400, 'Invalid or expired code. Request a new code if needed.');
  return record;
}
router.post('/register', asyncRoute(async (req, res) => {
  const email = v.email(req.body.email);
  const name = v.text(req.body.name, 'name', 100);
  const phone = v.phone(req.body.phone);
  const hash = await bcrypt.hash(v.password(req.body.password), 12);
  const otp = await verifyOtp(email, 'register', req.body.otp);
  const user = await mongoose.connection.transaction(async session => {
    const consumed = await Otp.deleteOne({ _id: otp._id, hash: otp.hash, expiresAt: { $gt: new Date() } }, { session });
    if (!consumed.deletedCount) throw new v.HttpError(400, 'Code already used or expired.');
    const [created] = await User.create([{ email, name, phone, password: hash, role: 'user', emailVerified: true }], { session });
    return created;
  });
  res.status(201).json({ message: 'Account created successfully!', ...sessionResult(user) });
}));
router.post('/login', asyncRoute(async (req, res) => {
  const email = v.email(req.body.email);
  if (typeof req.body.password !== 'string' || req.body.password.length > 100) throw new v.HttpError(400, 'Invalid email or password.');
  await consumeLimit(`login:${email}`, 10, 900000);
  const user = await User.findOne({ email });
  if (!user?.password || !(await bcrypt.compare(req.body.password, user.password))) throw new v.HttpError(400, 'Invalid email or password.');
  res.json(sessionResult(user));
}));
router.post('/reset-password', asyncRoute(async (req, res) => {
  const email = v.email(req.body.email);
  const hash = await bcrypt.hash(v.password(req.body.newPassword), 12);
  const otp = await verifyOtp(email, 'forgot_password', req.body.otp);
  await mongoose.connection.transaction(async session => {
    const consumed = await Otp.deleteOne({ _id: otp._id, hash: otp.hash, expiresAt: { $gt: new Date() } }, { session });
    if (!consumed.deletedCount) throw new v.HttpError(400, 'Code already used or expired.');
    const user = await User.findOneAndUpdate({ email }, { $set: { password: hash, emailVerified: true }, $inc: { tokenVersion: 1 } }, { session });
    if (!user) throw new v.HttpError(400, 'Could not reset this account.');
  });
  res.json({ message: 'Password reset. Please sign in again.' });
}));
router.post('/send-email-verification', authenticate, asyncRoute(async (req, res) => {
  const email = v.email(req.user.email);
  await consumeLimit(`otp:${email}`, 1, 60000);
  await consumeLimit(`otp-hour:${email}`, 5, 3600000);
  const otp = randomInt(100000, 1000000).toString();
  const hash = await bcrypt.hash(otp, 10);
  const record = await Otp.findOneAndUpdate({ email, purpose: 'verify_email' }, { hash, attempts: 0, expiresAt: expiry() }, { upsert: true, new: true });
  try { await sendOtpEmail({ to: email, otp, purpose: 'register' }); }
  catch (error) { await Otp.deleteOne({ _id: record._id, hash }); throw error; }
  res.json({ message: 'Verification code sent to your account email.' });
}));
router.post('/verify-email', authenticate, asyncRoute(async (req, res) => {
  const email = v.email(req.user.email);
  const otp = await verifyOtp(email, 'verify_email', req.body.otp);
  const user = await mongoose.connection.transaction(async session => {
    const consumed = await Otp.deleteOne({ _id: otp._id, hash: otp.hash, expiresAt: { $gt: new Date() } }, { session });
    if (!consumed.deletedCount) throw new v.HttpError(400, 'Code already used or expired.');
    return User.findOneAndUpdate({ _id: req.user.id, email }, { $set: { emailVerified: true } }, { session, new: true });
  });
  if (!user) throw new v.HttpError(400, 'Account changed. Please sign in again.');
  res.json(sessionResult(user));
}));
export default router;
