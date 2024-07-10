import { config } from 'dotenv';
import { envVarsSchema } from '../models/env-vars.schema';
config({ path: `.env.${process.env.NODE_ENV || 'development'}.local` });

export const {
  NODE_ENV,
  PORT,
  SECRET_KEY,
  LOG_FORMAT,
  LOG_DIR,
  ORIGIN,
  POSTGRES_DB,
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  POSTGRES_HOST,
  POSTGRES_PORT,
  SESSION_SECRET_KEY,
  ZAMEEN_BASE_URL,
  POPULARITY_TREND_URL,
  AREA_TREND_URL,
  CONTACT_URL,
  FEATURED_PROPERTY_PRICE_THRESHOLD,
  CREDENTIALS,
  CACHE_EXPIRY_SECONDS,
} = envVarsSchema.parse(process.env);
