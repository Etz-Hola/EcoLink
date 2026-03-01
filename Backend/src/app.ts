import dotenv from 'dotenv';
import dns from 'node:dns';

// Fix for MongoDB DNS resolution issues in Node 20+
dns.setDefaultResultOrder('ipv4first');

// Load environment variables immediately
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { connectDatabase } from './config/database';
import { connectRedis } from './config/redis';
import { errorMiddleware } from './middleware/errorMiddleware';
import { rateLimitMiddleware } from './middleware/rateLimitMiddleware';
import logger from './utils/logger';
import { register } from 'prom-client';

// Import routes
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import materialRoutes from './routes/materialRoutes';
import branchRoutes from './routes/branchRoutes';
import logisticsRoutes from './routes/logisticsRoutes';
import adminRoutes from './routes/adminRoutes';
import web3Routes from './routes/web3Routes';
import bundleRoutes from './routes/bundleRoutes';
import paymentRoutes from './routes/paymentRoutes';

const app = express();
const PORT = process.env.PORT || 5000;
const API_VERSION = process.env.API_VERSION || 'v1';

// Middleware
app.use(helmet({
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" }
}));
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(compression());
app.use(morgan('combined', { stream: { write: (message: string) => logger.info(message.trim()) } }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use(rateLimitMiddleware);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// Metrics endpoint for Prometheus
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// API Routes
app.use(`/api/${API_VERSION}/auth`, authRoutes);
app.use(`/api/${API_VERSION}/users`, userRoutes); // Add user routes
app.use(`/api/${API_VERSION}/materials`, materialRoutes);
app.use(`/api/${API_VERSION}/branches`, branchRoutes);
app.use(`/api/${API_VERSION}/logistics`, logisticsRoutes);
app.use(`/api/${API_VERSION}/admin`, adminRoutes);
app.use(`/api/${API_VERSION}/web3`, web3Routes);
app.use(`/api/${API_VERSION}/bundles`, bundleRoutes);
app.use(`/api/${API_VERSION}/payments`, paymentRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use(errorMiddleware);

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();
    logger.info('Connected to MongoDB');

    // Connect to Redis (Optional for local dev)
    connectRedis().catch(err => logger.error('Async Redis connection error:', err));

    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  logger.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;