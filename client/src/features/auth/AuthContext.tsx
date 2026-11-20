
import { createContext } from 'react'

import type { User } from './auth.types'
import type { LoginData, RegisterData } from './auth.api'

export interface AuthContextType {
  user: User | null
  loading: boolean

  register: (data: RegisterData) => Promise<{ email: string }>
  verifySignup: (email: string, code: string) => Promise<void>
  resendSignupVerification: (email: string) => Promise<void>

  login: (data: LoginData) => Promise<{ email: string }>
  verifyLogin: (email: string, code: string) => Promise<void>
  resendLoginOtp: (email: string) => Promise<void>

  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
)
