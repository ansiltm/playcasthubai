import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  id: string;
  tokenVersion: number;
  name: string;
  email: string;
  emailVerified: boolean;
  password?: string;
  phone?: string;
  role: 'admin' | 'user';
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    tokenVersion: { type: Number, default: 0 },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    emailVerified: { type: Boolean, default: false },
    password: { type: String, required: true },
    phone: { type: String, default: '' },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
    addressLine1: { type: String, default: '' },
    addressLine2: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    pincode: { type: String, default: '' },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_, ret: any) => {
        ret.id = ret._id.toString();
        delete ret.__v;
        delete ret.password;
        delete ret.tokenVersion;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

export const User = mongoose.model<IUser>('User', UserSchema);
export default User;
