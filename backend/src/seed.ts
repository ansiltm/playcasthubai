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

  // Dummy Data (Massive Seed)
  await Product.bulkCreate([
    // RC & Vehicles
    {
      name: 'Traxxas X-Maxx 8S 4WD Brushless',
      description: 'The ultimate RC monster truck. 50+ MPH right out of the box with 8S LiPo power.',
      category: 'Vehicles & Remote-Controlled (RC)',
      grade: 'Hobby-Grade',
      price: 1099.99,
      wholesalePrice: 850.00,
      stock: 5,
      media: [
        'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&q=80&w=1200',
        'https://www.w3schools.com/html/mov_bbb.mp4'
      ]
    },
    {
      name: 'Hot Wheels 1:64 Ford Mustang GT',
      description: 'Classic diecast model of the iconic Ford Mustang. Perfect for collectors and casual play.',
      category: 'Vehicles & Remote-Controlled (RC)',
      grade: 'Toy-Grade',
      price: 4.99,
      wholesalePrice: 1.50,
      stock: 120,
      media: ['https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?auto=format&fit=crop&q=80&w=1200']
    },
    {
      name: 'DJI Mini 3 Pro Drone',
      description: 'Ultra-lightweight and foldable drone with 4K video recording and obstacle avoidance.',
      category: 'Vehicles & Remote-Controlled (RC)',
      grade: 'Semi-Hobby / Prosumer Grade',
      price: 759.00,
      wholesalePrice: 600.00,
      stock: 15,
      media: ['https://images.unsplash.com/photo-1579829366248-204fe8413f31?auto=format&fit=crop&q=80&w=1200']
    },
    {
      name: 'Autoart 1:18 Lamborghini Aventador',
      description: 'Exquisite 1:18 scale replica of the Aventador. Features opening doors, trunk, and hyper-realistic engine bay.',
      category: 'Vehicles & Remote-Controlled (RC)',
      grade: 'Collector-Grade / Display-Grade',
      price: 249.99,
      wholesalePrice: 190.00,
      stock: 3,
      media: ['https://images.unsplash.com/photo-1621539247185-337cb1017f9e?auto=format&fit=crop&q=80&w=1200']
    },
    // Action Figures
    {
      name: 'Marvel Legends Spider-Man 6" Figure',
      description: 'Highly articulated Spider-Man action figure from the Marvel Legends series. Includes interchangeable hands and web accessories.',
      category: 'Action Figures & Pop-Culture Collectibles',
      grade: 'Semi-Hobby / Prosumer Grade',
      price: 24.99,
      wholesalePrice: 12.00,
      stock: 45,
      media: ['https://images.unsplash.com/photo-1608889175250-c3b0c1667d3a?auto=format&fit=crop&q=80&w=1200']
    },
    {
      name: 'Bandai S.H.Figuarts Naruto Uzumaki',
      description: 'Premium collector action figure of Naruto with extreme articulation for dynamic anime poses.',
      category: 'Action Figures & Pop-Culture Collectibles',
      grade: 'Collector-Grade / Display-Grade',
      price: 59.99,
      wholesalePrice: 35.00,
      stock: 12,
      media: ['https://images.unsplash.com/photo-1596727147705-61a532a659bd?auto=format&fit=crop&q=80&w=1200']
    },
    // Model Kits
    {
      name: 'Tamiya 1/35 Panzer IV Tank Kit',
      description: 'Highly detailed unpainted plastic model kit of the WWII German Panzer IV.',
      category: 'Scale Model Kits & Hobby Crafts',
      grade: 'Hobby-Grade',
      price: 45.00,
      wholesalePrice: 28.00,
      stock: 20,
      media: ['https://images.unsplash.com/photo-1632389145617-640a23270921?auto=format&fit=crop&q=80&w=1200']
    },
    {
      name: 'Bandai Perfect Grade (PG) RX-78-2 Gundam',
      description: 'The ultimate Gunpla challenge. 1/60 scale RX-78-2 with internal mechanical skeleton and LED wiring.',
      category: 'Scale Model Kits & Hobby Crafts',
      grade: 'Artisan / Designer Grade',
      price: 299.99,
      wholesalePrice: 210.00,
      stock: 4,
      media: ['https://images.unsplash.com/photo-1618336753174-88981fbb4682?auto=format&fit=crop&q=80&w=1200']
    },
    // STEM & Smart
    {
      name: 'LEGO Technic Bugatti Chiron',
      description: 'Engineering marvel building set with 3,599 pieces, featuring a working W16 engine and 8-speed gearbox.',
      category: 'Building Sets & Construction Toys',
      grade: 'Hobby-Grade',
      price: 349.99,
      wholesalePrice: 270.00,
      stock: 8,
      media: ['https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?auto=format&fit=crop&q=80&w=1200']
    },
    {
      name: 'Sphero BOLT Coding Robot',
      description: 'App-enabled programmable robotic ball for STEM learning and interactive gaming.',
      category: 'Educational, STEM & STEAM Toys',
      grade: 'Institutional / Commercial Grade',
      price: 149.99,
      wholesalePrice: 95.00,
      stock: 30,
      media: ['https://images.unsplash.com/photo-1531746790731-6c087fecd65a?auto=format&fit=crop&q=80&w=1200']
    },
    // Plush & Games
    {
      name: 'Giant Snorlax 4ft Plush',
      description: 'Ultra-soft, massive 4-foot tall Pokémon Snorlax plush. Perfect for lounging and gaming setups.',
      category: 'Plush, Soft & Fabric Toys',
      grade: 'Semi-Hobby / Prosumer Grade',
      price: 120.00,
      wholesalePrice: 70.00,
      stock: 10,
      media: ['https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&q=80&w=1200']
    },
    {
      name: 'Catan Board Game - Base Set',
      description: 'The legendary strategy board game of trading, building, and settling.',
      category: 'Games & Puzzles',
      grade: 'Toy-Grade',
      price: 49.99,
      wholesalePrice: 25.00,
      stock: 50,
      media: ['https://images.unsplash.com/photo-1610890716171-6b1bb98ffaed?auto=format&fit=crop&q=80&w=1200']
    },
    {
      name: 'DJI RoboMaster S1',
      description: 'Advanced educational robot built to unlock the potential in every learner. Features omnidirectional movement and coding logic.',
      category: 'Electronic, Smart & Animatronic Toys',
      grade: 'Semi-Hobby / Prosumer Grade',
      price: 499.00,
      wholesalePrice: 380.00,
      stock: 6,
      media: ['https://images.unsplash.com/photo-1535223289827-42f1e9919769?auto=format&fit=crop&q=80&w=1200']
    },
    {
      name: 'NERF Pro Stryfe X Dart Blaster',
      description: 'High-performance semi-auto blaster firing specialized half-length darts at 150 FPS.',
      category: 'Outdoor, Sports & Active Play',
      grade: 'Semi-Hobby / Prosumer Grade',
      price: 129.99,
      wholesalePrice: 85.00,
      stock: 25,
      media: ['https://images.unsplash.com/photo-1614214589255-b4fb6c17290d?auto=format&fit=crop&q=80&w=1200']
    }
  ]);

  console.log('Seeded massive dummy database!');
  process.exit(0);
}

seed();
