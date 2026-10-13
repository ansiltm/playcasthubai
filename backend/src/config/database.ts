import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://playcasthub_db_user:SqgVpn33vcYqSfW7@cluster0.xjssamj.mongodb.net/playcasthub?retryWrites=true&w=majority';

let cachedPromise: Promise<typeof mongoose> | null = null;

export const connectDatabase = async (): Promise<void> => {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (!cachedPromise) {
    cachedPromise = mongoose.connect(MONGODB_URI).then((m) => {
      console.log('MongoDB Atlas connected successfully.');
      return m;
    }).catch((err) => {
      cachedPromise = null;
      console.error('MongoDB connection error:', err);
      throw err;
    });
  }

  await cachedPromise;
};

export default mongoose;


