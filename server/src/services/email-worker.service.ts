import { resend, emailConfig } from '../config/email.js'
import EmailJob from '../models/email-job.model.js'
import User from '../models/user.model.js'

const POLL_INTERVAL = 5000
const PROCESSING_TIMEOUT = 10 * 60 * 1000
const MAX_BACKOFF = 60 * 60 * 1000
const DAY = 24 * 60 * 60 * 1000

let workerRunning = false

const getRetryDelay = (attempts: number) => {
  return Math.min(
    60 * 1000 * Math.pow(2, Math.max(0, attempts - 1)),
    MAX_BACKOFF
  )
}

/**
 * Subscription emails have event keys in this format:
 * pro-reminder-7d:<userId>:<expiryTimestamp>
 * pro-reminder-1d:<userId>:<expiryTimestamp>
 * pro-expired:<userId>:<expiryTimestamp>
 *
 * Before sending, verify that the subscription still has
 * the same expiry date and that this reminder is still relevant.
 */
const isSubscriptionEmailStillValid = async (
  eventKey: string
): Promise<boolean> => {
  const match = eventKey.match(
    /^(pro-reminder-7d|pro-reminder-1d|pro-expired):([a-f\d]{24}):(\d+)$/i
  )

  // Normal activity emails are not subscription emails.
  if (!match) return true

  const [, eventType, userId, expiryTimestamp] = match
  const expectedExpiry = Number(expiryTimestamp)

  if (!Number.isFinite(expectedExpiry)) {
    return false
  }

  const user = await User.findById(userId)
    .select('plan proExpiresAt')
    .lean()

  if (
    !user ||
    user.plan !== 'pro' ||
    !user.proExpiresAt ||
    new Date(user.proExpiresAt).getTime() !== expectedExpiry
  ) {
    return false
  }

  const now = Date.now()

  if (eventType === 'pro-expired') {
    return expectedExpiry <= now
  }

  if (eventType === 'pro-reminder-1d') {
    return expectedExpiry > now && expectedExpiry <= now + DAY
  }

  if (eventType === 'pro-reminder-7d') {
    return (
      expectedExpiry > now + DAY &&
      expectedExpiry <= now + 7 * DAY
    )
  }

  return false
}

const claimNextEmail = async () => {
  const now = new Date()
  const staleProcessingTime = new Date(
    now.getTime() - PROCESSING_TIMEOUT
  )

  return EmailJob.findOneAndUpdate(
    {
      attempts: { $lt: 5 },
      $or: [
        {
          status: 'pending',
          nextAttemptAt: { $lte: now },
        },
        {
          status: 'processing',
          processingAt: { $lte: staleProcessingTime },
        },
      ],
    },
    {
      $set: {
        status: 'processing',
        processingAt: now,
      },
      $inc: {
        attempts: 1,
      },
    },
    {
      new: true,
      sort: { nextAttemptAt: 1, createdAt: 1 },
    }
  )
}

const processEmail = async () => {
  const job = await claimNextEmail()

  if (!job) return false

  try {
    const isValid = await isSubscriptionEmailStillValid(
      job.eventKey
    )

    if (!isValid) {
      await EmailJob.updateOne(
        {
          _id: job._id,
          status: 'processing',
        },
        {
          $set: {
            status: 'cancelled',
            processingAt: null,
            lastError:
              'Subscription changed or reminder is no longer relevant.',
          },
        }
      )

      console.log(`Subscription email cancelled: ${job.eventKey}`)
      return true
    }

    const { error } = await resend.emails.send({
      from: emailConfig.from,
      to: job.recipient,
      subject: job.subject,
      html: job.html,
      ...(job.text && { text: job.text }),
    })

    if (error) {
      throw new Error(error.message)
    }

    await EmailJob.updateOne(
      {
        _id: job._id,
        status: 'processing',
      },
      {
        $set: {
          status: 'sent',
          sentAt: new Date(),
          processingAt: null,
          lastError: null,
        },
      }
    )

    console.log(`Email sent: ${job.eventKey}`)
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'Unknown email delivery error'

    const hasAttemptsLeft = job.attempts < job.maxAttempts

    if (hasAttemptsLeft) {
      const retryAt = new Date(
        Date.now() + getRetryDelay(job.attempts)
      )

      await EmailJob.updateOne(
        {
          _id: job._id,
          status: 'processing',
        },
        {
          $set: {
            status: 'pending',
            nextAttemptAt: retryAt,
            processingAt: null,
            lastError: errorMessage.slice(0, 2000),
          },
        }
      )

      console.error(
        `Email failed. Retry scheduled: ${job.eventKey}`,
        errorMessage
      )
    } else {
      await EmailJob.updateOne(
        {
          _id: job._id,
          status: 'processing',
        },
        {
          $set: {
            status: 'failed',
            processingAt: null,
            lastError: errorMessage.slice(0, 2000),
          },
        }
      )

      console.error(
        `Email permanently failed: ${job.eventKey}`,
        errorMessage
      )
    }
  }

  return true
}

const recoverExhaustedJobs = async () => {
  await EmailJob.updateMany(
    {
      status: 'processing',
      attempts: { $gte: 5 },
      processingAt: {
        $lte: new Date(Date.now() - PROCESSING_TIMEOUT),
      },
    },
    {
      $set: {
        status: 'failed',
        processingAt: null,
        lastError: 'Maximum email delivery attempts reached',
      },
    }
  )
}

export const startEmailWorker = () => {
  if (workerRunning) return

  workerRunning = true

  console.log('TaskForge email worker started')

  const run = async () => {
    try {
      await recoverExhaustedJobs()

      while (await processEmail()) {
        // Process available jobs sequentially.
      }
    } catch (error) {
      console.error('Email worker error:', error)
    } finally {
      setTimeout(run, POLL_INTERVAL)
    }
  }

  void run()
}