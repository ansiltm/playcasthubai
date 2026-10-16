const path = require('node:path');
require('../backend/node_modules/dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('../backend/node_modules/mongoose');
const { connectDatabase } = require('../backend/dist/config/database');
const User = require('../backend/dist/models/User').default;
async function main() {
  const email = process.argv[2]?.trim().toLowerCase();
  if (!email || !email.includes('@')) throw new Error('Usage: npm run admin -- your-verified-account@example.com');
  await connectDatabase();
  const user = await User.findOneAndUpdate({ email }, { $set: { role: 'admin' }, $inc: { tokenVersion: 1 } });
  if (!user) throw new Error('Register and verify your account first.');
  console.log('Admin access granted. Sign out and sign back in.');
}
main().catch(error => { console.error(error.message); process.exitCode = 1; }).finally(() => mongoose.disconnect());
