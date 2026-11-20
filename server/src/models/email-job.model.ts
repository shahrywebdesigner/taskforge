import mongoose, { Schema, Document } from 'mongoose'

export type EmailJobStatus =
  | 'pending'
  | 'processing'
  | 'sent'
  | 'failed'
  | 'cancelled'

export interface IEmailJob extends Document {
  eventKey: string
  recipient: string
  subject: string
  html: string
  text?: string
  status: EmailJobStatus
  attempts: number
  maxAttempts: number
  nextAttemptAt: Date
  processingAt?: Date | null
  sentAt?: Date | null
  lastError?: string | null
  createdAt: Date
  updatedAt: Date
}

const emailJobSchema = new Schema<IEmailJob>(
  {
    eventKey: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    recipient: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    html: {
      type: String,
      required: true,
    },
    text: {
      type: String,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'sent', 'failed', 'cancelled'],
      default: 'pending',
      index: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    maxAttempts: {
      type: Number,
      default: 5,
    },
    nextAttemptAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    processingAt: {
      type: Date,
      default: null,
    },
    sentAt: {
      type: Date,
      default: null,
    },
    lastError: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
)

emailJobSchema.index({ status: 1, nextAttemptAt: 1 })

const EmailJob = mongoose.model<IEmailJob>(
  'EmailJob',
  emailJobSchema
)

export default EmailJob