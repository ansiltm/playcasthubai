import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  id: string;
  name: string;
  description: string;
  category: string;
  grade: string;
  ageLabel: string;
  safetyNotes: string;
  price: number;
  wholesalePrice: number;
  stock: number;
  imageUrl?: string;
  media: string[];
  colors: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true, trim: true },
    ageLabel: { type: String, default: 'Not specified', enum: ['Not specified','3+','6+','8+','14+','18+'] },
    safetyNotes: { type: String, default: '' },
    grade: { type: String, default: 'Toy-Grade', trim: true },
    price: { type: Number, required: true, min: 0 },
    wholesalePrice: { type: Number, default: 0, min: 0 },
    stock: { type: Number, required: true, default: 0, min: 0 },
    imageUrl: { type: String, default: '' },
    media: { type: [String], default: [] },
    colors: { type: [String], default: [] },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_, ret: any) => {
        ret.id = ret._id.toString();
        delete ret.__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// Search index for fast text searches
ProductSchema.index({ name: 'text', description: 'text', category: 'text' });

export const Product = mongoose.model<IProduct>('Product', ProductSchema);
export default Product;
