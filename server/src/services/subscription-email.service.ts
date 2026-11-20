
import User from '../models/user.model.js'
import Payment from '../models/payment.model.js'
import { emailConfig } from '../config/email.js'
import { queueEmail } from './email.service.js'

const DAY = 24 * 60 * 60 * 1000
const CHECK_INTERVAL = 60 * 60 * 1000

let schedulerStarted = false

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

const processSubscriptionEmails = async () => {
  const now = new Date()
  const sevenDaysLater = new Date(now.getTime() + 7 * DAY)

  const users = await User.find({
    plan: 'pro',
    proExpiresAt: {
      $ne: null,
      $lte: sevenDaysLater,
    },
  }).select('_id name email proExpiresAt')

  for (const user of users) {
    try {
      if (!user.proExpiresAt) continue

      const expiry = user.proExpiresAt
      const expiryTimestamp = expiry.getTime()

      const payment = await Payment.findOne({
        user: user._id,
        status: 'paid',
        periodEnd: expiry,
      })
        .sort({ createdAt: -1 })
        .select('plan amount currency')

      const planName =
        payment?.plan === 'yearly'
          ? 'Yearly Pro'
          : payment?.plan === 'monthly'
            ? 'Monthly Pro'
            : 'TaskForge Pro'

      const billingUrl = `${emailConfig.appUrl.replace(/\/$/, '')}/billing`

      let eventKey: string
      let subject: string
      let title: string
      let message: string

      if (expiry <= now) {
        eventKey = `pro-expired:${user._id}:${expiryTimestamp}`
        subject = 'TaskForge Pro — Subscription Expired'
        title = 'Your TaskForge Pro subscription has expired'

        message = [
          `Hi ${user.name},`,
          '',
          'Your TaskForge Pro subscription has expired.',
          '',
          `Previous plan: ${planName}`,
          `Expiry date: ${formatDate(expiry)}`,
          '',
          'Your existing workspaces and data remain available according to your account permissions, but Pro-only management features require an active subscription.',
          '',
          `Visit ${billingUrl} to renew your subscription.`,
        ].join('\n')
      } else if (expiry.getTime() - now.getTime() <= DAY) {
        eventKey = `pro-reminder-1d:${user._id}:${expiryTimestamp}`
        subject = 'TaskForge Pro — Expires Tomorrow'
        title = 'Your TaskForge Pro subscription expires tomorrow'

        message = [
          `Hi ${user.name},`,
          '',
          'This is a reminder that your TaskForge Pro subscription expires within the next 24 hours.',
          '',
          `Plan: ${planName}`,
          `Expiry date: ${formatDate(expiry)}`,
          '',
          `Renew now to continue enjoying Pro features: ${billingUrl}`,
        ].join('\n')
      } else {
        eventKey = `pro-reminder-7d:${user._id}:${expiryTimestamp}`
        subject = 'TaskForge Pro — 7-Day Renewal Reminder'
        title = 'Your TaskForge Pro subscription expires in 7 days or less'

        message = [
          `Hi ${user.name},`,
          '',
          'Your TaskForge Pro subscription is approaching its expiry date.',
          '',
          `Plan: ${planName}`,
          `Expiry date: ${formatDate(expiry)}`,
          '',
          `You can renew your subscription here: ${billingUrl}`,
        ].join('\n')
      }

      const priceDetails =
        payment
          ? `\nPlan price: ${formatPrice(payment.amount, payment.currency)}`
          : ''

      await queueEmail({
        eventKey,
        to: user.email,
        subject,
        title,
        message: `${message}${priceDetails}`,
        footer: 'Thank you for being part of TaskForge.',
      })
    } catch (error) {
      console.error(
        `Subscription email scheduling failed for user ${user._id}:`,
        error
      )
    }
  }
}

export const startSubscriptionEmailScheduler = () => {
  if (schedulerStarted) return

  schedulerStarted = true

  console.log('TaskForge subscription email scheduler started')

  const run = async () => {
    try {
      await processSubscriptionEmails()
    } catch (error) {
      console.error('Subscription email scheduler error:', error)
    } finally {
      setTimeout(run, CHECK_INTERVAL)
    }
  }

  void run()
}
