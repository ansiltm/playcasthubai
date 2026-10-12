import { Router, Response } from 'express';
import { Order, OrderItem, Product, User } from '../models';
import { authenticate, authorizeAdmin } from '../middleware/auth';

import { sendAdminOrderEmailAlert } from '../services/adminEmailAlert';

const router = Router();

// Create order directly from frontend payload
router.post('/', authenticate, async (req: any, res: Response) => {
  try {
    const { items, addressLine1, addressLine2, city, state, pincode, phone, name } = req.body;
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

    // Update user default address and phone if provided
    const user = await User.findByPk(req.user.id);
    if (user) {
      const updateData: any = {};
      if (addressLine1) updateData.addressLine1 = addressLine1;
      if (addressLine2) updateData.addressLine2 = addressLine2;
      if (city) updateData.city = city;
      if (state) updateData.state = state;
      if (pincode) updateData.pincode = pincode;
      if (phone) updateData.phone = phone;
      if (Object.keys(updateData).length > 0) {
        await user.update(updateData);
      }
    }

    // Create Order (COD / Confirmation by call)
    const order = await Order.create({ 
      userId: req.user.id, 
      totalAmount, 
      status: 'pending',
      paymentMethod: 'COD',
      paymentStatus: 'pending',
      shippingAddressLine1: addressLine1 || null,
      shippingAddressLine2: addressLine2 || null,
      shippingCity: city || null,
      shippingState: state || null,
      shippingPincode: pincode || null
    });
    
    // Create items and deduct stock
    const orderedItemsSummary: Array<{ name: string; quantity: number; price: number }> = [];
    for (const item of items) {
      const product = await Product.findByPk(item.productId);
      if (product) {
        await OrderItem.create({ orderId: order.id, productId: item.productId, quantity: item.quantity, price: product.price });
        await product.update({ stock: product.stock - item.quantity });
        orderedItemsSummary.push({
          name: product.name,
          quantity: item.quantity,
          price: product.price,
        });
      }
    }

    // Send Order Notification Email to Admin ONLY (Asynchronously)
    const customerPhone = phone || user?.phone || 'N/A';
    const customerName = name || user?.name || 'Customer';
    sendAdminOrderEmailAlert({
      orderNumber: order.orderNumber,
      customerName,
      customerPhone,
      customerEmail: user?.email,
      totalAmount,
      shippingAddress: {
        addressLine1,
        addressLine2,
        city,
        state,
        pincode,
      },
      items: orderedItemsSummary,
    }).catch(err => console.error('Admin order email alert error:', err));
    
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Create manual order (Admin only)
router.post('/manual', authenticate, authorizeAdmin, async (req: any, res: Response) => {
  try {
    const { productId, quantity, price, items, customerName, customerPhone, customerAddress, status } = req.body;
    
    // Normalize items list
    let orderItemsInput: Array<{ productId: number; quantity: number; price?: number }> = [];
    if (Array.isArray(items) && items.length > 0) {
      orderItemsInput = items;
    } else if (productId && quantity) {
      orderItemsInput = [{ productId: parseInt(productId), quantity: parseInt(quantity), price: price ? parseFloat(price) : undefined }];
    } else {
      return res.status(400).json({ message: 'Missing order items' });
    }

    let calculatedTotal = 0;
    const validatedItems: Array<{ product: Product; quantity: number; price: number }> = [];

    for (const it of orderItemsInput) {
      const product = await Product.findByPk(it.productId);
      if (!product) {
        return res.status(404).json({ message: `Product ${it.productId} not found` });
      }
      if (product.stock < it.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name} (Stock: ${product.stock})` });
      }
      const actualPrice = it.price !== undefined ? parseFloat(it.price.toString()) : product.price;
      calculatedTotal += actualPrice * it.quantity;
      validatedItems.push({ product, quantity: it.quantity, price: actualPrice });
    }

    // Create Order
    const order = await Order.create({
      userId: req.user.id,
      totalAmount: calculatedTotal,
      status: status || 'confirmed',
      paymentMethod: 'Custom / Cash',
      paymentStatus: 'paid',
      shippingAddressLine1: customerAddress || 'Custom Real-time Order',
    });

    const summaryItems: Array<{ name: string; quantity: number; price: number }> = [];

    // Create OrderItems & deduct stock
    for (const v of validatedItems) {
      await OrderItem.create({
        orderId: order.id,
        productId: v.product.id,
        quantity: v.quantity,
        price: v.price,
      });
      await v.product.update({ stock: v.product.stock - v.quantity });
      summaryItems.push({
        name: v.product.name,
        quantity: v.quantity,
        price: v.price,
      });
    }

    // Trigger Admin Email Alert
    sendAdminOrderEmailAlert({
      orderNumber: order.orderNumber,
      customerName: customerName || 'Custom Real-time Order',
      customerPhone: customerPhone || 'N/A',
      totalAmount: calculatedTotal,
      shippingAddress: {
        addressLine1: customerAddress || 'Direct Custom Order',
      },
      items: summaryItems,
    }).catch(err => console.error('Manual order email error:', err));

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
        { model: User, attributes: ['id', 'name', 'email', 'phone', 'addressLine1', 'addressLine2', 'city', 'state', 'pincode'] }
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
