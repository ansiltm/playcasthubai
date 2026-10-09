import { Router, Response } from 'express';
import { Order, OrderItem, Product, User } from '../models';
import { authenticate, authorizeAdmin } from '../middleware/auth';

import nodemailer from 'nodemailer';

const router = Router();

// Helper to send order confirmation email
const sendConfirmationEmail = async (userEmail: string, orderNumber: string, amount: number) => {
  try {
    const testAccount = await nodemailer.createTestAccount();
    const transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, 
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    const info = await transporter.sendMail({
      from: '"PlaycastHub" <orders@playcasthub.com>',
      to: userEmail,
      subject: `Order Confirmation - ${orderNumber}`,
      html: `<h2>Thank you for your order!</h2>
             <p>Your order <strong>${orderNumber}</strong> has been successfully placed.</p>
             <p>Total Amount: ₹${amount.toFixed(2)}</p>
             <p>We will notify you when it ships!</p>`,
    });

    console.log("Email Message sent: %s", info.messageId);
    console.log("Email Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (err) {
    console.error("Email sending failed:", err);
  }
};

// Create order directly from frontend payload
router.post('/', authenticate, async (req: any, res: Response) => {
  try {
    const { items, paymentMethod, paymentStatus, latitude, longitude } = req.body;
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
    const order = await Order.create({ 
      userId: req.user.id, 
      totalAmount, 
      status: paymentMethod === 'online' ? 'confirmed' : 'pending',
      paymentMethod: paymentMethod || 'COD',
      paymentStatus: paymentStatus || 'pending',
      latitude: latitude || null,
      longitude: longitude || null
    });
    
    // Create items and deduct stock
    for (const item of items) {
      const product = await Product.findByPk(item.productId);
      if (product) {
        await OrderItem.create({ orderId: order.id, productId: item.productId, quantity: item.quantity, price: product.price });
        await product.update({ stock: product.stock - item.quantity });
      }
    }

    // Send order confirmation email asynchronously
    sendConfirmationEmail(req.user.email, order.orderNumber, totalAmount);
    
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Create manual order (Admin only)
router.post('/manual', authenticate, authorizeAdmin, async (req: any, res: Response) => {
  try {
    const { productId, quantity, price } = req.body;
    
    if (!productId || !quantity) {
      return res.status(400).json({ message: 'Missing product or quantity' });
    }

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
    }

    const actualPrice = price ? parseFloat(price) : product.price;
    const totalAmount = actualPrice * quantity;

    // Create Order (assign to admin's ID since they created it on behalf of someone)
    const order = await Order.create({ userId: req.user.id, totalAmount, status: 'confirmed' });
    
    await OrderItem.create({ orderId: order.id, productId: product.id, quantity: quantity, price: actualPrice });
    await product.update({ stock: product.stock - quantity });
    
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
    const orders = await Order.findAll({ 
      include: [
        { 
          model: OrderItem,
          include: [{ model: Product, attributes: ['id', 'name', 'images'] }]
        },
        { model: User, attributes: ['id', 'name', 'email', 'phone', 'address', 'pincode'] }
      ],
      order: [['createdAt', 'DESC']]
    });
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

// Delete order (Admin)
router.delete('/:id', authenticate, authorizeAdmin, async (req: any, res: Response) => {
  try {
    const order = await Order.findByPk(req.params.id, { include: [OrderItem] });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Optionally restore stock if cancelled/deleted
    if (order.status !== 'cancelled') {
      const items = await OrderItem.findAll({ where: { orderId: order.id } });
      for (const item of items) {
        const product = await Product.findByPk(item.productId);
        if (product) {
          await product.update({ stock: product.stock + item.quantity });
        }
      }
    }
    
    await order.destroy();
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

export default router;
