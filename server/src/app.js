import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import authRouter from './routes/auth.js';
import productsRouter from './routes/products.js';
import categoriesRouter from './routes/categories.js';
import brandsRouter from './routes/brands.js';
import ordersRouter from './routes/orders.js';
import reviewsRouter from './routes/reviews.js';
import wishlistRouter from './routes/wishlist.js';
import promoRouter from './routes/promo.js';
import usersRouter from './routes/users.js';
import reportsRouter from './routes/reports.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();
  app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
  app.use(express.json({ limit: '1mb' }));
  app.use(morgan('dev'));

  app.get('/api/health', (req, res) => res.json({ ok: true, ts: Date.now() }));

  app.use('/api/auth', authRouter);
  app.use('/api/products', productsRouter);
  app.use('/api/categories', categoriesRouter);
  app.use('/api/brands', brandsRouter);
  app.use('/api/orders', ordersRouter);
  app.use('/api/reviews', reviewsRouter);
  app.use('/api/wishlist', wishlistRouter);
  app.use('/api/promo-codes', promoRouter);
  app.use('/api/users', usersRouter);
  app.use('/api/reports', reportsRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
