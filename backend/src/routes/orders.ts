import { Router, Response } from 'express';
import { Order, Product, User } from '../models';
import { authenticate, authorizeAdmin } from '../middleware/auth';
import { sendAdminOrderEmailAlert } from '../services/adminEmailAlert';

const router = Router();

// Create order directly from frontend payload
router.post('/', authenticate, async (req: any, res: Response) => {
  try {
    const { items, addressLine1, addressLine2, city, state, pincode, phone, name } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Order is empty' });
    }

    let calculatedTotal = 0;
    const validatedItems: Array<{ product: any; quantity: number; price: number }> = [];

    // Verify stock and calculate total
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.productId} not found` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name} (Stock: ${product.stock})` });
      }
      const price = product.price;
      calculatedTotal += price * item.quantity;
      validatedItems.push({ product, quantity: item.quantity, price });
    }

    // Update user default contact info if available
    const user = await User.findById(req.user.id);
    if (user) {
      if (addressLine1) user.addressLine1 = addressLine1;
      if (addressLine2) user.addressLine2 = addressLine2;
      if (city) user.city = city;
      if (state) user.state = state;
      if (pincode) user.pincode = pincode;
      if (phone) user.phone = phone;
      await user.save();
    }

    const orderItemsData = validatedItems.map(v => ({
      productId: v.product._id,
      name: v.product.name,
      price: v.price,
      quantity: v.quantity,
      Product: {
        id: v.product.id,
        name: v.product.name,
        media: v.product.media,
        imageUrl: v.product.imageUrl || v.product.media?.[0],
        price: v.product.price,
        wholesalePrice: v.product.wholesalePrice,
      },
    }));

    // Create Order
    const order = await Order.create({
      userId: req.user.id,
      orderType: 'online',
      totalAmount: calculatedTotal,
      status: 'pending',
      paymentMethod: 'COD',
      paymentStatus: 'pending',
      shippingAddressLine1: addressLine1 || '',
      shippingAddressLine2: addressLine2 || '',
      shippingCity: city || '',
      shippingState: state || '',
      shippingPincode: pincode || '',
      OrderItems: orderItemsData,
    });

    // Deduct stock
    for (const v of validatedItems) {
      v.product.stock = Math.max(0, v.product.stock - v.quantity);
      await v.product.save();
    }

    // Trigger Admin Email Alert asynchronously
    const summaryItems = validatedItems.map(v => ({
      name: v.product.name,
      quantity: v.quantity,
      price: v.price,
    }));

    sendAdminOrderEmailAlert({
      orderNumber: order.orderNumber,
      customerName: name || user?.name || 'Customer',
      customerPhone: phone || user?.phone || 'N/A',
      customerEmail: user?.email,
      totalAmount: calculatedTotal,
      shippingAddress: {
        addressLine1,
        addressLine2,
        city,
        state,
        pincode,
      },
      items: summaryItems,
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

    let orderItemsInput: Array<{ productId: string; quantity: number; price?: number }> = [];
    if (Array.isArray(items) && items.length > 0) {
      orderItemsInput = items;
    } else if (productId && quantity) {
      orderItemsInput = [{
        productId: productId.toString(),
        quantity: parseInt(quantity),
        price: price ? parseFloat(price) : undefined,
      }];
    } else {
      return res.status(400).json({ message: 'Missing order items' });
    }

    let calculatedTotal = 0;
    const validatedItems: Array<{ product: any; quantity: number; price: number }> = [];

    for (const it of orderItemsInput) {
      const product = await Product.findById(it.productId);
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

    const orderItemsData = validatedItems.map(v => ({
      productId: v.product._id,
      name: v.product.name,
      price: v.price,
      quantity: v.quantity,
      Product: {
        id: v.product.id,
        name: v.product.name,
        media: v.product.media,
        imageUrl: v.product.imageUrl || v.product.media?.[0],
        price: v.product.price,
        wholesalePrice: v.product.wholesalePrice,
      },
    }));

    const order = await Order.create({
      userId: req.user.id,
      orderType: 'custom',
      totalAmount: calculatedTotal,
      status: status || 'pending',
      paymentMethod: 'Custom / Cash',
      paymentStatus: 'paid',
      shippingAddressLine1: customerAddress || 'Custom Real-time Order',
      OrderItems: orderItemsData,
    });

    // Deduct stock
    for (const v of validatedItems) {
      v.product.stock = Math.max(0, v.product.stock - v.quantity);
      await v.product.save();
    }

    const summaryItems = validatedItems.map(v => ({
      name: v.product.name,
      quantity: v.quantity,
      price: v.price,
    }));

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

// GET user orders
router.get('/', authenticate, async (req: any, res: Response) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// GET all orders (Admin only)
router.get('/all', authenticate, authorizeAdmin, async (req: any, res: Response) => {
  try {
    const rawOrders = await Order.find()
      .populate('userId', 'id name email phone addressLine1 addressLine2 city state pincode')
      .lean();

    const formattedOrders = rawOrders.map((o: any) => ({
      ...o,
      id: o._id.toString(),
      User: o.userId || null,
    }));

    // Sort pending orders first, and ascending by order date
    formattedOrders.sort((a: any, b: any) => {
      const aPending = a.status === 'pending';
      const bPending = b.status === 'pending';
      if (aPending && !bPending) return -1;
      if (!aPending && bPending) return 1;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    res.json(formattedOrders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Update order status (Admin)
router.put('/:id/status', authenticate, authorizeAdmin, async (req: any, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const { status } = req.body;
    order.status = status;
    await order.save();

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Delete order (Admin)
router.delete('/:id', authenticate, authorizeAdmin, async (req: any, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Restore stock if not cancelled
    if (order.status !== 'cancelled' && Array.isArray(order.OrderItems)) {
      for (const item of order.OrderItems) {
        if (item.productId) {
          const product = await Product.findById(item.productId);
          if (product) {
            product.stock += item.quantity;
            await product.save();
          }
        }
      }
    }

    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

export default router;
