require('dotenv').config({ path: require('path').resolve(__dirname, '../backend/.env') });
const mongoose = require('../backend/node_modules/mongoose');

const colorMappings = [
  { name: 'RC JCB Excavator', colors: ['Industrial Yellow', 'Construction Orange'] },
  { name: 'Pioneer 4WD Rock Climber', colors: ['Metallic Red', 'Electric Blue', 'Matte Black'] },
  { name: 'LUMO Action Truck (Cargo / Garbage Truck)', colors: ['Forest Green', 'Construction Orange', 'Pure White'] },
  { name: '3D Off-Road SUV', colors: ['Gloss Black', 'Racing Red', 'Electric Blue'] },
  { name: 'Classic 1970 Dodge Charger R/T RC Car', colors: ['Gloss Black', 'Cherry Red', 'Silver'] },
  { name: 'RC Police Truck', colors: ['Black & White', 'Navy Blue'] },
  { name: 'ToyBoi Monster Rover (Range Rover)', colors: ['Matte Black', 'Racing Red', 'Electric Blue'] },
  { name: 'RC Rally Spray Drift Car', colors: ['Electric Blue', 'Racing Red', 'Silver'] },
  { name: '5 CH RC Excavator', colors: ['Industrial Yellow', 'Construction Orange'] },
  { name: 'RC Wheel Loader (Front Loader)', colors: ['Industrial Yellow', 'Construction Orange'] },
  { name: 'RC Heavy Dumper Truck', colors: ['Industrial Yellow', 'Construction Orange'] },
  { name: 'Small Duck Track Toy', colors: ['Vibrant Yellow', 'Multicolor'] },
  { name: 'RC Rock Off Hauler Truck (Cars Container Truck)', colors: ['Racing Red', 'Navy Blue', 'Silver'] },
  { name: '4WD Amphibious Waterproof RC Car', colors: ['Electric Blue', 'Neon Green', 'Racing Red'] },
  { name: 'ENOZE Wild Hunt 1:20 RC Racing Car', colors: ['Racing Red', 'Electric Blue', 'Matte Black'] },
  { name: 'Wild Ride 1:20 RC High Speed Car', colors: ['Electric Blue', 'Racing Red', 'Neon Green'] },
  { name: 'Simulated Alloy Sports Car (Set of 20)', colors: ['Multicolor Set', 'Metallic Red', 'Electric Blue'] },
  { name: 'RC Multi-Functional Drift Spray Car', colors: ['Electric Blue', 'Racing Red', 'Gloss Black'] },
  { name: '1:14 5-Channel RC Excavator (8094E)', colors: ['Industrial Yellow', 'Construction Orange'] },
  { name: 'Diecast Collection Mini Off-Road Vehicles (Suzuki Jimny 1:64)', colors: ['Military Green', 'Desert Sand', 'Pure White', 'Gloss Black'] },
  { name: 'Land Rover Defender 90 RC Toy', colors: ['Army Green', 'Desert Sand', 'Gloss Black'] },
  { name: 'MN-91 Land Rover Defender Mini Crawler', colors: ['Army Green', 'Gloss Black', 'Desert Sand'] },
  { name: 'Thar Roxx Diecast', colors: ['Gloss Black', 'Cherry Red', 'Pure White', 'Desert Sand'] },
  { name: 'M416 Toy Blaster', colors: ['Military Green', 'Desert Sand', 'Electric Blue'] },
  { name: 'Interactive Steering Wheel Toy (Sound & Light)', colors: ['Racing Red', 'Electric Blue', 'Vibrant Yellow'] },
  { name: 'Mercedes G-Wagon 1:28 Scale Model Car', colors: ['Gloss Black', 'Pure White', 'Silver', 'Cherry Red'] },
  { name: 'Dual Truck Drift Challenge RC Car', colors: ['Racing Red', 'Electric Blue'] },
  { name: 'THST Cars Container Truck Luxury Gift Box Set', colors: ['Racing Red', 'Navy Blue', 'Industrial Yellow'] },
  { name: 'Detsky 911 PRGT 1:64 Diecast Sports Car', colors: ['Racing Red', 'Gloss Black', 'Pure White', 'Electric Blue'] },
  { name: 'Kids Toy Camera (Small Type)', colors: ['Sky Blue', 'Baby Pink', 'Bright Yellow'] },
  { name: 'Kids Instant Print Camera', colors: ['Baby Pink', 'Sky Blue', 'Pure White'] }
];

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');
  const Product = require('../backend/dist/models/Product').default;

  for (const item of colorMappings) {
    const res = await Product.updateMany(
      { name: item.name },
      { $set: { colors: item.colors } }
    );
    console.log(`${item.name} -> [${item.colors.join(', ')}] (${res.modifiedCount} updated)`);
  }

  const sample = await Product.find({}, 'name colors').limit(5);
  console.log('Sample updated products with colors:', sample);
  await mongoose.disconnect();
}

run().catch(console.error);
