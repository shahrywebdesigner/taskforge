
import { Resend } from 'resend'

const apiKey = process.env.RESEND_API_KEY

if (!apiKey) {
  throw new Error('RESEND_API_KEY is missing from environment variables')
}

export const resend = new Resend(apiKey)

export const emailConfig = {
  from: process.env.EMAIL_FROM || 'TaskForge <onboarding@resend.dev>',
  appUrl: process.env.APP_URL || 'http://localhost:5173',
}
