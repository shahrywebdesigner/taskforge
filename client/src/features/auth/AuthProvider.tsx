
import {
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react'

import { AuthContext } from './AuthContext'

import {
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
  verifySignupEmail,
  resendSignupVerification as resendSignupVerificationApi,
  verifyLoginOtp as verifyLoginOtpApi,
  resendLoginOtp as resendLoginOtpApi,
} from './auth.api'

import type {
  User,
  AuthResponse,
  CurrentUserResponse,
  RegisterResponse,
} from './auth.types'

import type { LoginData, RegisterData } from './auth.api'

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response: CurrentUserResponse = await getCurrentUser()
        setUser(response.data)
      } catch {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

       void checkAuth()
  }, [])

  // Signup
  const register = async (data: RegisterData) => {
    const response: RegisterResponse = await registerUser(data)

    return {
      email: response.data.email,
    }
  }

  const verifySignup = async (email: string, code: string) => {
    const response: AuthResponse = await verifySignupEmail(email, code)
    setUser(response.data)
  }

  const resendSignupVerification = async (email: string) => {
    await resendSignupVerificationApi(email)
  }

  // Login: password verification sends OTP.
  const login = async (data: LoginData) => {
    const response = await loginUser(data)

    return {
      email: response.data.email,
    }
  }

  // Login: authenticate only after OTP verification.
  const verifyLogin = async (email: string, code: string) => {
    const response: AuthResponse = await verifyLoginOtpApi(email, code)
    setUser(response.data)
  }

  const resendLoginOtp = async (email: string) => {
    await resendLoginOtpApi(email)
  }

  const refreshUser = useCallback(async () => {
    const response: CurrentUserResponse = await getCurrentUser()
    setUser(response.data)
  }, [])

const logout = async () => {
  await logoutUser()
  setUser(null)

  localStorage.removeItem('taskforge_selected_workspace_id')
  localStorage.removeItem('taskforge_selected_workspace_name')
}

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        verifySignup,
        resendSignupVerification,
        login,
        verifyLogin,
        resendLoginOtp,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
