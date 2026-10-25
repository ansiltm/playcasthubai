import mongoose from 'mongoose';
import { randomUUID } from 'crypto';
const itemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true }, price: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 1, max: 99 }, Product: mongoose.Schema.Types.Mixed,
  color: { type: String, default: '' },
});
const schema = new mongoose.Schema({
  orderNumber: { type: String, unique: true, default: () => `PCH-${randomUUID().slice(0, 18).toUpperCase()}` },
  checkoutKey: { type: String, unique: true, sparse: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  orderType: { type: String, enum: ['online', 'custom'], default: 'online' },
  totalAmount: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['pending','confirmed','shipped','delivered','completed','cancelled'], default: 'pending' },
  paymentMethod: { type: String, default: 'COD' },
  paymentStatus: { type: String, enum: ['pending','paid'], default: 'pending' },
  customerName: String, customerPhone: String, customerEmail: String,
  notes: { type: String, default: '' },
  shippingAddressLine1: String, shippingAddressLine2: String, shippingCity: String, shippingState: String, shippingPincode: String,
  stockRestored: { type: Boolean, default: false },
  OrderItems: { type: [itemSchema], default: [] },
}, { timestamps: true, optimisticConcurrency: true, toJSON: { virtuals: true, transform: (_, ret: any) => { ret.id = ret._id.toString(); delete ret.__v; delete ret.checkoutKey; return ret; } } });
export const Order = mongoose.model('Order', schema);
export default Order;

