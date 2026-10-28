import { Router } from 'express';
import mongoose from 'mongoose';
import { Order, Product, User } from '../models';
import { authenticate, optionalAuthenticate, authorizeAdmin } from '../middleware/auth';
import { rateLimit } from '../middleware/rateLimit';
import { asyncRoute } from '../utils/http';
import * as v from '../utils/validation';
import { sendOrderEmails } from '../services/orderEmails';
import { resolveProductColor } from '../utils/productColor';
const router = Router();
export function customerOrder(order: any) {
  const result = typeof order.toJSON === 'function' ? order.toJSON() : { ...order };
  delete result.notes; delete result.checkoutKey; delete result.stockRestored;
  result.OrderItems = result.OrderItems.map((item: any) => ({ ...item, color: item.color || '', Product: item.Product ? { id: item.Product.id, name: item.Product.name, imageUrl: item.Product.imageUrl, media: item.Product.media, price: item.price, colors: item.Product.colors } : undefined }));
  return result;
}
async function createOrder(req: any, manual: boolean) {
  const input = req.body;
  if (!Array.isArray(input.items) || !input.items.length || input.items.length > 50) throw new v.HttpError(400, 'Choose between 1 and 50 products.');
  const seen = new Set<string>();
  const items = input.items.map((item: any) => {
    const productId = v.objectId(item?.productId);
    const color = item.color ? v.text(item.color, 'color', 50, false) : '';
    const itemKey = `${productId}:${color}`;
    if (seen.has(itemKey)) throw new v.HttpError(400, 'A product line may appear only once in an order.');
    seen.add(itemKey);
    return { productId, color, quantity: v.quantity(item.quantity), customPrice: manual && item.price !== undefined ? v.money(item.price) : undefined };
  });
  const customerEmail = manual ? '' : v.email(req.user?.email || input.email);
  const name = v.text(manual ? input.customerName : input.name, 'customer name', 100);
  const phone = v.phone(manual ? input.customerPhone : input.phone);
  const address = v.text(manual ? input.customerAddress : input.addressLine1, 'address', 300);
  const city = manual ? '' : v.text(input.city, 'city', 100);
  const state = manual ? '' : v.text(input.state, 'state', 100);
  const pincode = manual ? '' : v.text(input.pincode, 'pincode', 6);
  if (!manual && !/^\d{6}$/.test(pincode)) throw new v.HttpError(400, 'Enter a six-digit pincode.');
  const requestKey = v.text(req.header('Idempotency-Key'), 'checkout reference', 80);
  if (!/^[a-zA-Z0-9-]{16,80}$/.test(requestKey)) throw new v.HttpError(400, 'Invalid checkout reference.');
  const checkoutKey = `${req.user?.id || 'guest'}:${requestKey}`;
  const previous = await Order.findOne({ checkoutKey });
  if (previous) return { order: previous, created: false };
  const initialStatus = manual ? (input.status || 'pending') : 'pending';
  if (!['pending','confirmed','shipped','delivered','completed'].includes(initialStatus)) throw new v.HttpError(400, 'Invalid initial order status.');
  try {
    const order = await mongoose.connection.transaction(async session => {
      const orderItems = [];
      let totalCents = 0;
      for (const item of items) {
        const product = await Product.findOneAndUpdate({ _id: item.productId, stock: { $gte: item.quantity } }, { $inc: { stock: -item.quantity } }, { session, new: true });
        if (!product) throw new v.HttpError(409, 'A product is unavailable or has insufficient stock. Please update your cart.');
        const color = resolveProductColor(product, item.color, manual);
        const selectedMedia = product.colorMedia?.find(entry => entry.color.trim().toLowerCase() === color.toLowerCase())?.media;
        const media = selectedMedia?.length ? selectedMedia : product.media;
        const price = item.customPrice ?? product.price;
        totalCents += Math.round(price * 100) * item.quantity;
        orderItems.push({ productId: product._id, name: product.name, color, price, quantity: item.quantity, Product: { id: product.id, name: product.name, price, wholesalePrice: product.wholesalePrice, media, imageUrl: media.find(url => !url.includes('/video/upload/') && !/\.(mp4|webm|mov|ogg)(\?|$)/i.test(url)) || (selectedMedia?.length ? '' : product.imageUrl), colors: product.colors } });
      }
      const [created] = await Order.create([{
        checkoutKey, userId: req.user?.id || null, orderType: manual ? 'custom' : 'online', totalAmount: totalCents / 100,
        status: initialStatus, paymentMethod: manual ? 'Custom / Cash' : 'COD', paymentStatus: 'pending',
        customerName: name, customerPhone: phone, customerEmail,
        shippingAddressLine1: address, shippingAddressLine2: manual ? '' : v.text(input.addressLine2, 'address line 2', 300, false),
        shippingCity: city, shippingState: state, shippingPincode: pincode, OrderItems: orderItems,
      }], { session });
      if (!manual && req.user) await User.updateOne({ _id: req.user.id }, { $set: { phone, addressLine1: address, addressLine2: created.shippingAddressLine2, city, state, pincode } }, { session });
      return created;
    });
    return { order, created: true };
  } catch (error: any) {
    if (error.code === 11000) {
      const existing = await Order.findOne({ checkoutKey });
      if (existing) return { order: existing, created: false };
    }
    throw error;
  }
}
router.post('/', rateLimit('checkout', 20, 3600000), optionalAuthenticate, asyncRoute(async (req, res) => {
  const { order, created } = await createOrder(req, false);
  if (created) void sendOrderEmails(order);
  res.status(created ? 201 : 200).json(customerOrder(order));
}));
// Guest access ends here. Order history and every management route remain private.
router.use(authenticate);
router.post('/manual', authorizeAdmin, asyncRoute(async (req, res) => {
  const { order, created } = await createOrder(req, true);
  if (created) void sendOrderEmails(order);
  res.status(created ? 201 : 200).json(order);
}));
router.get('/', asyncRoute(async (req, res) => {
  if (req.user.emailVerified === true) {
    await Order.updateMany({ userId: null, orderType: 'online', customerEmail: v.email(req.user.email) }, { $set: { userId: req.user.id } });
  }
  const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
  res.json(orders.map(customerOrder));
}));
router.get('/all', authorizeAdmin, asyncRoute(async (_req, res) => {
  const orders = await Order.find().populate('userId', 'name email phone').sort({ createdAt: -1 });
  res.json(orders.map(order => ({ ...order.toJSON(), User: order.userId })));
}));
const transitions: Record<string, string[]> = {
  pending: ['confirmed','cancelled'], confirmed: ['shipped','completed','cancelled'],
  shipped: ['delivered'], delivered: ['completed'], completed: [], cancelled: [],
};
async function updateOrder(req: any, fields: string[]) {
  const id = v.objectId(req.params.id);
  let changedStatus = false;
  const result = await mongoose.connection.transaction(async session => {
    changedStatus = false;
    const order = await Order.findById(id).session(session);
    if (!order) throw new v.HttpError(404, 'Order not found.');
    if (fields.includes('status') && req.body.status !== undefined && req.body.status !== order.status) {
      const status = req.body.status;
      if (!transitions[order.status]?.includes(status)) throw new v.HttpError(400, `Cannot change ${order.status} to ${String(status)}.`);
      if (status === 'cancelled' && !order.stockRestored) {
        for (const item of order.OrderItems) await Product.updateOne({ _id: item.productId }, { $inc: { stock: item.quantity } }, { session });
        order.stockRestored = true;
      }
      order.status = status; changedStatus = true;
    }
    if (fields.includes('paymentStatus') && req.body.paymentStatus !== undefined) {
      if (!['pending','paid'].includes(req.body.paymentStatus)) throw new v.HttpError(400, 'Invalid payment status.');
      order.paymentStatus = req.body.paymentStatus;
    }
    if (fields.includes('notes') && req.body.notes !== undefined) order.notes = v.text(req.body.notes, 'notes', 2000, false);
    await order.save({ session });
    return order;
  });
  if (changedStatus) void sendOrderEmails(result, true);
  return result;
}
for (const [path, fields] of [['/:id/status',['status']], ['/:id/payment-status',['paymentStatus']], ['/:id/notes',['notes']], ['/:id',['status','paymentStatus','notes']]] as [string, string[]][]) {
  router.put(path, authorizeAdmin, asyncRoute(async (req, res) => res.json(await updateOrder(req, fields))));
}
router.delete('/:id', authorizeAdmin, asyncRoute(async (req, res) => {
  const id = v.objectId(req.params.id);
  await mongoose.connection.transaction(async session => {
    const order = await Order.findById(id).session(session);
    if (!order) throw new v.HttpError(404, 'Order not found.');
    if (order.status !== 'cancelled') throw new v.HttpError(400, 'Only cancelled orders can be deleted. Keep completed orders for your sales records.');
    await order.deleteOne({ session });
  });
  res.json({ message: 'Cancelled order deleted.' });
}));
export default router;

