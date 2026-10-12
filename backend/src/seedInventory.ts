import { connectDatabase } from './config/database';
import { Product } from './models';

export const catalog = [
  {
    name: 'RC JCB Excavator',
    category: 'Vehicles & Remote-Controlled (RC)',
    grade: 'Toy-Grade',
    wholesalePrice: 820.00,
    price: 1299.00,
    stock: 25,
    media: [
      'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=1200'
    ],
    description: 'Heavy-duty full functional RC JCB Excavator featuring motorized digging arm, realistic cab lights, 360-degree rotation, and durable caterpillar tracks.'
  },
  {
    name: 'Pioneer 4WD Rock Climber',
    category: 'Vehicles & Remote-Controlled (RC)',
    grade: 'Toy-Grade',
    wholesalePrice: 650.00,
    price: 999.00,
    stock: 30,
    media: [
      'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=1200'
    ],
    description: 'Rugged all-terrain Pioneer 4WD Rock Climber RC truck equipped with dual high-torque motors, independent spring shocks, and oversized high-grip rubber tires.'
  },
  {
    name: 'LUMO Action Truck (Cargo / Garbage Truck)',
    category: 'Vehicles & Remote-Controlled (RC)',
    grade: 'Toy-Grade',
    wholesalePrice: 1250.00,
    price: 1599.00,
    stock: 20,
    media: [
      'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&q=80&w=1200'
    ],
    description: 'Interactive LUMO Action Truck with working rear cargo loader, mechanical garbage lifting action, LED headlights, and realistic hydraulic simulation sounds.'
  },
  {
    name: '3D Off-Road SUV',
    category: 'Vehicles & Remote-Controlled (RC)',
    grade: 'Toy-Grade',
    wholesalePrice: 550.00,
    price: 899.00,
    stock: 35,
    media: [
      'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1200'
    ],
    description: 'High-speed 3D Off-Road RC SUV vehicle featuring aerodynamic chassis, knobby all-terrain tires, roof-mounted accessories, and impact-resistant front bumper.'
  },
  {
    name: 'Classic 1970 Dodge Charger R/T RC Car',
    category: 'Vehicles & Remote-Controlled (RC)',
    grade: 'Toy-Grade',
    wholesalePrice: 700.00,
    price: 1199.00,
    stock: 24,
    media: [
      'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=1200'
    ],
    description: 'Iconic American muscle replica of the 1970 Dodge Charger R/T with authentic black body finish, blower hood intake detail, responsive steering, and quick acceleration.'
  },
  {
    name: 'RC Police Truck',
    category: 'Vehicles & Remote-Controlled (RC)',
    grade: 'Toy-Grade',
    wholesalePrice: 1100.00,
    price: 1600.00,
    stock: 18,
    media: [
      'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&q=80&w=1200'
    ],
    description: 'Emergency response RC Police Patrol Truck featuring flashing red & blue emergency roof strobe lights, authentic siren sound effects, and tough composite chassis.'
  },
  {
    name: 'ToyBoi Monster Rover (Range Rover)',
    category: 'Vehicles & Remote-Controlled (RC)',
    grade: 'Toy-Grade',
    wholesalePrice: 700.00,
    price: 1099.00,
    stock: 28,
    media: [
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1541348263662-e0c8de4259ba?auto=format&fit=crop&q=80&w=1200'
    ],
    description: 'Luxury meets monster truck power. The ToyBoi Monster Rover features a stylish Range Rover inspired shell mounted on huge off-road monster wheels with long-travel coil springs.'
  },
  {
    name: 'RC Rally Spray Drift Car',
    category: 'Vehicles & Remote-Controlled (RC)',
    grade: 'Toy-Grade',
    wholesalePrice: 900.00,
    price: 1399.00,
    stock: 30,
    media: [
      'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=1200'
    ],
    description: 'Exciting RC drift racer equipped with rear exhaust water mist spray system, vibrant LED lights, and smooth low-friction drift tires for power-sliding action.'
  },
  {
    name: '5 CH RC Excavator',
    category: 'Vehicles & Remote-Controlled (RC)',
    grade: 'Toy-Grade',
    wholesalePrice: 750.00,
    price: 1199.00,
    stock: 22,
    media: [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&q=80&w=1200'
    ],
    description: '5-Channel functional construction excavator featuring articulated boom arm, manual scoop control, full 360-degree cab rotation, and realistic construction styling.'
  },
  {
    name: 'RC Wheel Loader (Front Loader)',
    category: 'Vehicles & Remote-Controlled (RC)',
    grade: 'Toy-Grade',
    wholesalePrice: 850.00,
    price: 1350.00,
    stock: 15,
    media: [
      'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=1200'
    ],
    description: 'Front-loading heavy construction RC loader with articulated steering mechanism, high-reach lift shovel, and durable all-weather textured tires.'
  },
  {
    name: 'RC Heavy Dumper Truck',
    category: 'Vehicles & Remote-Controlled (RC)',
    grade: 'Toy-Grade',
    wholesalePrice: 800.00,
    price: 1299.00,
    stock: 20,
    media: [
      'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=1200'
    ],
    description: 'Electric RC Dump Truck featuring motorized tipping bed for unloading gravel or sand, bright working LED headlamps, and heavy-duty chassis.'
  },
  {
    name: 'Small Duck Track Toy',
    category: 'Educational, STEM & STEAM Toys',
    grade: 'Toy-Grade',
    wholesalePrice: 210.00,
    price: 350.00,
    stock: 50,
    media: [
      'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&q=80&w=1200'
    ],
    description: 'Fun and colorful musical roller-coaster duck slide track toy with automatic stairs climbing, flashing LED lights, cheerful music, and 3 cute yellow ducks.'
  },
  {
    name: 'RC Rock Off Hauler Truck (Cars Container Truck)',
    category: 'Vehicles & Remote-Controlled (RC)',
    grade: 'Toy-Grade',
    wholesalePrice: 1050.00,
    price: 1699.00,
    stock: 15,
    media: [
      'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?auto=format&fit=crop&q=80&w=1200'
    ],
    description: 'Massive multi-axle RC container transporter truck with detachable car transport carrier trailer, rear loading ramp, and semi-truck engine sounds.'
  },
  {
    name: '4WD Amphibious Waterproof RC Car',
    category: 'Vehicles & Remote-Controlled (RC)',
    grade: 'Toy-Grade',
    wholesalePrice: 950.00,
    price: 1499.00,
    stock: 25,
    media: [
      'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&q=80&w=1200'
    ],
    description: 'Hermetically sealed waterproof 4WD amphibious stunt car capable of racing on land, grass, beach sand, and swimming across swimming pools with 360-degree tumbling.'
  },
  {
    name: 'ENOZE Wild Hunt 1:20 RC Racing Car',
    category: 'Vehicles & Remote-Controlled (RC)',
    grade: 'Toy-Grade',
    wholesalePrice: 1150.00,
    price: 1899.00,
    stock: 20,
    media: [
      'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1541348263662-e0c8de4259ba?auto=format&fit=crop&q=80&w=1200'
    ],
    description: 'High-speed 1:20 scale racing buggy with aggressive aerodynamic spoiler, composite shock dampers, proportional 2.4GHz remote control, and fast acceleration.'
  },
  {
    name: 'Wild Ride 1:20 RC High Speed Car',
    category: 'Vehicles & Remote-Controlled (RC)',
    grade: 'Toy-Grade',
    wholesalePrice: 1100.00,
    price: 1799.00,
    stock: 22,
    media: [
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1200'
    ],
    description: 'Dynamic 1:20 scale high-speed track runner engineered with high-output electric motor, low center of gravity, precision servo steering, and aggressive styling.'
  },
  {
    name: 'Simulated Alloy Sports Car (Set of 20)',
    category: 'Scale Model Kits & Hobby Crafts',
    grade: 'Collector-Grade / Display-Grade',
    wholesalePrice: 85.00,
    price: 130.00,
    stock: 40,
    media: [
      'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1541348263662-e0c8de4259ba?auto=format&fit=crop&q=80&w=1200'
    ],
    description: 'Collector set of 20 detailed die-cast alloy metal sports cars featuring aerodynamic bodylines, electroplated wheels, gloss paint, and collector packaging.'
  },
  {
    name: 'RC Multi-Functional Drift Spray Car',
    category: 'Vehicles & Remote-Controlled (RC)',
    grade: 'Toy-Grade',
    wholesalePrice: 950.00,
    price: 1499.00,
    stock: 25,
    media: [
      'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1200'
    ],
    description: 'Multi-directional drift car with omnidirectional roller wheels, dynamic lighting shows, exhaust cold water spray nozzle, and automatic demo mode.'
  },
  {
    name: '1:14 5-Channel RC Excavator (8094E)',
    category: 'Vehicles & Remote-Controlled (RC)',
    grade: 'Toy-Grade',
    wholesalePrice: 1400.00,
    price: 2199.00,
    stock: 15,
    media: [
      'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=1200'
    ],
    description: 'Scale 1:14 5-Channel RC construction excavator model 8094E with realistic reinforced scoop, independent track controls, engine sound module, and flashing cab lights.'
  },
  {
    name: 'Diecast Collection Mini Off-Road Vehicles (Suzuki Jimny 1:64)',
    category: 'Scale Model Kits & Hobby Crafts',
    grade: 'Collector-Grade / Display-Grade',
    wholesalePrice: 80.00,
    price: 120.00,
    stock: 45,
    media: [
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?auto=format&fit=crop&q=80&w=1200'
    ],
    description: 'Detailed 1:64 scale Suzuki Jimny off-road diecast miniature with accurate body contours, front grille detail, rubber tread tires, and display casing.'
  },
  {
    name: 'Land Rover Defender 90 RC Toy',
    category: 'Vehicles & Remote-Controlled (RC)',
    grade: 'Toy-Grade',
    wholesalePrice: 2600.00,
    price: 3999.00,
    stock: 12,
    media: [
      'https://images.unsplash.com/photo-1541348263662-e0c8de4259ba?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1200'
    ],
    description: 'Detailed scale RC model of the legendary Land Rover Defender 90 with full-function steering, realistic 4x4 styling, working headlamps, and opening doors.'
  },
  {
    name: 'MN-91 Land Rover Defender Mini Crawler',
    category: 'Vehicles & Remote-Controlled (RC)',
    grade: 'Hobby-Grade',
    wholesalePrice: 3200.00,
    price: 4999.00,
    stock: 10,
    media: [
      'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1200'
    ],
    description: 'Authentic 1:12 4WD Hobby-Grade scale rock crawler. Built with C-channel metal chassis frame, high-torque steering servo, proportional throttle, soft compound all-terrain tires, and true crawler articulation.'
  },
  {
    name: 'Thar Roxx Diecast',
    category: 'Scale Model Kits & Hobby Crafts',
    grade: 'Collector-Grade / Display-Grade',
    wholesalePrice: 370.00,
    price: 499.00,
    stock: 35,
    media: [
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?auto=format&fit=crop&q=80&w=1200'
    ],
    description: 'Authentic die-cast alloy metal model of the Mahindra Thar Roxx with opening side & tail doors, pullback drive mechanism, realistic engine sounds, and headlamp illumination.'
  },
  {
    name: 'M416 Toy Blaster',
    category: 'Outdoor, Sports & Active Play',
    grade: 'Toy-Grade',
    wholesalePrice: 550.00,
    price: 850.00,
    stock: 30,
    media: [
      'https://images.unsplash.com/photo-1595769816263-9b910be24d5f?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&q=80&w=1200'
    ],
    description: 'Tactical M416 soft dart foam blaster equipped with detachable scope, tactical stock, rapid-fire spring mechanism, and safe suction foam darts.'
  },
  {
    name: 'Interactive Steering Wheel Toy (Sound & Light)',
    category: 'Electronic, Smart & Animatronic Toys',
    grade: 'Toy-Grade',
    wholesalePrice: 900.00,
    price: 1199.00,
    stock: 25,
    media: [
      'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&q=80&w=1200'
    ],
    description: 'Interactive sensory driving simulation toy featuring turning steering wheel, realistic ignition switch, working left & right turn signals, horn, and emergency siren sounds with lights.'
  }
];

async function seedInventory() {
  try {
    await connectDatabase();
    console.log('MongoDB connected.');

    for (const item of catalog) {
      const existing = await Product.findOne({ name: item.name });
      if (existing) {
        Object.assign(existing, item);
        await existing.save();
        console.log(`Updated: ${item.name} [${item.grade}]`);
      } else {
        await Product.create(item);
        console.log(`Created: ${item.name} [${item.grade}]`);
      }
    }

    const totalCount = await Product.countDocuments();
    console.log(`\nInventory seeding complete! Total products in MongoDB: ${totalCount}`);
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  seedInventory();
}
