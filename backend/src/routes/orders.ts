import { Router, Response } from 'express';
import { Order, OrderItem, Cart, CartItem, Product } from '../models';
import { authenticate, authorizeAdmin } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, async (req: any, res: Response) => {
  try {
    const cart = await Cart.findOne({ where: { userId: req.user.id }, include: [{ model: CartItem, include: [Product] }] });
    if (!cart || !cart.CartItems || cart.CartItems.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }
    let totalAmount = 0;
    for (const item of cart.CartItems) {
      const product = item.Product as any;
      if (product) {
        totalAmount += product.price * item.quantity;
      }
    }
    const order = await Order.create({ userId: req.user.id, totalAmount, status: 'pending' });
    for (const item of cart.CartItems) {
      const product = item.Product as any;
      if (product) {
        await OrderItem.create({ orderId: order.id, productId: item.productId, quantity: item.quantity, price: product.price });
      }
    }
    await CartItem.destroy({ where: { cartId: cart.id } });
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

router.get('/', authenticate, async (req: any, res: Response) => {
  try {
    const orders = await Order.findAll({ where: { userId: req.user.id }, include: [OrderItem] });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

router.get('/all', authenticate, authorizeAdmin, async (req: any, res: Response) => {
  try {
    const orders = await Order.findAll({ include: [OrderItem] });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

export default router;
