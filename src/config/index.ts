import { config } from 'dotenv';
import { envVarsSchema } from '../models/env-vars.schema';
config({ path: `.env.${process.env.NODE_ENV || 'development'}.local` });

export const {
  PORT,
  ORIGIN,
  LOG_DIR,
  NODE_ENV,
  SECRET_KEY,
  LOG_FORMAT,
  POSTGRES_DB,
  CONTACT_URL,
  CREDENTIALS,
  REDIS_DB_URL,
  SENDER_EMAIL,
  POSTGRES_USER,
  POSTGRES_HOST,
  EMAIL_SERVICE,
  POSTGRES_PORT,
  AREA_TREND_URL,
  SLACK_HOOK_URL,
  ZAMEEN_BASE_URL,
  POSTGRES_PASSWORD,
  SESSION_SECRET_KEY,
  POPULARITY_TREND_URL,
  CACHE_EXPIRY_SECONDS,
  SENDER_EMAIL_PASSWORD,
  EMAIL_RECIPIENTS_LIST,
  FEATURED_PROPERTY_PRICE_THRESHOLD,
} = envVarsSchema.parse(process.env);
