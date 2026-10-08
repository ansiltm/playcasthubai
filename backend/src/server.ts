import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize from './config/database';
import productRoutes from './routes/products';

dotenv.config();

const app: Application = express();
const PORT: number = parseInt(process.env.PORT || '5000', 10);

app.use(cors());
app.use(express.json());

// Sync MariaDB/MySQL Database
sequelize.sync().then(() => {
  console.log('Database synced successfully');
}).catch((err: Error) => {
  console.error('Error syncing database:', err);
});

// Routes
app.use('/api/products', productRoutes);

app.get('/', (req: Request, res: Response): void => {
  res.json({ message: 'PlaycasthubAI API is running!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
