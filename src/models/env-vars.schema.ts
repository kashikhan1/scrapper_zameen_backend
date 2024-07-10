import { z } from 'zod';
const { object, string } = z;

export const envVarsSchema = object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: string().min(1).regex(/^\d+$/).transform(Number),
  SECRET_KEY: string().min(1),
  LOG_FORMAT: string().min(1),
  LOG_DIR: string().min(1),
  ORIGIN: string().min(1),
  POSTGRES_DB: string().min(1),
  POSTGRES_USER: string().min(1),
  POSTGRES_PASSWORD: string().min(1),
  POSTGRES_HOST: string().min(1),
  POSTGRES_PORT: string().min(1).regex(/^\d+$/).transform(Number),
  SESSION_SECRET_KEY: string().min(1),
  ZAMEEN_BASE_URL: string().url().min(1),
  POPULARITY_TREND_URL: string().url().min(1),
  AREA_TREND_URL: string().url().min(1),
  CONTACT_URL: string().url().min(1),
  FEATURED_PROPERTY_PRICE_THRESHOLD: string().min(1).regex(/^\d+$/),
  CACHE_EXPIRY_SECONDS: string().min(1).regex(/^\d+$/).transform(Number),
  CREDENTIALS: string()
    .min(1)
    .transform(value => value === 'true'),
});
