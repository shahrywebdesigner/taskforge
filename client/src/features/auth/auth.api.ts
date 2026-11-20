
import api from '../../lib/axios'

import type {
  NotificationPreferences,
  EmailPreferences,
  User,
  RegisterResponse,
  AuthResponse,
  CurrentUserResponse,
  OtpActionResponse,
} from './auth.types'
export interface RegisterData {
  name: string
  username: string
  email: string
  password: string
}

export interface LoginData {
  email: string
  password: string
}

export interface LoginOtpResponse {
  success: boolean
  message: string
  data: {
    email: string
    requiresLoginVerification: boolean
  }
}

export interface UpdateProfileData {
  name: string
  username: string
}

export interface ChangePasswordData {
  currentPassword: string
  newPassword: string
}

export interface ForgotPasswordResponse {
  success: boolean
  message: string
}

export interface ResetPasswordData {
  email: string
  code: string
  newPassword: string
}

// Signup
export const registerUser = async (
  data: RegisterData
): Promise<RegisterResponse> => {
  const response = await api.post('/auth/register', data)
  return response.data
}

export const verifySignupEmail = async (
  email: string,
  code: string
): Promise<AuthResponse> => {
  const response = await api.post('/auth/verify-email', {
    email,
    code,
  })

  return response.data
}

export const resendSignupVerification = async (
  email: string
): Promise<OtpActionResponse> => {
  const response = await api.post('/auth/resend-verification', {
    email,
  })

  return response.data
}

// Login OTP
export const loginUser = async (
  data: LoginData
): Promise<LoginOtpResponse> => {
  const response = await api.post('/auth/login', data)
  return response.data
}

export const verifyLoginOtp = async (
  email: string,
  code: string
): Promise<AuthResponse> => {
  const response = await api.post('/auth/verify-login', {
    email,
    code,
  })

  return response.data
}

export const resendLoginOtp = async (
  email: string
): Promise<OtpActionResponse> => {
  const response = await api.post('/auth/resend-login-otp', {
    email,
  })

  return response.data
}

// Current user
export const getCurrentUser = async (): Promise<CurrentUserResponse> => {
  const response = await api.get('/auth/me')
  return response.data
}

export const logoutUser = async () => {
  const response = await api.post('/auth/logout')
  return response.data
}

// Profile
export const updateProfile = async (data: UpdateProfileData) => {
  const response = await api.patch('/auth/profile', data)
  return response.data as { success: boolean; data: User }
}

// Password
export const changePassword = async (data: ChangePasswordData) => {
  const response = await api.patch('/auth/password', data)
  return response.data
}

// Forgot Password
export const forgotPassword = async (
  email: string
): Promise<ForgotPasswordResponse> => {
  const response = await api.post('/auth/forgot-password', {
    email,
  })

  return response.data
}

export const resetPassword = async (
  data: ResetPasswordData
): Promise<ForgotPasswordResponse> => {
  const response = await api.post('/auth/reset-password', data)

  return response.data
}

// In-app notification preferences
export const updateNotificationPreferences = async (
  data: NotificationPreferences
) => {
  const response = await api.patch(
    '/auth/notification-preferences',
    data
  )

  return response.data
}


export const requestEmailChange = async (newEmail: string) => {
  const response = await api.post('/auth/email-change/request', {
    newEmail,
  })

  return response.data
}

export const verifyEmailChange = async (code: string) => {
  const response = await api.post('/auth/email-change/verify', {
    code,
  })

  return response.data as {
    success: boolean
    message: string
    data: {
      email: string
    }
  }
}

export const updateEmailPreferences = async (
  preferences: EmailPreferences
) => {
  const response = await api.patch(
    '/auth/email-preferences',
    preferences
  )

  return response.data
}