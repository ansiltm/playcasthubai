import sequelize from './config/database';
import { User, Product, Order, OrderItem } from './models';
import { sendAdminOrderEmailAlert } from './services/adminEmailAlert';

async function createRealtimeCustomOrder() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    // Find admin user or first user
    let user = await User.findOne({ where: { role: 'admin' } });
    if (!user) {
      user = await User.findOne();
    }
    const userId = user ? user.id : 1;

    // The 7 real-time custom items requested
    const customItemsData = [
      { name: 'LUMO Action Truck (Cargo / Garbage Truck)', quantity: 1, price: 1599.00 },
      { name: 'Small Duck Track Toy', quantity: 1, price: 350.00 },
      { name: 'ToyBoi Monster Rover (Range Rover)', quantity: 1, price: 1099.00 },
      { name: 'Simulated Alloy Sports Car (Set of 20)', quantity: 20, price: 130.00 },
      { name: 'Diecast Collection Mini Off-Road Vehicles (Suzuki Jimny 1:64)', quantity: 5, price: 120.00 },
      { name: 'Thar Roxx Diecast', quantity: 2, price: 499.00 },
      { name: 'Interactive Steering Wheel Toy (Sound & Light)', quantity: 1, price: 1199.00 },
    ];

    let totalAmount = 0;
    const resolvedItems: Array<{ product: any; quantity: number; price: number }> = [];

    for (const item of customItemsData) {
      const product = await Product.findOne({ where: { name: item.name } });
      if (!product) {
        throw new Error(`Product not found: ${item.name}`);
      }
      totalAmount += item.price * item.quantity;
      resolvedItems.push({ product, quantity: item.quantity, price: item.price });
    }

    console.log(`Calculated Total Amount: ₹${totalAmount.toFixed(2)} (Expected ₹8,445.00)`);

    // Create the Order
    const order = await Order.create({
      userId,
      totalAmount,
      status: 'confirmed',
      paymentMethod: 'Custom Order / Cash',
      paymentStatus: 'paid',
      shippingAddressLine1: 'Real-time Custom Order',
      shippingCity: 'Custom Order',
      shippingState: 'Kerala',
      shippingPincode: '682001'
    });

    const summaryItems: Array<{ name: string; quantity: number; price: number }> = [];

    // Create Order Items & deduct inventory stock
    for (const item of resolvedItems) {
      await OrderItem.create({
        orderId: order.id,
        productId: item.product.id,
        quantity: item.quantity,
        price: item.price,
      });

      await item.product.update({
        stock: Math.max(0, item.product.stock - item.quantity),
      });

      summaryItems.push({
        name: item.product.name,
        quantity: item.quantity,
        price: item.price,
      });
      console.log(`Added: ${item.product.name} x${item.quantity} @ ₹${item.price}`);
    }

    console.log(`\n✅ Custom Order successfully created! Order #${order.orderNumber || order.id}`);

    // Trigger Admin Notification Email Alert
    await sendAdminOrderEmailAlert({
      orderNumber: order.orderNumber || `ORD-${order.id}`,
      customerName: 'Custom Order (Real-Time)',
      customerPhone: user?.phone || '9876543210',
      customerEmail: user?.email,
      totalAmount,
      shippingAddress: {
        addressLine1: 'Real-time Custom Order',
        city: 'Custom Order',
        state: 'Kerala',
        pincode: '682001'
      },
      items: summaryItems,
    });

    console.log('✅ Admin order email alert sent to ansiltm5000@gmail.com');
    process.exit(0);
  } catch (error) {
    console.error('Error creating custom order:', error);
    process.exit(1);
  }
}

createRealtimeCustomOrder();
