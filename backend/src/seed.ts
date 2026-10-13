import { connectDatabase } from './config/database';
import { User, Product, Order } from './models';
import bcrypt from 'bcryptjs';
import { catalog } from './seedInventory';

async function seed() {
  try {
    await connectDatabase();
    console.log('MongoDB connected for seeding.');

    // 1. Create Super Admin
    const hashedPass = await bcrypt.hash('admin123', 10);
    let admin = await User.findOne({ email: 'admin@playcasthub.com' });
    if (!admin) {
      admin = await User.create({
        name: 'Super Admin',
        email: 'admin@playcasthub.com',
        password: hashedPass,
        role: 'admin',
        phone: '9876543210',
      });
      console.log('Super Admin created.');
    } else {
      admin.password = hashedPass;
      admin.role = 'admin';
      await admin.save();
      console.log('Super Admin updated.');
    }

    // 2. Seed the 25 official products
    const productMap = new Map();
    for (const item of catalog) {
      let prod = await Product.findOne({ name: item.name });
      if (prod) {
        Object.assign(prod, item);
        await prod.save();
      } else {
        prod = await Product.create(item);
      }
      productMap.set(item.name, prod);
    }
    const totalProducts = await Product.countDocuments();
    console.log(`Seeded ${totalProducts} official products in MongoDB.`);

    // 3. Seed the real-time custom order #ORD-20261012-1744
    const customItemsData = [
      { name: 'LUMO Action Truck (Cargo / Garbage Truck)', quantity: 1, price: 1599.00 },
      { name: 'Small Duck Track Toy', quantity: 1, price: 350.00 },
      { name: 'ToyBoi Monster Rover (Range Rover)', quantity: 1, price: 1099.00 },
      { name: 'Simulated Alloy Sports Car (Set of 20)', quantity: 20, price: 130.00 },
      { name: 'Diecast Collection Mini Off-Road Vehicles (Suzuki Jimny 1:64)', quantity: 5, price: 120.00 },
      { name: 'Thar Roxx Diecast', quantity: 2, price: 499.00 },
      { name: 'Interactive Steering Wheel Toy (Sound & Light)', quantity: 1, price: 1199.00 },
      { name: 'M416 Toy Blaster', quantity: 3, price: 850.00 },
      { name: 'Pioneer 4WD Rock Climber', quantity: 1, price: 1399.00 },
    ];

    const orderItems: any[] = [];
    let totalAmount = 0;

    for (const it of customItemsData) {
      const prod = productMap.get(it.name) || (await Product.findOne({ name: it.name }));
      if (prod) {
        totalAmount += it.price * it.quantity;
        orderItems.push({
          productId: prod._id,
          name: prod.name,
          price: it.price,
          quantity: it.quantity,
          Product: {
            id: prod.id,
            name: prod.name,
            media: prod.media,
            imageUrl: prod.imageUrl || prod.media?.[0],
            price: prod.price,
            wholesalePrice: prod.wholesalePrice,
          },
        });
      }
    }

    let existingOrder = await Order.findOne({ orderNumber: 'ORD-20261012-1744' });
    if (!existingOrder) {
      await Order.create({
        orderNumber: 'ORD-20261012-1744',
        userId: admin._id,
        orderType: 'custom',
        totalAmount,
        status: 'confirmed',
        paymentMethod: 'Custom Order / Cash',
        paymentStatus: 'paid',
        shippingAddressLine1: 'Real-time Custom Order',
        shippingCity: 'Custom Order',
        shippingState: 'Kerala',
        shippingPincode: '682001',
        OrderItems: orderItems,
      });
      console.log('Custom Order #ORD-20261012-1744 created in MongoDB.');
    } else {
      existingOrder.OrderItems = orderItems;
      existingOrder.totalAmount = totalAmount;
      await existingOrder.save();
      console.log('Custom Order #ORD-20261012-1744 updated with 9 items in MongoDB.');
    }

    console.log('All seeding successfully completed in MongoDB Atlas!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  seed();
}

export default seed;
