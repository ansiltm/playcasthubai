import { Router, Response } from 'express';
import { Order, OrderItem, Product } from '../models';
import { authenticate, authorizeAdmin } from '../middleware/auth';

const router = Router();

// Create order directly from frontend payload
router.post('/', authenticate, async (req: any, res: Response) => {
  try {
    const { items } = req.body; // Array of { productId, quantity, price }
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Order is empty' });
    }

    let totalAmount = 0;
    
    // Verify stock and calculate total
    for (const item of items) {
      const product = await Product.findByPk(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.productId} not found` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }
      totalAmount += product.price * item.quantity;
    }

    // Create Order
    const order = await Order.create({ userId: req.user.id, totalAmount, status: 'pending' });
    
    // Create items and deduct stock
    for (const item of items) {
      const product = await Product.findByPk(item.productId);
      if (product) {
        await OrderItem.create({ orderId: order.id, productId: item.productId, quantity: item.quantity, price: product.price });
        await product.update({ stock: product.stock - item.quantity });
      }
    }
    
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

// Update order status (Admin)
router.put('/:id/status', authenticate, authorizeAdmin, async (req: any, res: Response) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    const { status } = req.body;
    await order.update({ status });
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

export default router;
