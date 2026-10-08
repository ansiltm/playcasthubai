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
      category: 'RC',
      grade: 'Hobby Grade',
      price: 1099.99,
      stock: 5,
      images: ['https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&q=80&w=1200'],
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      model3dUrl: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb'
    },
    {
      name: 'Hot Wheels 1:64 Ford Mustang',
      description: 'Classic diecast model of the iconic Ford Mustang. Perfect for collectors.',
      category: 'Diecast',
      grade: 'Toy Grade',
      price: 4.99,
      stock: 120,
      images: ['https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?auto=format&fit=crop&q=80&w=1200'],
      videoUrl: '',
      model3dUrl: ''
    },
    {
      name: 'Maisto 1:18 Lamborghini Aventador',
      description: 'Highly detailed 1:18 scale diecast model with opening doors and trunk.',
      category: 'Diecast',
      grade: 'Semi Toy Grade',
      price: 45.00,
      stock: 25,
      images: ['https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=1200'],
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      model3dUrl: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb'
    },
    {
      name: 'Wltoys 144001 4WD Buggy',
      description: 'Affordable hobby-grade RC buggy. Metal chassis, 60km/h top speed.',
      category: 'RC',
      grade: 'Hobby Grade',
      price: 99.99,
      stock: 40,
      images: ['https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&q=80&w=1200'],
      videoUrl: '',
      model3dUrl: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb'
    }
  ]);

  console.log('Seeded database!');
  process.exit(0);
}

seed();
