import { z } from 'zod'

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(50),

  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username cannot exceed 20 characters')
    .regex(
      /^[a-z0-9_]+$/,
      'Username can only contain letters, numbers and underscores'
    ),

  email: z.string().trim().email('Please provide a valid email'),

  password: z.string().min(8).max(72),
})

export const loginSchema = z.object({
  email: z.string().trim().email('Please provide a valid email'),
  password: z.string().min(1, 'Password is required'),
})

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(50),

  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(3)
    .max(20)
    .regex(/^[a-z0-9_]+$/),
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8).max(72),
})

export const notificationPreferencesSchema = z.object({
  workspace: z.boolean(),
  project: z.boolean(),
  task: z.boolean(),
  comments: z.boolean(),
})

export const emailPreferencesSchema = z.object({
  workspace: z.boolean(),
  project: z.boolean(),
  task: z.boolean(),
  comments: z.boolean(),
})

// Forgot password: request OTP
export const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Please provide a valid email'),
})

// Reset password: verify OTP and save new password
export const resetPasswordSchema = z.object({
  email: z.string().trim().email('Please provide a valid email'),

  code: z
    .string()
    .regex(/^\d{6}$/, 'OTP must be a 6-digit code'),

  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password cannot exceed 72 characters'),
})