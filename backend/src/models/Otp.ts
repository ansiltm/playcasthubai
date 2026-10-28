import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  email: { type: String, required: true },
  purpose: { type: String, enum: ['register', 'forgot_password', 'verify_email'], required: true },
  hash: { type: String, required: true },
  attempts: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true },
});
schema.index({ email: 1, purpose: 1 }, { unique: true });
schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
export const Otp = mongoose.model('Otp', schema);
export default Otp;
