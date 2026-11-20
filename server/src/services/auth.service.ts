
import type { IUser, INotificationPreferences } from '../models/user.model.js'
import { hashPassword, comparePassword } from '../utils/password.js'
import AppError from '../utils/AppError.js'
import { generateToken } from '../utils/jwt.js'
import { isProActive } from './subscription.service.js'
import { sendOtp, verifyOtp } from './otp.service.js'
import OtpChallenge from '../models/otp-challenge.model.js'
import User, { type IEmailPreferences } from '../models/user.model.js'

interface RegisterInput {
  name: string
  username: string
  email: string
  password: string
}

const formatUser = (user: IUser) => {
  const activePro = isProActive(user)

  return {
    id: user._id.toString(),
    name: user.name,
    username: user.username,
    email: user.email,
    createdAt: user.createdAt,
    plan: activePro ? 'pro' : 'free',
    proExpiresAt: user.proExpiresAt,
    isProActive: activePro,
    notificationPreferences: user.notificationPreferences,
    isEmailVerified: user.isEmailVerified,
    emailPreferences: user.emailPreferences ?? {
  workspace: true,
  project: true,
  task: true,
  comments: true,
},
  }
}

// Register user and send signup OTP
export const registerUser = async (data: RegisterInput) => {
  const normalizedEmail = data.email.trim().toLowerCase()
  const normalizedUsername = data.username.trim().toLowerCase()

  const existingUser = await User.findOne({
    $or: [
      { email: normalizedEmail },
      { username: normalizedUsername },
    ],
  })

  if (existingUser) {
    if (existingUser.email === normalizedEmail) {
      if (!existingUser.isEmailVerified) {
        await sendOtp({
          userId: existingUser._id.toString(),
          email: normalizedEmail,
          purpose: 'signup',
        })

        return {
          message: 'Verification code sent again to your email',
          email: normalizedEmail,
        }
      }

      throw new AppError('Email is already registered', 409)
    }

    throw new AppError('Username is already taken', 409)
  }

  const hashedPassword = await hashPassword(data.password)

  const user = await User.create({
    name: data.name,
    username: normalizedUsername,
    email: normalizedEmail,
    password: hashedPassword,
    isEmailVerified: false,
    emailVerifiedAt: null,
  })

  await sendOtp({
    userId: user._id.toString(),
    email: normalizedEmail,
    purpose: 'signup',
  })

  return {
    message: 'Account created. Please verify your email using the OTP sent to you.',
    email: normalizedEmail,
  }
}

// Verify signup email
export const verifySignupEmail = async (data: {
  email: string
  code: string
}) => {
  const normalizedEmail = data.email.trim().toLowerCase()

  const user = await User.findOne({ email: normalizedEmail })

  if (!user) {
    throw new AppError('Invalid email or verification code', 400)
  }

  if (user.isEmailVerified) {
    throw new AppError('Email is already verified. Please login.', 409)
  }

  await verifyOtp({
    userId: user._id.toString(),
    email: normalizedEmail,
    purpose: 'signup',
    code: data.code,
  })

  user.isEmailVerified = true
  user.emailVerifiedAt = new Date()
  await user.save()

  const token = generateToken(user._id.toString())

  return {
    token,
    user: formatUser(user),
  }
}

// Resend signup OTP
export const resendSignupOtp = async (email: string) => {
  const normalizedEmail = email.trim().toLowerCase()

  const user = await User.findOne({ email: normalizedEmail })

  if (!user) {
    throw new AppError('Account not found', 404)
  }

  if (user.isEmailVerified) {
    throw new AppError('Email is already verified. Please login.', 409)
  }

  return sendOtp({
    userId: user._id.toString(),
    email: normalizedEmail,
    purpose: 'signup',
  })
}

interface LoginInput {
  email: string
  password: string
}

// Step 1: Verify password and send login OTP
export const loginUser = async (data: LoginInput) => {
  const normalizedEmail = data.email.trim().toLowerCase()

  const user = await User.findOne({
    email: normalizedEmail,
  }).select('+password')

  if (!user) {
    throw new AppError('Invalid email or password', 401)
  }

  const isPasswordValid = await comparePassword(
    data.password,
    user.password
  )

  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401)
  }

  if (!user.isEmailVerified) {
    throw new AppError(
      'Please verify your email before logging in',
      403
    )
  }

  await sendOtp({
    userId: user._id.toString(),
    email: normalizedEmail,
    purpose: 'login',
  })

  return {
    email: normalizedEmail,
    message: 'Login verification code sent to your email',
  }
}

// Step 2: Verify login OTP and generate authentication token
export const verifyLoginOtp = async (data: {
  email: string
  code: string
}) => {
  const normalizedEmail = data.email.trim().toLowerCase()

  const user = await User.findOne({
    email: normalizedEmail,
  })

  if (!user || !user.isEmailVerified) {
    throw new AppError('Invalid email or verification code', 400)
  }

  await verifyOtp({
    userId: user._id.toString(),
    email: normalizedEmail,
    purpose: 'login',
    code: data.code,
  })

  const token = generateToken(user._id.toString())

  return {
    token,
    user: formatUser(user),
  }
}

// Resend login OTP
export const resendLoginOtp = async (email: string) => {
  const normalizedEmail = email.trim().toLowerCase()

  const user = await User.findOne({
    email: normalizedEmail,
  })

  if (!user || !user.isEmailVerified) {
    throw new AppError('Account not found', 404)
  }

  return sendOtp({
    userId: user._id.toString(),
    email: normalizedEmail,
    purpose: 'login',
  })
}

