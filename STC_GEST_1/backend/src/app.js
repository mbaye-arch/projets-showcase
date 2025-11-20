import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import suppliersRoutes from './routes/suppliersRoutes.js';
import categoriesRoutes from './routes/categoriesRoutes.js';
import hardwareRoutes from './routes/hardwareRoutes.js';
import softwareRoutes from './routes/softwareRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import clientTypesRoutes from './routes/clientTypesRoutes.js';
import cataloguesRoutes from './routes/cataloguesRoutes.js';
import db from './config/db.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*'
  })
);

app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

app.get('/api/health', async (req, res) => {
  try {
    await db.query('SELECT 1');

    res.json({
      success: true,
      message: 'API and database are running',
      data: {
        api: 'up',
        db: 'up'
      }
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'API is running but database is unavailable',
      data: {
        api: 'up',
        db: 'down',
        error: error.code || error.message
      }
    });
  }
});

app.use('/api/suppliers', suppliersRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/hardware', hardwareRoutes);
app.use('/api/software', softwareRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/types-clients', clientTypesRoutes);
app.use('/api/catalogues', cataloguesRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
