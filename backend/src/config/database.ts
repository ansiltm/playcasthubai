import mongoose from 'mongoose';
import 'dotenv/config';
let connection: Promise<typeof mongoose> | null = null;
export async function connectDatabase(): Promise<void> {
  if (mongoose.connection.readyState === 1) return;
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('Set MONGODB_URI before starting PlayCastHub.');
  if (!connection || mongoose.connection.readyState === 0) connection = mongoose.connect(uri, {
    maxPoolSize: 5, // Small pool per serverless instance for this low-traffic store.
    minPoolSize: 0, // Do not keep idle connections open on the free Atlas cluster.
    maxIdleTimeMS: 30000, // Release unused sockets between request bursts.
    serverSelectionTimeoutMS: 10000, // Return an error within the request time budget.
  }).catch(error => { connection = null; throw error; });
  await connection;
}
export default mongoose;
