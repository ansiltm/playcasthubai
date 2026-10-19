require('dotenv').config({ path: require('path').resolve(__dirname, '../backend/.env') });
const mongoose = require('../backend/node_modules/mongoose');

const ageMappings = [
  // 3+ (Early Childhood, Preschool, Slide Track, Pre-school Toy)
  { name: 'Small Duck Track Toy', age: '3+' },
  { name: 'Interactive Steering Wheel Toy (Sound & Light)', age: '3+' },
  { name: 'Kids Toy Camera (Small Type)', age: '3+' },
  { name: 'THST Cars Container Truck Luxury Gift Box Set', age: '3+' },
  { name: 'LUMO Action Truck (Cargo / Garbage Truck)', age: '3+' },

  // 6+ (Kids, Basic RC, Creative Construction)
  { name: 'RC JCB Excavator', age: '6+' },
  { name: 'RC Police Truck', age: '6+' },
  { name: 'RC Heavy Dumper Truck', age: '6+' },
  { name: 'RC Wheel Loader (Front Loader)', age: '6+' },
  { name: '5 CH RC Excavator', age: '6+' },
  { name: 'RC Rock Off Hauler Truck (Cars Container Truck)', age: '6+' },
  { name: 'Classic 1970 Dodge Charger R/T RC Car', age: '6+' },
  { name: '3D Off-Road SUV', age: '6+' },
  { name: 'Dual Truck Drift Challenge RC Car', age: '6+' },
  { name: 'Kids Instant Print Camera', age: '6+' },

  // 8+ (Older Kids, High-Speed RC, Stunt, Outdoor Blasters)
  { name: 'Pioneer 4WD Rock Climber', age: '8+' },
  { name: 'ToyBoi Monster Rover (Range Rover)', age: '8+' },
  { name: 'RC Rally Spray Drift Car', age: '8+' },
  { name: '4WD Amphibious Waterproof RC Car', age: '8+' },
  { name: 'ENOZE Wild Hunt 1:20 RC Racing Car', age: '8+' },
  { name: 'Wild Ride 1:20 RC High Speed Car', age: '8+' },
  { name: 'RC Multi-Functional Drift Spray Car', age: '8+' },
  { name: '1:14 5-Channel RC Excavator (8094E)', age: '8+' },
  { name: 'Land Rover Defender 90 RC Toy', age: '8+' },
  { name: 'M416 Toy Blaster', age: '8+' },
  { name: 'Simulated Alloy Sports Car (Set of 20)', age: '8+' },

  // 14+ (Teens, Hobby-Grade, Precision Diecasts)
  { name: 'MN-91 Land Rover Defender Mini Crawler', age: '14+' },
  { name: 'Diecast Collection Mini Off-Road Vehicles (Suzuki Jimny 1:64)', age: '14+' },
  { name: 'Thar Roxx Diecast', age: '14+' },
  { name: 'Detsky 911 PRGT 1:64 Diecast Sports Car', age: '14+' },

  // 18+ (Adult Display / Collector Grade)
  { name: 'Mercedes G-Wagon 1:28 Scale Model Car', age: '18+' }
];

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');
  const Product = require('../backend/dist/models/Product').default;

  for (const item of ageMappings) {
    const res = await Product.updateMany(
      { name: item.name },
      { $set: { ageLabel: item.age } }
    );
    console.log(`${item.name} -> ${item.age} (${res.modifiedCount} updated)`);
  }

  const counts = await Product.aggregate([
    { $group: { _id: '$ageLabel', count: { $sum: 1 } } }
  ]);
  console.log('Final Age Distribution:', counts);
  await mongoose.disconnect();
}

run().catch(console.error);
