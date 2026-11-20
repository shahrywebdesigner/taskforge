
import api from '../../lib/axios'

export type PaymentPlan = 'monthly' | 'yearly'

export interface CheckoutResponse {
  success: boolean
  message: string
  data: {
    checkoutUrl: string
    sessionId: string
  }
}

export interface PaymentStatusResponse {
  success: boolean
  data: {
    plan: PaymentPlan
    status: 'pending' | 'paid' | 'failed' | 'expired'
    amount: number
    currency: string
    paidAt: string | null
    expiresAt: string | null
  }
}

export const createCheckoutSession = async (plan: PaymentPlan) => {
  const response = await api.post<CheckoutResponse>(
    '/billing/checkout',
    { plan }
  )

  return response.data
}

export const getPaymentStatus = async (sessionId: string) => {
  const response = await api.get<PaymentStatusResponse>(
    `/billing/status/${encodeURIComponent(sessionId)}`
  )

  return response.data
}
