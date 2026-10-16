import mongoose from 'mongoose';
import 'dotenv/config';
let connection: Promise<typeof mongoose> | null = null;
export async function connectDatabase(): Promise<void> {
  if (mongoose.connection.readyState === 1) return;
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('Set MONGODB_URI before starting PlayCastHub.');
  if (!connection) connection = mongoose.connect(uri, { maxPoolSize: 5, serverSelectionTimeoutMS: 10000 }).catch(error => { connection = null; throw error; });
  await connection;
}
export default mongoose;
