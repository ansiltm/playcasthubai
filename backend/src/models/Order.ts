import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem {
  productId?: mongoose.Types.ObjectId | string;
  name?: string;
  price: number;
  quantity: number;
  Product?: any;
}

export interface IOrder extends Document {
  id: string;
  orderNumber: string;
  userId: mongoose.Types.ObjectId | string;
  orderType: 'online' | 'custom';
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'completed' | 'cancelled';
  paymentMethod: string;
  paymentStatus: string;
  shippingAddressLine1?: string;
  shippingAddressLine2?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingPincode?: string;
  OrderItems: IOrderItem[];
  User?: any;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product' },
    name: { type: String },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    Product: { type: Schema.Types.Mixed },
  },
  { _id: true }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    orderType: { type: String, enum: ['online', 'custom'], default: 'online' },
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'shipped', 'delivered', 'completed', 'cancelled'],
      default: 'pending',
    },
    paymentMethod: { type: String, default: 'COD' },
    paymentStatus: { type: String, default: 'pending' },
    shippingAddressLine1: { type: String, default: '' },
    shippingAddressLine2: { type: String, default: '' },
    shippingCity: { type: String, default: '' },
    shippingState: { type: String, default: '' },
    shippingPincode: { type: String, default: '' },
    OrderItems: { type: [OrderItemSchema], default: [] },
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

OrderSchema.pre('save', function () {
  if (!this.orderNumber) {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomStr = Math.floor(1000 + Math.random() * 9000).toString();
    this.orderNumber = `ORD-${dateStr}-${randomStr}`;
  }
});

export const Order = mongoose.model<IOrder>('Order', OrderSchema);
export default Order;
