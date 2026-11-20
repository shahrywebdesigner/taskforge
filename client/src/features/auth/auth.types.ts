
export interface NotificationPreferences {
  workspace: boolean
  project: boolean
  task: boolean
  comments: boolean
}

export interface EmailPreferences {
  workspace: boolean
  project: boolean
  task: boolean
  comments: boolean
}

export interface User {
  id: string
  name: string
  username?: string
  email: string
  createdAt: string
  plan: 'free' | 'pro'
  proExpiresAt: string | null
  isProActive: boolean
  isEmailVerified: boolean
  notificationPreferences: NotificationPreferences
  emailPreferences: EmailPreferences
}

export interface AuthResponse {
  success: boolean
  message: string
  data: User
}

export interface CurrentUserResponse {
  success: boolean
  data: User
}

export interface RegisterResponse {
  success: boolean
  message: string
  data: {
    email: string
    requiresEmailVerification: boolean
  }
}

export interface OtpActionResponse {
  success: boolean
  message: string
  data: {
    expiresInMinutes?: number
    resendAfterSeconds?: number
  }
}
