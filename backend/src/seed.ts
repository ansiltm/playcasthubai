import sequelize from './config/database';
import { User, Product } from './models';
import bcrypt from 'bcryptjs';

async function seed() {
  await sequelize.sync({ force: true });
  console.log('Database synced & cleared.');

  // Create Super Admin
  const hashedPass = await bcrypt.hash('admin123', 10);
  await User.create({
    name: 'Super Admin',
    email: 'admin@playcasthub.com',
    password: hashedPass,
    role: 'admin'
  });

  // Dummy Data
  await Product.bulkCreate([
    {
      name: 'Traxxas X-Maxx 8S 4WD Brushless',
      description: 'The ultimate RC monster truck. 50+ MPH right out of the box with 8S LiPo power.',
      category: 'Vehicles & Remote-Controlled (RC)',
      grade: 'Hobby-Grade',
      price: 1099.99,
      stock: 5,
      media: [
        'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&q=80&w=1200',
        'https://www.w3schools.com/html/mov_bbb.mp4'
      ]
    },
    {
      name: 'Hot Wheels 1:64 Ford Mustang',
      description: 'Classic diecast model of the iconic Ford Mustang. Perfect for collectors.',
      category: 'Vehicles & Remote-Controlled (RC)',
      grade: 'Toy-Grade',
      price: 4.99,
      stock: 120,
      media: [
        'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?auto=format&fit=crop&q=80&w=1200'
      ]
    }
  ]);

  console.log('Seeded database!');
  process.exit(0);
}

seed();