// Get current user profile
export const getUserProfile = async (userId: string) => {
  const user = await User.findById(userId)

  if (!user) {
    throw new AppError('User not found', 404)
  }

  return formatUser(user)
}

// Update profile
interface UpdateProfileInput {
  name: string
  username: string
}

export const updateUserProfile = async (
  userId: string,
  data: UpdateProfileInput
) => {
  const name = data.name.trim()
  const username = data.username.trim().toLowerCase()

  const currentUser = await User.findById(userId)

  if (!currentUser) {
    throw new AppError('User not found', 404)
  }

  const existingUser = await User.findOne({
    _id: { $ne: userId },
    username,
  })

  if (existingUser) {
    throw new AppError('Username is already taken', 409)
  }

  currentUser.name = name
  currentUser.username = username
  await currentUser.save()

  return formatUser(currentUser)
}

// Change password
interface ChangePasswordInput {
  currentPassword: string
  newPassword: string
}

export const changeUserPassword = async (
  userId: string,
  data: ChangePasswordInput
) => {
  const user = await User.findById(userId).select('+password')

  if (!user) {
    throw new AppError('User not found', 404)
  }

  const isCurrentPasswordValid = await comparePassword(
    data.currentPassword,
    user.password
  )

  if (!isCurrentPasswordValid) {
    throw new AppError('Current password is incorrect', 400)
  }

  const hashedPassword = await hashPassword(data.newPassword)

  user.password = hashedPassword
  await user.save()

  return { message: 'Password updated successfully' }
}

// Update notification preferences
export const updateUserNotificationPreferences = async (
  userId: string,
  preferences: INotificationPreferences
) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { notificationPreferences: preferences },
    { new: true, runValidators: true }
  )

  if (!user) {
    throw new AppError('User not found', 404)
  }

  return user.notificationPreferences
}

interface RequestEmailChangeInput {
  newEmail: string
}

// Step 1: Send OTP to the new email address.
export const requestEmailChange = async (
  userId: string,
  newEmail: string
) => {
  const normalizedEmail = newEmail.trim().toLowerCase()

  const user = await User.findById(userId)

  if (!user) {
    throw new AppError('User not found', 404)
  }

  if (normalizedEmail === user.email) {
    throw new AppError('This is already your current email', 400)
  }

  const existingUser = await User.findOne({
    email: normalizedEmail,
    _id: { $ne: userId },
  })

  if (existingUser) {
    throw new AppError('This email is already registered', 409)
  }

  const result = await sendOtp({
    userId,
    email: normalizedEmail,
    purpose: 'email_change',
  })

  return {
    email: normalizedEmail,
    message: result.message,
    expiresInMinutes: result.expiresInMinutes,
    resendAfterSeconds: result.resendAfterSeconds,
  }
}

// Step 2: Verify OTP and update the email.
export const verifyEmailChange = async (
  userId: string,
  code: string
) => {
  const challenge = await OtpChallenge.findOne({
    user: userId,
    purpose: 'email_change',
    consumedAt: null,
    expiresAt: { $gt: new Date() },
  })

  if (!challenge) {
    throw new AppError('Verification code expired or not found', 400)
  }

  const newEmail = challenge.email

  const existingUser = await User.findOne({
    email: newEmail,
    _id: { $ne: userId },
  })

  if (existingUser) {
    throw new AppError('This email is already registered', 409)
  }

  await verifyOtp({
    userId,
    email: newEmail,
    purpose: 'email_change',
    code,
  })

  const user = await User.findById(userId)

  if (!user) {
    throw new AppError('User not found', 404)
  }

  user.email = newEmail
  await user.save()

  return {
    email: user.email,
    message: 'Email address updated successfully',
  }
}


export const updateUserEmailPreferences = async (
  userId: string,
  preferences: IEmailPreferences
) => {
  const user = await User.findById(userId)

  if (!user) {
    throw new AppError('User not found', 404)
  }

  user.emailPreferences = preferences
  await user.save()

  return {
    workspace: user.emailPreferences.workspace,
    project: user.emailPreferences.project,
    task: user.emailPreferences.task,
    comments: user.emailPreferences.comments,
  }
}

// Request password reset OTP
export const forgotPassword = async (email: string) => {
  const normalizedEmail = email.trim().toLowerCase()

  const genericMessage =
    'If an account with this email exists, a password reset code has been sent.'

  const user = await User.findOne({
    email: normalizedEmail,
    isEmailVerified: true,
  })
  console.log('[FORGOT PASSWORD DEBUG]', {
  email: normalizedEmail,
  userFound: Boolean(user),
  emailVerified: user?.isEmailVerified,
})

  // Generic response prevents account enumeration.
  if (!user) {
    return { message: genericMessage }
  }

  await sendOtp({
    userId: user._id.toString(),
    email: normalizedEmail,
    purpose: 'password_reset',
  })

  return { message: genericMessage }
}

// Verify password reset OTP and update password
interface ResetPasswordInput {
  email: string
  code: string
  newPassword: string
}

export const resetPassword = async (data: ResetPasswordInput) => {
  const normalizedEmail = data.email.trim().toLowerCase()

  const user = await User.findOne({
    email: normalizedEmail,
    isEmailVerified: true,
  }).select('+password')

  if (!user) {
    throw new AppError('Invalid or expired verification code', 400)
  }

  // Hash the new password before consuming the OTP.
  const hashedPassword = await hashPassword(data.newPassword)

  await verifyOtp({
    userId: user._id.toString(),
    email: normalizedEmail,
    purpose: 'password_reset',
    code: data.code,
  })

  user.password = hashedPassword
  await user.save()

  return {
    message: 'Password reset successfully. Please login with your new password.',
  }
}

