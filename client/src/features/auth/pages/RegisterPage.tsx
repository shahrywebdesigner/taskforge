
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import axios from 'axios'

import Input from '../../../components/ui/Input'
import Button from '../../../components/ui/Button'
import { useAuth } from '../useAuth'

function RegisterPage() {
  const navigate = useNavigate()

  const {
    register,
    verifySignup,
    resendSignupVerification,
  } = useAuth()

  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')

  const [step, setStep] = useState<'register' | 'verify'>('register')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Step 1: Create account and send OTP.
  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const result = await register({
        name,
        username,
        email,
        password,
      })

      setEmail(result.email)
      setStep('verify')
      setSuccess(`A verification code has been sent to ${result.email}.`)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
            'Registration failed. Please try again.'
        )
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Verify OTP and authenticate user.
  const handleVerify = async (event: FormEvent<HTMLFormElement>) => {
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
            'Verification failed. Please try again.'
        )
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  // Resend signup OTP.
  const handleResend = async () => {
    setError('')
    setSuccess('')
    setResending(true)

    try {
      await resendSignupVerification(email)

      setSuccess('A new verification code has been sent to your email.')
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

        {step === 'register' ? (
          <>
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-bold text-slate-900">
                Create your account
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Get started with TaskForge today
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-5">
              <Input
                label="Full name"
                placeholder="Your name"
                value={name}
                onChange={setName}
              />

              <Input
                label="Username"
                placeholder="e.g. shahryar_01"
                value={username}
                onChange={(value) => setUsername(value.toLowerCase())}
              />

              <p className="-mt-3 text-xs text-slate-500">
                3–20 characters. Letters, numbers and underscores only.
              </p>

              <Input
                label="Email address"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={setEmail}
              />

              <Input
                label="Password"
                type="password"
                placeholder="At least 8 characters"
                value={password}
                onChange={setPassword}
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

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>
          </>
        ) : (
          <>
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-bold text-slate-900">
                Verify your email
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Enter the 6-digit code sent to
              </p>

              <p className="mt-1 text-sm font-medium text-slate-800">
                {email}
              </p>
            </div>

            <form onSubmit={handleVerify} className="space-y-5">
              <Input
                label="Verification code"
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
                {loading ? 'Verifying...' : 'Verify Email'}
              </Button>
            </form>

            <div className="mt-5 text-center">
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
              >
                {resending ? 'Sending...' : 'Resend verification code'}
              </button>
            </div>
          </>
        )}

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-indigo-600 hover:text-indigo-700"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default RegisterPage
