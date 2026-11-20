
import { Router } from 'express'
import { z } from 'zod'
import { rateLimit } from 'express-rate-limit'

import {
  register,
  login,
  verifySignup,
  resendSignupVerification,
  verifyLogin,
  resendLoginVerification,
  getCurrentUser,
  logout,
  updateProfile,
  changePassword,
  updateNotificationPreferences,
  requestEmailChangeController,
  verifyEmailChangeController,
  updateEmailPreferences,
  forgotPasswordController,
resetPasswordController,
} from '../controllers/auth.controller.js'

import asyncHandler from '../utils/asyncHandler.js'
import validate from '../middleware/validate.js'
import authMiddleware from '../middleware/auth.middleware.js'

import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
  notificationPreferencesSchema,
  emailPreferencesSchema,
  forgotPasswordSchema,
resetPasswordSchema,
} from '../utils/validators/auth.validator.js'

const router = Router()

// Common rate-limit response
const rateLimitMessage = {
  message: 'Too many requests. Please try again later.',
}

// General authentication requests: 10 requests per 15 minutes
const authRequestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitMessage,
})

// OTP sending/resending: 5 requests per 15 minutes
const otpSendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitMessage,
})

// OTP verification: 10 requests per 15 minutes
const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitMessage,
})

// Validation schemas
const requestEmailChangeSchema = z.object({
  newEmail: z.string().trim().email(),
})

const verifyEmailChangeSchema = z.object({
  code: z.string().regex(/^\d{6}$/, 'OTP must be a 6-digit code'),
})

const verifyOtpSchema = z.object({
  email: z.string().email(),
  code: z.string().regex(/^\d{6}$/, 'OTP must be a 6-digit code'),
})

const resendOtpSchema = z.object({
  email: z.string().email(),
})

// Signup
router.post(
  '/register',
  authRequestLimiter,
  otpSendLimiter,
  validate(registerSchema),
  asyncHandler(register)
)

router.post(
  '/verify-email',
  otpVerifyLimiter,
  validate(verifyOtpSchema),
  asyncHandler(verifySignup)
)

router.post(
  '/resend-verification',
  otpSendLimiter,
  validate(resendOtpSchema),
  asyncHandler(resendSignupVerification)
)

// Login
router.post(
  '/login',
  authRequestLimiter,
  otpSendLimiter,
  validate(loginSchema),
  asyncHandler(login)
)

router.post(
  '/verify-login',
  otpVerifyLimiter,
  validate(verifyOtpSchema),
  asyncHandler(verifyLogin)
)

router.post(
  '/resend-login-otp',
  otpSendLimiter,
  validate(resendOtpSchema),
  asyncHandler(resendLoginVerification)
)
// Forgot Password
router.post(
  '/forgot-password',
  authRequestLimiter,
  otpSendLimiter,
  validate(forgotPasswordSchema),
  asyncHandler(forgotPasswordController)
)

// Reset Password
router.post(
  '/reset-password',
  authRequestLimiter,
  otpVerifyLimiter,
  validate(resetPasswordSchema),
  asyncHandler(resetPasswordController)
)

// Email change
router.post(
  '/email-change/request',
  authMiddleware,
  otpSendLimiter,
  validate(requestEmailChangeSchema),
  asyncHandler(requestEmailChangeController)
)

router.post(
  '/email-change/verify',
  authMiddleware,
  otpVerifyLimiter,
  validate(verifyEmailChangeSchema),
  asyncHandler(verifyEmailChangeController)
)

// Current user
router.get('/me', authMiddleware, asyncHandler(getCurrentUser))

// Profile and settings
router.patch(
  '/profile',
  authMiddleware,
  validate(updateProfileSchema),
  asyncHandler(updateProfile)
)

router.patch(
  '/password',
  authMiddleware,
  validate(changePasswordSchema),
  asyncHandler(changePassword)
)

router.patch(
  '/notification-preferences',
  authMiddleware,
  validate(notificationPreferencesSchema),
  asyncHandler(updateNotificationPreferences)
)

router.patch(
  '/email-preferences',
  authMiddleware,
  validate(emailPreferencesSchema),
  asyncHandler(updateEmailPreferences)
)

// Logout
router.post('/logout', asyncHandler(logout))

export default router
