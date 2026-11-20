
import mongoose, { Schema, Document } from 'mongoose'

export interface INotificationPreferences {
  workspace: boolean
  project: boolean
  task: boolean
  comments: boolean
}

export interface IEmailPreferences {
  workspace: boolean
  project: boolean
  task: boolean
  comments: boolean
}

export interface IUser extends Document {
  name: string
  username?: string
  email: string
  password: string
  createdAt: Date
  updatedAt: Date
  plan: 'free' | 'pro'
  proExpiresAt: Date | null
  notificationPreferences: INotificationPreferences
  isEmailVerified: boolean
  emailVerifiedAt: Date | null
  emailPreferences: IEmailPreferences
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },

    username: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },

    plan: {
      type: String,
      enum: ['free', 'pro'],
      default: 'free',
      required: true,
    },

    proExpiresAt: {
      type: Date,
      default: null,
    },

    notificationPreferences: {
      workspace: { type: Boolean, default: true },
      project: { type: Boolean, default: true },
      task: { type: Boolean, default: true },
      comments: { type: Boolean, default: true },
    },
    emailPreferences: {
  workspace: { type: Boolean, default: true },
  project: { type: Boolean, default: true },
  task: { type: Boolean, default: true },
  comments: { type: Boolean, default: true },
},

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    emailVerifiedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
)

const User = mongoose.model<IUser>('User', userSchema)

export default User
