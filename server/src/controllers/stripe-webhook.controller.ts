
import type { Request, Response } from 'express'
import Stripe from 'stripe'

import stripe from '../config/stripe.js'
import { env } from '../config/env.js'
import { fulfillCheckoutSession } from '../services/payment-fulfillment.service.js'

export const handleStripeWebhook = async (
  req: Request,
  res: Response
): Promise<void> => {
  const signature = req.headers['stripe-signature']

  if (!signature || typeof signature !== 'string') {
    res.status(400).json({
      success: false,
      message: 'Missing Stripe signature',
    })
    return
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    )
  } catch (error) {
    console.error('Stripe webhook signature verification failed:', error)

    res.status(400).json({
      success: false,
      message: 'Invalid Stripe webhook signature',
    })
    return
  }

  if (event.type !== 'checkout.session.completed') {
    res.status(200).json({ received: true })
    return
  }

  const checkoutSession =
    event.data.object as Stripe.Checkout.Session

  try {
    const result = await fulfillCheckoutSession(checkoutSession)

    if (result === 'not_found') {
      res.status(404).json({
        success: false,
        message: 'Payment record not found',
      })
      return
    }

    if (result === 'invalid_payment') {
      res.status(400).json({
        success: false,
        message: 'Payment details are invalid',
      })
      return
    }

    if (result === 'user_not_found') {
      res.status(404).json({
        success: false,
        message: 'User not found',
      })
      return
    }

    if (result === 'not_pending') {
      res.status(200).json({
        received: true,
        message: 'Payment is no longer pending',
      })
      return
    }

    if (result === 'not_paid') {
      res.status(200).json({
        received: true,
        message: 'Checkout payment is not completed',
      })
      return
    }

    res.status(200).json({
      received: true,
      message:
        result === 'already_paid'
          ? 'Payment was already processed'
          : 'Payment processed successfully',
    })
  } catch (error) {
    console.error('Stripe webhook processing failed:', error)

    res.status(500).json({
      success: false,
      message: 'Webhook processing failed',
    })
  }
}
