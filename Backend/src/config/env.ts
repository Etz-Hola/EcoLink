import dotenv from 'dotenv';
import Joi from 'joi';

dotenv.config();

const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(5000),
  API_VERSION: Joi.string().default('v1'),
  
  // Database
  MONGODB_URI: Joi.string().required(),
  MONGODB_TEST_URI: Joi.string().required(),
  
  // Redis
  REDIS_URL: Joi.string().required(),
  REDIS_PASSWORD: Joi.string().allow(''),
  
  // JWT
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRE: Joi.string().default('7d'),
  JWT_REFRESH_SECRET: Joi.string().required(),
  JWT_REFRESH_EXPIRE: Joi.string().default('30d'),
  
  // AWS
  AWS_ACCESS_KEY_ID: Joi.string().required(),
  AWS_SECRET_ACCESS_KEY: Joi.string().required(),
  AWS_REGION: Joi.string().default('us-east-1'),
  AWS_S3_BUCKET: Joi.string().required(),
  
  // Email
  EMAIL_HOST: Joi.string().required(),
  EMAIL_PORT: Joi.number().default(587),
  EMAIL_USER: Joi.string().email().required(),
  EMAIL_PASS: Joi.string().required(),
  
  // SMS
  TWILIO_ACCOUNT_SID: Joi.string().required(),
  TWILIO_AUTH_TOKEN: Joi.string().required(),
  TWILIO_PHONE_NUMBER: Joi.string().required(),
  
  // Payments
  PAYSTACK_SECRET_KEY: Joi.string().required(),
  PAYSTACK_PUBLIC_KEY: Joi.string().required(),
  FLUTTERWAVE_SECRET_KEY: Joi.string().required(),
  FLUTTERWAVE_PUBLIC_KEY: Joi.string().required(),
  
  // Web3
  ETHEREUM_RPC_URL: Joi.string().uri().required(),
  POLYGON_RPC_URL: Joi.string().uri().required(),
  PRIVATE_KEY: Joi.string().required(),
  CONTRACT_ADDRESS: Joi.string().required(),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: Joi.number().default(900000),
  RATE_LIMIT_MAX_REQUESTS: Joi.number().default(100),
  
  // File Upload
  MAX_FILE_SIZE: Joi.number().default(5242880),
  MAX_FILES_PER_UPLOAD: Joi.number().default(5),
  
  // Logistics
  DEFAULT_TRANSPORT_RATE_PER_KM: Joi.number().default(50),
  BASE_PICKUP_FEE: Joi.number().default(500),
  MINIMUM_BATCH_WEIGHT: Joi.number().default(100),
  
  // Admin
  ADMIN_EMAIL: Joi.string().email().required(),
  ADMIN_PHONE: Joi.string().required()
}).unknown();

const { error, value: validatedEnv } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Environment validation error: ${error.message}`);
}

export const env = validatedEnv;