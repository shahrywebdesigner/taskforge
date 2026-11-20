
import mongoose from 'mongoose'
import stripe from '../config/stripe.js'
import { env } from '../config/env.js'
import Payment, { type PaymentPlan } from '../models/payment.model.js'
import User from '../models/user.model.js'
import AppError from '../utils/AppError.js'
import Stripe from 'stripe'
import { fulfillCheckoutSession } from './payment-fulfillment.service.js'

const planConfig = {
  monthly: {
    amount: env.STRIPE_MONTHLY_AMOUNT,
    name: 'TaskForge Pro Monthly',
  },
  yearly: {
    amount: env.STRIPE_YEARLY_AMOUNT,
    name: 'TaskForge Pro Yearly',
  },
}


export const createCheckoutSession = async (
  userId: string,
  plan: PaymentPlan
) => {
  if (!mongoose.isValidObjectId(userId)) {
    throw new AppError('Invalid user ID', 400)
  }

  const user = await User.findById(userId).select('name email')

  if (!user) {
    throw new AppError('User not found', 404)
  }

  const selectedPlan = planConfig[plan]

  if (!selectedPlan) {
    throw new AppError('Invalid subscription plan', 400)
  }

  // Reuse an existing pending checkout for the same user and plan.
  const existingPayment = await Payment.findOne({
    user: user._id,
    plan,
    status: 'pending',
  }).sort({ createdAt: -1 })

  if (existingPayment?.stripeCheckoutSessionId) {
    let existingSession: Stripe.Checkout.Session

try {
  existingSession = await stripe.checkout.sessions.retrieve(
    existingPayment.stripeCheckoutSessionId
  )
} catch (error) {
  console.error('Existing Stripe session retrieval failed:', error)

  throw new AppError(
    'Unable to verify your existing checkout session. Please try again.',
    502
  )
}

    if (existingSession.status === 'open' && existingSession.url) {
      return {
        checkoutUrl: existingSession.url,
        sessionId: existingSession.id,
      }
    }

    if (existingSession.status === 'complete') {
      throw new AppError(
        'Your payment is being processed. Please wait before trying again.',
        409
      )
    }

    if (existingSession.status === 'expired') {
      existingPayment.status = 'expired'
      await existingPayment.save()
    }
  } else if (existingPayment) {
    throw new AppError(
      'Your checkout session is being prepared. Please try again shortly.',
      409
    )
  }

let payment

try {
  payment = await Payment.create({
    user: user._id,
    plan,
    status: 'pending',
    amount: selectedPlan.amount,
    currency: env.STRIPE_CURRENCY,
  })
} catch (error) {
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 11000
  ) {
    throw new AppError(
      'A checkout session is already being prepared. Please try again shortly.',
      409
    )
  }

  throw error
}

  const baseUrl = env.CLIENT_URL.replace(/\/$/, '')

  let session: Stripe.Checkout.Session

  try {
    session = await stripe.checkout.sessions.create(
      {
        mode: 'payment',
        customer_email: user.email,
        line_items: [
          {
            price_data: {
              currency: env.STRIPE_CURRENCY,
              product_data: {
                name: selectedPlan.name,
                description: 'TaskForge Pro subscription',
              },
              unit_amount: selectedPlan.amount,
            },
            quantity: 1,
          },
        ],
        metadata: {
          paymentId: payment._id.toString(),
          userId: user._id.toString(),
          plan,
        },
        success_url: `${baseUrl}/billing?payment=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/billing?payment=cancelled`,
      },
      {
        idempotencyKey: `taskforge-checkout-${payment._id.toString()}`,
      }
    )
  } catch (error) {
    payment.status = 'failed'
    await payment.save()

    console.error('Stripe checkout creation failed:', error)

    throw new AppError(
      'Unable to create Stripe checkout session',
      502
    )
  }

  if (!session.url) {
    payment.status = 'failed'
    await payment.save()

    throw new AppError(
      'Stripe checkout URL was not returned',
      502
    )
  }

  payment.stripeCheckoutSessionId = session.id
  await payment.save()

  return {
    checkoutUrl: session.url,
    sessionId: session.id,
  }
}

export const getPaymentStatus = async (
  userId: string,
  sessionId: string
) => {
  if (!sessionId || !sessionId.startsWith('cs_test_')) {
    throw new AppError('Invalid checkout session ID', 400)
  }

  // 1. Verify payment belongs to the logged-in user
  const payment = await Payment.findOne({
    user: userId,
    stripeCheckoutSessionId: sessionId,
  }).select('plan status amount currency paidAt periodEnd')

  if (!payment) {
    throw new AppError('Payment record not found', 404)
  }

  // 2. Retrieve actual session from Stripe
  let checkoutSession: Stripe.Checkout.Session

  try {
    checkoutSession =
      await stripe.checkout.sessions.retrieve(sessionId)
  } catch (error) {
    console.error('Stripe session retrieval failed:', error)

    throw new AppError(
      'Unable to verify payment with Stripe',
      502
    )
  }
  // Expired Stripe sessions should also expire in our database.
if (checkoutSession.status === 'expired') {
  if (payment.status === 'pending') {
    payment.status = 'expired'
    await payment.save()
  }

  return {
    plan: payment.plan,
    status: payment.status,
    amount: payment.amount,
    currency: payment.currency,
    paidAt: payment.paidAt,
    expiresAt: payment.periodEnd,
  }
}
  // 3. Fulfill payment using the shared service
  const result = await fulfillCheckoutSession(
    checkoutSession,
    userId
  )

  if (result === 'invalid_payment') {
    throw new AppError('Invalid payment details', 400)
  }

  if (result === 'not_found' || result === 'user_not_found') {
    throw new AppError('Payment or user record not found', 404)
  }

  // 4. Fetch updated payment from database
  const updatedPayment = await Payment.findOne({
    user: userId,
    stripeCheckoutSessionId: sessionId,
  }).select('plan status amount currency paidAt periodEnd')

  if (!updatedPayment) {
    throw new AppError('Payment record not found', 404)
  }

  return {
    plan: updatedPayment.plan,
    status: updatedPayment.status,
    amount: updatedPayment.amount,
    currency: updatedPayment.currency,
    paidAt: updatedPayment.paidAt,
    expiresAt: updatedPayment.periodEnd,
  }
}

