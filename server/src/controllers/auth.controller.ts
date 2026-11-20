
import type { Request, Response } from 'express'

import {
  registerUser,
  loginUser,
  verifySignupEmail,
  resendSignupOtp,
  verifyLoginOtp,
  resendLoginOtp,
  getUserProfile,
  updateUserProfile,
  changeUserPassword,
  updateUserNotificationPreferences,
  updateUserEmailPreferences,
  requestEmailChange,
  verifyEmailChange,
  forgotPassword,
  resetPassword,
} from '../services/auth.service.js'

import { setAuthCookie, clearAuthCookie } from '../utils/cookie.js'
import AppError from '../utils/AppError.js'


const getUserId = (req: Request) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401)
  }

  return req.user._id.toString()
}

export const register = async (req: Request, res: Response) => {
  const result = await registerUser(req.body)

  res.status(202).json({
    success: true,
    message: result.message,
    data: {
      email: result.email,
      requiresEmailVerification: true,
    },
  })
}

export const verifySignup = async (req: Request, res: Response) => {
  const { token, user } = await verifySignupEmail(req.body)

  setAuthCookie(res, token)

  res.status(200).json({
    success: true,
    message: 'Email verified and account activated successfully',
    data: user,
  })
}

export const resendSignupVerification = async (
  req: Request,
  res: Response
) => {
  const result = await resendSignupOtp(req.body.email)

  res.status(200).json({
    success: true,
    message: result.message,
    data: {
      expiresInMinutes: result.expiresInMinutes,
      resendAfterSeconds: result.resendAfterSeconds,
    },
  })
}

// Step 1: Password verification. No auth cookie is created here.
export const login = async (req: Request, res: Response) => {
  const result = await loginUser(req.body)

  res.status(202).json({
    success: true,
    message: result.message,
    data: {
      email: result.email,
      requiresLoginVerification: true,
    },
  })
}

// Step 2: OTP verification. Auth cookie is created only here.
export const verifyLogin = async (req: Request, res: Response) => {
  const { token, user } = await verifyLoginOtp(req.body)

  setAuthCookie(res, token)

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: user,
  })
}

export const resendLoginVerification = async (
  req: Request,
  res: Response
) => {
  const result = await resendLoginOtp(req.body.email)

  res.status(200).json({
    success: true,
    message: result.message,
    data: {
      expiresInMinutes: result.expiresInMinutes,
      resendAfterSeconds: result.resendAfterSeconds,
    },
  })
}

export const getCurrentUser = async (req: Request, res: Response) => {
  const user = await getUserProfile(getUserId(req))

  res.status(200).json({
    success: true,
    data: user,
  })
}

export const updateProfile = async (req: Request, res: Response) => {
  const user = await updateUserProfile(getUserId(req), req.body)

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: user,
  })
}

export const changePassword = async (req: Request, res: Response) => {
  const result = await changeUserPassword(getUserId(req), req.body)

  res.status(200).json({
    success: true,
    message: result.message,
  })
}

export const updateNotificationPreferences = async (
  req: Request,
  res: Response
) => {
  const preferences = await updateUserNotificationPreferences(
    getUserId(req),
    req.body
  )

  res.status(200).json({
    success: true,
    message: 'Notification preferences updated successfully',
    data: preferences,
  })
}

export const logout = async (_req: Request, res: Response) => {
  clearAuthCookie(res)

  res.status(200).json({
    success: true,
    message: 'Logout successful',
  })
}


export const requestEmailChangeController = async (
  req: Request,
  res: Response
) => {
  const result = await requestEmailChange(
    getUserId(req),
    req.body.newEmail
  )

  res.status(200).json({
    success: true,
    message: result.message,
    data: {
      email: result.email,
      expiresInMinutes: result.expiresInMinutes,
      resendAfterSeconds: result.resendAfterSeconds,
    },
  })
}

export const verifyEmailChangeController = async (
  req: Request,
  res: Response
) => {
  const result = await verifyEmailChange(
    getUserId(req),
    req.body.code
  )

  res.status(200).json({
    success: true,
    message: result.message,
    data: {
      email: result.email,
    },
  })
}

export const updateEmailPreferences = async (
  req: Request,
  res: Response
) => {
  const preferences = await updateUserEmailPreferences(
    req.user!._id.toString(),
    req.body
  )

  res.status(200).json({
    success: true,
    message: 'Email preferences updated successfully',
    data: preferences,
  })
}

// Request password reset OTP
export const forgotPasswordController = async (
  req: Request,
  res: Response
) => {
  const result = await forgotPassword(req.body.email)

  res.status(200).json({
    success: true,
    message: result.message,
  })
}

// Verify OTP and update password
export const resetPasswordController = async (
  req: Request,
  res: Response
) => {
  const result = await resetPassword(req.body)

  res.status(200).json({
    success: true,
    message: result.message,
  })
}