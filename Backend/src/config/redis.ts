import { createClient, RedisClientType } from 'redis';
import logger from '../utils/logger';

let redisClient: RedisClientType;

export const connectRedis = async (): Promise<void> => {
  // Only attempt to connect if REDIS_URL is provided
  // In dev, we skip if URL is missing to avoid log spam
  if (!process.env.REDIS_URL && process.env.NODE_ENV === 'development') {
    logger.info('Redis URL not provided, skipping Redis connection (dev mode)');
    return;
  }

  try {
    if (!redisClient && process.env.REDIS_URL) {
      redisClient = createClient({
        url: process.env.REDIS_URL,
        password: process.env.REDIS_PASSWORD || undefined,
        database: process.env.NODE_ENV === 'test' ? 1 : 0,
        socket: {
          reconnectStrategy: (retries) => {
            // Stop retrying after 10 attempts in dev if no URL is provided
            if (!process.env.REDIS_URL && process.env.NODE_ENV === 'development' && retries > 2) {
              return false;
            }
            if (retries > 10) return false;
            return Math.min(retries * 500, 5000);
          }
        }
      });

      redisClient.on('error', (err) => {
        // Silently handle errors unless explicitly configured or in production
        if (process.env.REDIS_URL || process.env.NODE_ENV === 'production') {
          logger.error('Redis Client Error:', err);
        }
      });

      redisClient.on('connect', () => {
        logger.info('Redis connected');
      });
    }

    await redisClient.connect();
  } catch (error) {
    if (process.env.REDIS_URL || process.env.NODE_ENV === 'production') {
      logger.error('Redis connection failed:', error);
    } else {
      logger.warn('Redis unavailable (dev mode)');
    }
  }
};

export const getRedisClient = (): RedisClientType => {
  if (!redisClient) {
    throw new Error('Redis client not initialized');
  }
  return redisClient;
};

export const disconnectRedis = async (): Promise<void> => {
  try {
    if (redisClient) {
      await redisClient.quit();
      logger.info('Redis connection closed');
    }
  } catch (error) {
    logger.error('Error closing Redis connection:', error);
    throw error;
  }
};