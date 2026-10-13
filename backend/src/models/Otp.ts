import mongoose, { Schema, Document } from 'mongoose';

export interface IOtp extends Document {
  email: string;
  otp: string;
  purpose: 'register' | 'forgot_password';
  createdAt: Date;
}

const OtpSchema = new Schema<IOtp>(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    otp: { type: String, required: true, trim: true },
    purpose: { type: String, enum: ['register', 'forgot_password'], required: true },
    createdAt: { type: Date, default: Date.now, expires: 600 }, // Expire after 10 minutes (600 seconds)
  },
  {
    timestamps: false,
  }
);

// Fast compound index for email and purpose lookups
OtpSchema.index({ email: 1, purpose: 1 });

export const Otp = mongoose.model<IOtp>('Otp', OtpSchema);
export default Otp;
