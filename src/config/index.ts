import { config } from 'dotenv';
config({ path: `.env.${process.env.NODE_ENV || 'development'}.local` });

export const CREDENTIALS = process.env.CREDENTIALS === 'true';
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
  SESSION_SECRET_KEY,
  ZAMEEN_BASE_URL,
  POPULARITY_TREND_URL,
  AREA_TREND_URL,
  CONTACT_URL,
  FEATURED_PROPERTY_PRICE_THRESHOLD,
} = process.env;
export const POSTGRES_PORT = parseInt(process.env.POSTGRES_PORT, 10);

export const CACHE_EXPIRY_SECONDS = Number(process.env.CACHE_EXPIRY_SECONDS);
