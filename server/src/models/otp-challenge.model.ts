
import mongoose, { Schema, Document } from 'mongoose'

export type OtpPurpose =
  | 'signup'
  | 'login'
  | 'email_change'
  | 'password_reset'

export interface IOtpChallenge extends Document {
  user: mongoose.Types.ObjectId
  email: string
  purpose: OtpPurpose
  codeHash: string
  expiresAt: Date
  attempts: number
  resendAfter: Date
  consumedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

const otpChallengeSchema = new Schema<IOtpChallenge>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    purpose: {
      type: String,
      enum: ['signup', 'login', 'email_change', 'password_reset'],
      required: true,
    },
    codeHash: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    resendAfter: {
      type: Date,
      required: true,
    },
    consumedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
)

// Automatically delete expired OTP challenges.
otpChallengeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

// One active challenge record per user and purpose.
otpChallengeSchema.index(
  { user: 1, purpose: 1 },
  { unique: true }
)

const OtpChallenge = mongoose.model<IOtpChallenge>(
  'OtpChallenge',
  otpChallengeSchema
)

export default OtpChallenge
