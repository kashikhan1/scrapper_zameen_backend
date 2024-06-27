import { z } from 'zod';

export const FeatureSchema = z.object({
  category: z.string(),
  features: z.array(z.string()),
});

export const PropertySchema = z.object({
  id: z.number(),
  desc: z.string(),
  header: z.string(),
  type: z.string(),
  price: z.number(),
  location: z.string(),
  bath: z.string(),
  area: z.string(),
  purpose: z.string(),
  bedroom: z.string(),
  added: z.number(),
  initial_amount: z.string(),
  monthly_installment: z.string(),
  remaining_installments: z.string(),
  url: z.string().url(),
  created_at: z.string(),
  updated_at: z.string(),
  cover_photo_url: z.string().url(),
  available: z.boolean(),
  features: z.array(FeatureSchema),
});

export const PropertyResponseSchema = z.object({
  id: z.number(),
  desc: z.string(),
  header: z.string(),
  type: z.string(),
  price: z.number(),
  cover_photo_url: z.string().url(),
  available: z.boolean(),
  area: z.string(),
  location: z.string(),
});

export const PropertyDetailResponseSchema = PropertySchema.extend({
  popularity_trends: z.object({
    trends: z.object({}),
  }),
  external_id: z.string(),
  contact: z.object({}),
});
