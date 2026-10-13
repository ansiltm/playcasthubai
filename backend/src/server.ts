import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { connectDatabase } from './config/database';
import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import cartRoutes from './routes/cart';
import orderRoutes from './routes/orders';
import notificationRoutes from './routes/notifications';

dotenv.config();

const app: Application = express();
const PORT: number = parseInt(process.env.PORT || '5000', 10);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Connect to MongoDB Atlas (eager connect for standalone Node servers)
connectDatabase().then(() => {
  console.log('MongoDB connected successfully');
}).catch((err: Error) => {
  console.error('Error connecting to MongoDB:', err);
});

// Middleware to ensure DB connection is established for serverless invocations
app.use(async (req: Request, res: Response, next) => {
  try {
    await connectDatabase();
    next();
  } catch (err) {
    console.error('Database connection error in request middleware:', err);
    res.status(500).json({ message: 'Internal Server Error: Database connection failed' });
  }
});

// Routes - mounted on both /api and root paths for seamless serverless & reverse-proxy routing
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/products', productRoutes);
app.use('/products', productRoutes);

app.use('/api/cart', cartRoutes);
app.use('/cart', cartRoutes);

app.use('/api/orders', orderRoutes);
app.use('/orders', orderRoutes);

app.use('/api/notifications', notificationRoutes);
app.use('/notifications', notificationRoutes);

app.get(['/', '/api'], (req: Request, res: Response): void => {
  res.json({ message: 'PlaycastHub API is running with MongoDB Atlas!' });
});

// Only listen if not running in Vercel serverless environment
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;

