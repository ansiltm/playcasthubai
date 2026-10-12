import sequelize from './config/database';
import { Product, OrderItem, CartItem } from './models';
import { Op } from 'sequelize';

const allowedNames = [
  'RC JCB Excavator',
  'Pioneer 4WD Rock Climber',
  'LUMO Action Truck (Cargo / Garbage Truck)',
  '3D Off-Road SUV',
  'Classic 1970 Dodge Charger R/T RC Car',
  'RC Police Truck',
  'ToyBoi Monster Rover (Range Rover)',
  'RC Rally Spray Drift Car',
  '5 CH RC Excavator',
  'RC Wheel Loader (Front Loader)',
  'RC Heavy Dumper Truck',
  'Small Duck Track Toy',
  'RC Rock Off Hauler Truck (Cars Container Truck)',
  '4WD Amphibious Waterproof RC Car',
  'ENOZE Wild Hunt 1:20 RC Racing Car',
  'Wild Ride 1:20 RC High Speed Car',
  'Simulated Alloy Sports Car (Set of 20)',
  'RC Multi-Functional Drift Spray Car',
  '1:14 5-Channel RC Excavator (8094E)',
  'Diecast Collection Mini Off-Road Vehicles (Suzuki Jimny 1:64)',
  'Land Rover Defender 90 RC Toy',
  'MN-91 Land Rover Defender Mini Crawler',
  'Thar Roxx Diecast',
  'M416 Toy Blaster',
  'Interactive Steering Wheel Toy (Sound & Light)',
];

async function cleanup() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    // Find all products that are NOT in allowedNames
    const dummyProducts = await Product.findAll({
      where: {
        name: {
          [Op.notIn]: allowedNames,
        },
      },
    });

    console.log(`Found ${dummyProducts.length} dummy products to remove:`);
    for (const p of dummyProducts) {
      console.log(`- ID: ${p.id} | ${p.name}`);
    }

    if (dummyProducts.length > 0) {
      const dummyIds = dummyProducts.map(p => p.id);

      // Clean up CartItems referencing dummy products
      const deletedCartItems = await CartItem.destroy({
        where: {
          productId: {
            [Op.in]: dummyIds,
          },
        },
      });
      console.log(`Removed ${deletedCartItems} CartItems associated with dummy products.`);

      // Clean up OrderItems referencing dummy products (if any test orders used them)
      const deletedOrderItems = await OrderItem.destroy({
        where: {
          productId: {
            [Op.in]: dummyIds,
          },
        },
      });
      console.log(`Removed ${deletedOrderItems} OrderItems associated with dummy products.`);

      // Delete the dummy products
      const deletedProducts = await Product.destroy({
        where: {
          id: {
            [Op.in]: dummyIds,
          },
        },
      });
      console.log(`Successfully deleted ${deletedProducts} dummy products!`);
    } else {
      console.log('No dummy products found to delete.');
    }

    const remaining = await Product.findAll({ order: [['id', 'ASC']] });
    console.log(`\nRemaining products in database (${remaining.length}):`);
    remaining.forEach((p, idx) => {
      console.log(`${idx + 1}. [ID: ${p.id}] ${p.name} - ₹${p.price} (Cost: ₹${p.wholesalePrice})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Cleanup error:', error);
    process.exit(1);
  }
}

cleanup();
