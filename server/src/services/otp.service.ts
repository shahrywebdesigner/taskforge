
import { randomInt, createHmac, timingSafeEqual } from 'crypto'
import mongoose from 'mongoose'

import OtpChallenge, {
  type OtpPurpose,
} from '../models/otp-challenge.model.js'

import { sendEmail } from './email.service.js'
import AppError from '../utils/AppError.js'

const OTP_EXPIRY_MINUTES = 10
const RESEND_COOLDOWN_SECONDS = 60
const MAX_OTP_ATTEMPTS = 5

const hashOtp = (code: string): string => {
  const secret = process.env.OTP_SECRET

  if (!secret) {
    throw new AppError('OTP_SECRET is not configured', 500)
  }

  return createHmac('sha256', secret).update(code).digest('hex')
}

const isValidHash = (code: string, storedHash: string): boolean => {
  const submittedHash = Buffer.from(hashOtp(code), 'hex')
  const savedHash = Buffer.from(storedHash, 'hex')

  return (
    submittedHash.length === savedHash.length &&
    timingSafeEqual(submittedHash, savedHash)
  )
}

const getOtpEmailContent = (purpose: OtpPurpose) => {
  switch (purpose) {
    case 'signup':
      return {
        subject: 'Verify your TaskForge account',
        title: 'Verify Your Email',
        message:
          'Welcome to TaskForge! Use the verification code below to verify your email address and activate your account.',
      }

    case 'login':
      return {
        subject: 'Your TaskForge login verification code',
        title: 'Verify Your Login',
        message:
          'Someone has requested to sign in to your TaskForge account. Enter this code to complete your login. If this was not you, do not share this code.',
      }

    case 'email_change':
      return {
        subject: 'Verify your new TaskForge email',
        title: 'Confirm Your New Email',
        message:
          'You requested to change the email address linked to your TaskForge account. Enter this code to confirm your new email address.',
      }
      case 'password_reset':
  return {
    subject: 'Reset your TaskForge password',
    title: 'Password Reset Verification',
    message:
      'You requested to reset your TaskForge password. Enter the verification code below to continue. If this was not you, do not share this code.',
  }
  }
}

export const sendOtp = async ({
  userId,
  email,
  purpose,
}: {
  userId: string
  email: string
  purpose: OtpPurpose
}) => {
  if (!mongoose.isValidObjectId(userId)) {
    throw new AppError('Invalid user ID', 400)
  }

  const normalizedEmail = email.trim().toLowerCase()
  const now = new Date()

  const activeChallenge = await OtpChallenge.findOne({
    user: userId,
    purpose,
    consumedAt: null,
  })

  if (
    activeChallenge &&
    activeChallenge.resendAfter.getTime() > now.getTime() &&
    activeChallenge.expiresAt.getTime() > now.getTime()
  ) {
    throw new AppError(
      'Please wait before requesting another OTP',
      429
    )
  }

  const code = randomInt(100000, 1000000).toString()
  const content = getOtpEmailContent(purpose)

  await OtpChallenge.findOneAndUpdate(
    { user: userId, purpose },
    {
      $set: {
        email: normalizedEmail,
        codeHash: hashOtp(code),
        expiresAt: new Date(
          now.getTime() + OTP_EXPIRY_MINUTES * 60 * 1000
        ),
        attempts: 0,
        resendAfter: new Date(
          now.getTime() + RESEND_COOLDOWN_SECONDS * 1000
        ),
        consumedAt: null,
      },
    },
    { upsert: true, new: true, runValidators: true }
  )

  try {
    await sendEmail({
      to: normalizedEmail,
      subject: content.subject,
      title: content.title,
      message: content.message,
      code,
      footer: `This code expires in ${OTP_EXPIRY_MINUTES} minutes. Never share it with anyone.`,
    })
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[DEV OTP FALLBACK]', {
        purpose,
        email: normalizedEmail,
        code,
        message:
          error instanceof Error
            ? error.message
            : String(error),
      })
    } else {
      await OtpChallenge.updateOne(
        { user: userId, purpose, consumedAt: null },
        { $set: { consumedAt: new Date() } }
      )

      throw new AppError(
        'Unable to send verification email. Please try again.',
        503
      )
    }
  }

  return {
    message: 'Verification code sent to your email',
    expiresInMinutes: OTP_EXPIRY_MINUTES,
    resendAfterSeconds: RESEND_COOLDOWN_SECONDS,
  }
}

export const verifyOtp = async ({
  userId,
  email,
  purpose,
  code,
}: {
  userId: string
  email: string
  purpose: OtpPurpose
  code: string
}) => {
  if (!mongoose.isValidObjectId(userId)) {
    throw new AppError('Invalid user ID', 400)
  }

  if (!/^\d{6}$/.test(code)) {
    throw new AppError('Invalid verification code', 400)
  }

  const challenge = await OtpChallenge.findOne({
    user: userId,
    email: email.trim().toLowerCase(),
    purpose,
    consumedAt: null,
    expiresAt: { $gt: new Date() },
  })

  if (!challenge) {
    throw new AppError('OTP is invalid or has expired', 400)
  }

  if (challenge.attempts >= MAX_OTP_ATTEMPTS) {
    challenge.consumedAt = new Date()
    await challenge.save()

    throw new AppError('Too many incorrect attempts. Request a new OTP.', 429)
  }

  if (!isValidHash(code, challenge.codeHash)) {
    challenge.attempts += 1

    if (challenge.attempts >= MAX_OTP_ATTEMPTS) {
      challenge.consumedAt = new Date()
    }

    await challenge.save()

    throw new AppError(
      challenge.attempts >= MAX_OTP_ATTEMPTS
        ? 'Too many incorrect attempts. Request a new OTP.'
        : 'Incorrect verification code',
      challenge.attempts >= MAX_OTP_ATTEMPTS ? 429 : 400
    )
  }

  challenge.consumedAt = new Date()
  await challenge.save()

  return { verified: true }
}
