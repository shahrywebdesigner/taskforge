
import { resend, emailConfig } from '../config/email.js'
import EmailJob from '../models/email-job.model.js'
import { createEmailTemplate } from '../templates/email.template.js'

interface SendEmailInput {
  to: string
  subject: string
  title: string
  message: string
  code?: string
  footer?: string
}

interface QueueEmailInput {
  eventKey: string
  to: string
  subject: string
  title: string
  message: string
  footer?: string
}

// Direct email: OTP aur verification emails ke liye.
export const sendEmail = async ({
  to,
  subject,
  title,
  message,
  code,
  footer,
}: SendEmailInput) => {
  const html = createEmailTemplate({
    title,
    message,
    code,
    footer,
  })

  const { data, error } = await resend.emails.send({
    from: emailConfig.from,
    to,
    subject,
    html,
    text: `${title}\n\n${message}${code ? `\n\nVerification code: ${code}` : ''}`,
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

// Queue email: activity notifications ke liye.
export const queueEmail = async ({
  eventKey,
  to,
  subject,
  title,
  message,
  footer,
}: QueueEmailInput) => {
  const html = createEmailTemplate({
    title,
    message,
    footer,
  })

  const text = `${title}\n\n${message}${footer ? `\n\n${footer}` : ''}`

  await EmailJob.updateOne(
    { eventKey },
    {
      $setOnInsert: {
        eventKey,
        recipient: to,
        subject,
        html,
        text,
        status: 'pending',
        attempts: 0,
        maxAttempts: 5,
        nextAttemptAt: new Date(),
      },
    },
    { upsert: true }
  )
}
