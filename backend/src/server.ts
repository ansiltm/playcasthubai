import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { connectDatabase } from './config/database';
import { jwtSecret } from './middleware/auth';
import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import orderRoutes from './routes/orders';
import { errorHandler } from './utils/http';
const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1); // one Render reverse proxy; direct access must not be exposed in production
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  if (req.path.startsWith('/api')) res.setHeader('Cache-Control', 'no-store');
  next();
});
app.get('/healthz', (_req, res) => res.status(mongoose.connection.readyState === 1 ? 200 : 503).json({ status: mongoose.connection.readyState === 1 ? 'ok' : 'starting' }));
if (process.env.NODE_ENV !== 'production') app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json({ limit: '100kb' }));
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api', (_req, res) => res.status(404).json({ message: 'API endpoint not found.' }));
app.use(errorHandler);
if (require.main === module) {
  jwtSecret();
  connectDatabase().then(() => app.listen(Number(process.env.PORT || 5000), '0.0.0.0')).catch(() => { console.error('Database setup failed. Check MONGODB_URI and Atlas network access.'); process.exitCode = 1; });
}
export default app;
