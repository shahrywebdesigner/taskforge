
import mongoose from 'mongoose'
import Stripe from 'stripe'

import Payment from '../models/payment.model.js'
import User from '../models/user.model.js'
import EmailJob from '../models/email-job.model.js'
import { createEmailTemplate } from '../templates/email.template.js'

const addPlanDuration = (
  startDate: Date,
  plan: 'monthly' | 'yearly'
) => {
  const result = new Date(startDate)
  const originalDay = result.getUTCDate()

  result.setUTCDate(1)

  if (plan === 'monthly') {
    result.setUTCMonth(result.getUTCMonth() + 1)
  } else {
    result.setUTCFullYear(result.getUTCFullYear() + 1)
  }

  const lastDay = new Date(
    Date.UTC(
      result.getUTCFullYear(),
      result.getUTCMonth() + 1,
      0
    )
  ).getUTCDate()

  result.setUTCDate(Math.min(originalDay, lastDay))

  return result
}

const formatDate = (date: Date) =>
  date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  })

const formatPrice = (amount: number, currency: string) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100)

type FulfillmentResult =
  | 'activated'
  | 'already_paid'
  | 'not_found'
  | 'not_pending'
  | 'invalid_payment'
  | 'user_not_found'
  | 'not_paid'

export const fulfillCheckoutSession = async (
  checkoutSession: Stripe.Checkout.Session,
  expectedUserId?: string
): Promise<FulfillmentResult> => {
  if (
    checkoutSession.livemode !== false ||
    checkoutSession.mode !== 'payment'
  ) {
    return 'invalid_payment'
  }

  if (checkoutSession.payment_status !== 'paid') {
    return 'not_paid'
  }

  const { paymentId, userId, plan } =
    checkoutSession.metadata || {}

  if (
    !paymentId ||
    !userId ||
    (plan !== 'monthly' && plan !== 'yearly')
  ) {
    return 'invalid_payment'
  }

  if (
    !mongoose.isValidObjectId(paymentId) ||
    !mongoose.isValidObjectId(userId)
  ) {
    return 'invalid_payment'
  }

  if (expectedUserId && userId !== expectedUserId) {
    return 'invalid_payment'
  }

  const transactionResult: { value: FulfillmentResult } = {
  value: 'not_found',
}

  const dbSession = await mongoose.startSession()

  try {
    await dbSession.withTransaction(async () => {
      const payment = await Payment.findOne({
        _id: paymentId,
        user: userId,
        stripeCheckoutSessionId: checkoutSession.id,
        plan,
      }).session(dbSession)

      if (!payment) {
        transactionResult.value = 'not_found'
        return
      }

      if (
        checkoutSession.amount_total !== payment.amount ||
        checkoutSession.currency?.toLowerCase() !==
          payment.currency.toLowerCase()
      ) {
        transactionResult.value = 'invalid_payment'
        return
      }

      if (payment.status === 'paid') {
        transactionResult.value = 'already_paid'
        return
      }

      if (payment.status !== 'pending') {
        transactionResult.value = 'not_pending'
        return
      }

      const user = await User.findById(userId).session(dbSession)

      if (!user) {
        transactionResult.value = 'user_not_found'
        return
      }

      const now = new Date()

      const isRenewal =
        user.plan === 'pro' &&
        Boolean(user.proExpiresAt && user.proExpiresAt > now)

      const currentExpiry = isRenewal
        ? user.proExpiresAt!
        : now

      const newExpiry = addPlanDuration(currentExpiry, plan)

      payment.status = 'paid'
      payment.paidAt = now
      payment.periodStart = currentExpiry
      payment.periodEnd = newExpiry
      payment.stripePaymentIntentId =
        typeof checkoutSession.payment_intent === 'string'
          ? checkoutSession.payment_intent
          : checkoutSession.payment_intent?.id || null

      user.plan = 'pro'
      user.proExpiresAt = newExpiry

      await payment.save({ session: dbSession })
      await user.save({ session: dbSession })

      transactionResult.value = 'activated'
    })
  } finally {
    await dbSession.endSession()
  }

  // Email is queued after the payment transaction.
  // Email failure must never roll back a successful payment.
  if (
  transactionResult.value === 'activated' ||
  transactionResult.value === 'already_paid'
) {
    try {
      const payment = await Payment.findOne({
        _id: paymentId,
        user: userId,
        stripeCheckoutSessionId: checkoutSession.id,
        status: 'paid',
      })

      const user = await User.findById(userId)

      if (payment && user && payment.periodEnd && payment.paidAt) {
        const planName =
          plan === 'monthly' ? 'Monthly Pro' : 'Yearly Pro'

        const emailMessage = [
          `Hi ${user.name},`,
          '',
          'Thank you for purchasing TaskForge Pro. Your subscription is active.',
          '',
          `Plan: ${planName}`,
          `Amount paid: ${formatPrice(payment.amount, payment.currency)}`,
          `Purchase date: ${formatDate(payment.paidAt)}`,
          `Subscription valid until: ${formatDate(payment.periodEnd)}`,
          '',
          'You can now continue enjoying your TaskForge Pro features.',
        ].join('\n')

        const html = createEmailTemplate({
          title: 'Your TaskForge Pro subscription is active!',
          message: emailMessage,
          footer: 'Thank you for choosing TaskForge.',
        })

        await EmailJob.updateOne(
          {
            eventKey: `pro-payment-confirmation:${payment._id.toString()}`,
          },
          {
            $setOnInsert: {
              recipient: user.email,
              subject: 'TaskForge Pro — Purchase Confirmation',
              html,
              text: emailMessage,
              status: 'pending',
              attempts: 0,
              maxAttempts: 5,
              nextAttemptAt: new Date(),
            },
          },
          { upsert: true }
        )
      }
    } catch (error) {
      console.error(
        'TaskForge payment confirmation email queue failed:',
        error
      )
    }
  }

  return transactionResult.value
}
