
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import axios from 'axios'

import Input from '../../../components/ui/Input'
import Button from '../../../components/ui/Button'
import { useAuth } from '../useAuth'
import {
  forgotPassword,
  resetPassword,
} from '../auth.api'

type Step =
  | 'login'
  | 'verify-login'
  | 'verify-signup'
  | 'forgot-password'
  | 'reset-password'

function LoginPage() {
  const navigate = useNavigate()

  const {
    login,
    verifyLogin,
    resendLoginOtp,
    verifySignup,
    resendSignupVerification,
  } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [step, setStep] = useState<Step>('login')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Step 1: Login and request login OTP.
  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const result = await login({ email, password })

      setEmail(result.email)
      setOtp('')
      setStep('verify-login')
      setSuccess(
        `A login verification code has been sent to ${result.email}.`
      )
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.message

        if (
          err.response?.status === 403 &&
          message === 'Please verify your email before logging in'
        ) {
          setStep('verify-signup')
          setOtp('')
          setSuccess(
            'Your email is not verified. Please enter your signup verification code.'
          )
        } else {
          setError(message || 'Login failed. Please try again.')
        }
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  // Step 2A: Verify signup email.
  const handleSignupVerify = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()

    setError('')
    setSuccess('')

    if (!/^\d{6}$/.test(otp)) {
      setError('Please enter a valid 6-digit verification code.')
      return
    }

    setLoading(true)

    try {
      await verifySignup(email, otp)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
            'Email verification failed. Please try again.'
        )
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  // Step 2B: Verify login OTP.
  const handleLoginVerify = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()

    setError('')
    setSuccess('')

    if (!/^\d{6}$/.test(otp)) {
      setError('Please enter a valid 6-digit verification code.')
      return
    }

    setLoading(true)

    try {
      await verifyLogin(email, otp)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
            'OTP verification failed. Please try again.'
        )
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  // Step 3: Request password reset OTP.
  const handleForgotPassword = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()

    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const result = await forgotPassword(email.trim())

      setOtp('')
      setNewPassword('')
      setConfirmPassword('')
      setStep('reset-password')
      setSuccess(result.message)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
            'Unable to request a password reset code. Please try again.'
        )
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  // Step 4: Verify OTP and save new password.
  const handleResetPassword = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()

    setError('')
    setSuccess('')

    if (!/^\d{6}$/.test(otp)) {
      setError('Please enter a valid 6-digit verification code.')
      return
    }

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters.')
      return
    }

    if (newPassword.length > 72) {
      setError('Password cannot exceed 72 characters.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match.')
      return
    }

    setLoading(true)

    try {
      const result = await resetPassword({
        email: email.trim(),
        code: otp,
        newPassword,
      })

      setStep('login')
      setPassword('')
      setOtp('')
      setNewPassword('')
      setConfirmPassword('')
      setError('')
      setSuccess(result.message)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
            'Password reset failed. Please try again.'
        )
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  // Resend the correct OTP according to current step.
  const handleResend = async () => {
    setError('')
    setSuccess('')
    setResending(true)

    try {
      if (step === 'verify-signup') {
        await resendSignupVerification(email)
        setSuccess(
          'A new signup verification code has been sent to your email.'
        )
      } else if (step === 'verify-login') {
        await resendLoginOtp(email)
        setSuccess(
          'A new login verification code has been sent to your email.'
        )
      } else if (step === 'reset-password') {
        const result = await forgotPassword(email.trim())
        setSuccess(result.message)
      }

      setOtp('')
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
            'Unable to resend code. Please try again later.'
        )
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setResending(false)
    }
  }

  const handleBack = () => {
    setStep('login')
    setOtp('')
    setPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setError('')
    setSuccess('')
  }

  const isSignupVerification = step === 'verify-signup'
  const isVerificationStep =
    step === 'verify-login' || step === 'verify-signup'

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

        {/* Login */}
        {step === 'login' && (
          <>
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-bold text-slate-900">
                Welcome back
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Sign in to your TaskForge account
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <Input
                label="Email address"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={setEmail}
              />

              <div>
                <Input
                  label="Password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={setPassword}
                />

                <div className="mt-2 text-right">
                  <button
                    type="button"
                    onClick={() => {
                      setError('')
                      setSuccess('')
                      setStep('forgot-password')
                    }}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                  >
                    Forgot Password?
                  </button>
                </div>
              </div>

              {error && (
                <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </p>
              )}

              {success && (
                <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
                  {success}
                </p>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Checking account...' : 'Continue'}
              </Button>
            </form>
          </>
        )}

        {/* Forgot Password: Email */}
        {step === 'forgot-password' && (
          <>
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-bold text-slate-900">
                Forgot password?
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Enter your registered email address. We'll send you a password reset code if an account exists.
              </p>
            </div>

            <form
              onSubmit={handleForgotPassword}
              className="space-y-5"
            >
              <Input
                label="Email address"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={setEmail}
              />

              {error && (
                <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full"
              >
                {loading ? 'Sending code...' : 'Send Reset Code'}
              </Button>
            </form>

            <div className="mt-5 text-center">
              <button
                type="button"
                onClick={handleBack}
                className="text-sm text-slate-500 hover:text-slate-700"
              >
                Back to login
              </button>
            </div>
          </>
        )}

        {/* Reset Password: OTP + New Password */}
        {step === 'reset-password' && (
          <>
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-bold text-slate-900">
                Reset your password
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Enter the verification code sent to
              </p>

              <p className="mt-1 text-sm font-medium text-slate-800">
                {email}
              </p>
            </div>

            <form
              onSubmit={handleResetPassword}
              className="space-y-5"
            >
              <Input
                label="Verification code"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(value) =>
                  setOtp(value.replace(/\D/g, '').slice(0, 6))
                }
              />

              <Input
                label="New password"
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={setNewPassword}
              />

              <Input
                label="Confirm new password"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={setConfirmPassword}
              />

              {error && (
                <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </p>
              )}

              {success && (
                <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
                  {success}
                </p>
              )}

              <Button
                type="submit"
                disabled={
                  loading ||
                  otp.length !== 6 ||
                  !newPassword ||
                  !confirmPassword
                }
                className="w-full"
              >
                {loading ? 'Resetting password...' : 'Reset Password'}
              </Button>
            </form>

            <div className="mt-5 text-center">
              <button
                type="button"
                onClick={handleResend}
                disabled={resending || loading}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
              >
                {resending ? 'Sending...' : 'Resend reset code'}
              </button>
            </div>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={handleBack}
                className="text-sm text-slate-500 hover:text-slate-700"
              >
                Back to login
              </button>
            </div>
          </>
        )}

        {/* Signup/Login OTP Verification */}
        {isVerificationStep && (
          <>
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-bold text-slate-900">
                {isSignupVerification
                  ? 'Verify your email'
                  : 'Verify your login'}
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                {isSignupVerification
                  ? 'Your account needs email verification. Enter the signup code sent to'
                  : 'Enter the login verification code sent to'}
              </p>

              <p className="mt-1 text-sm font-medium text-slate-800">
                {email}
              </p>
            </div>

            <form
              onSubmit={
                isSignupVerification
                  ? handleSignupVerify
                  : handleLoginVerify
              }
              className="space-y-5"
            >
              <Input
                label={
                  isSignupVerification
                    ? 'Email verification code'
                    : 'Login verification code'
                }
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(value) =>
                  setOtp(value.replace(/\D/g, '').slice(0, 6))
                }
              />

              {error && (
                <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </p>
              )}

              {success && (
                <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
                  {success}
                </p>
              )}

              <Button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full"
              >
                {loading
                  ? 'Verifying...'
                  : isSignupVerification
                    ? 'Verify Email'
                    : 'Verify & Sign In'}
              </Button>
            </form>

            <div className="mt-5 text-center">
              <button
                type="button"
                onClick={handleResend}
                disabled={resending || loading}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
              >
                {resending ? 'Sending...' : 'Resend verification code'}
              </button>
            </div>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={handleBack}
                className="text-sm text-slate-500 hover:text-slate-700"
              >
                Back to login
              </button>
            </div>
          </>
        )}

        <p className="mt-6 text-center text-sm text-slate-500">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="font-medium text-indigo-600 hover:text-indigo-700"
          >
            Create account
          </Link>
        </p>

      </div>
    </div>
  )
}

export default LoginPage
