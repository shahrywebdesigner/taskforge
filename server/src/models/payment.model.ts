
import mongoose, { Schema, Document } from 'mongoose'

export type PaymentPlan = 'monthly' | 'yearly'

export type PaymentStatus =
  | 'pending'
  | 'paid'
  | 'failed'
  | 'expired'

export interface IPayment extends Document {
  user: mongoose.Types.ObjectId
  plan: PaymentPlan
  status: PaymentStatus
  amount: number
  currency: string
  stripeCheckoutSessionId: string | null
  stripePaymentIntentId: string | null
  paidAt: Date | null
  periodStart: Date | null
  periodEnd: Date | null
}

const paymentSchema = new Schema<IPayment>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    plan: {
      type: String,
      enum: ['monthly', 'yearly'],
      required: true,
    },

    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'expired'],
      default: 'pending',
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    currency: {
      type: String,
      required: true,
      lowercase: true,
    },

stripeCheckoutSessionId: {
  type: String,
  default: null,
},

    stripePaymentIntentId: {
      type: String,
      default: null,
    },

    paidAt: {
      type: Date,
      default: null,
    },

    periodStart: {
      type: Date,
      default: null,
    },

    periodEnd: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

paymentSchema.index(
  { user: 1, plan: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: 'pending',
    },
  }
)

paymentSchema.index(
  { stripeCheckoutSessionId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      stripeCheckoutSessionId: { $type: 'string' },
    },
  }
)

const Payment = mongoose.model<IPayment>(
  'Payment',
  paymentSchema
)

export default Payment
