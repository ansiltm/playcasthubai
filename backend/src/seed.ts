import sequelize from './config/database';
import { User, Product } from './models';
import bcrypt from 'bcryptjs';
import { catalog } from './seedInventory';

async function seed() {
  await sequelize.sync({ force: true });
  console.log('Database synced & cleared.');

  // Create Super Admin
  const hashedPass = await bcrypt.hash('admin123', 10);
  await User.create({
    name: 'Super Admin',
    email: 'admin@playcasthub.com',
    password: hashedPass,
    role: 'admin',
    phone: '9876543210'
  });

  // Seed exclusively the 25 official products from Excel catalog
  for (const item of catalog) {
    await Product.create(item);
  }

  const total = await Product.count();
  console.log(`Seeding complete. Exactly ${total} official products seeded.`);
  process.exit(0);
}

if (require.main === module) {
  seed();
}

export default seed;
