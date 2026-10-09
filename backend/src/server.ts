import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { sequelize } from './models';
import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import cartRoutes from './routes/cart';
import orderRoutes from './routes/orders';

dotenv.config();

const app: Application = express();
const PORT: number = parseInt(process.env.PORT || '5000', 10);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Sync MariaDB/MySQL Database
sequelize.sync({ alter: true }).then(() => {
  console.log('Database synced successfully');
}).catch((err: Error) => {
  console.error('Error syncing database:', err);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

app.get('/', (req: Request, res: Response): void => {
  res.json({ message: 'PlaycastHub API is running!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
