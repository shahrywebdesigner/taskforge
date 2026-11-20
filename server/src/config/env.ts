
import dotenv from 'dotenv'
import { z } from 'zod'

dotenv.config()

const envSchema = z.object({
  CLIENT_URL: z.string().url(),

  PORT: z.coerce.number().default(5000),

  MONGO_URI: z.string().min(1, 'MONGO_URI is required'),

  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  JWT_SECRET: z
    .string()
    .min(32, 'JWT_SECRET must be at least 32 characters'),

  JWT_EXPIRES_IN: z.string().default('7d'),

  COOKIE_NAME: z.string().default('taskforge_token'),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: z.string().min(1, 'Cloudinary cloud name is required'),
  CLOUDINARY_API_KEY: z.string().min(1, 'Cloudinary API key is required'),
  CLOUDINARY_API_SECRET: z.string().min(1, 'Cloudinary API secret is required'),

  // Stripe Test Mode only
  STRIPE_SECRET_KEY: z.string().startsWith('sk_test_'),

  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_'),

  STRIPE_CURRENCY: z
    .string()
    .length(3)
    .transform((value) => value.toLowerCase())
    .default('usd'),

  STRIPE_MONTHLY_AMOUNT: z.coerce
    .number()
    .int()
    .positive()
    .default(1499),

  STRIPE_YEARLY_AMOUNT: z.coerce
    .number()
    .int()
    .positive()
    .default(14999),
})

export const env = envSchema.parse(process.env)
