import User from '../models/user.model.js'
import AppError from '../utils/AppError.js'

interface SubscriptionUser {
  plan?: string
  proExpiresAt?: Date | null
}

export const isProActive = (
  user: SubscriptionUser | null | undefined
): boolean => {
  if (!user || user.plan !== 'pro' || !user.proExpiresAt) {
    return false
  }

  return user.proExpiresAt.getTime() > Date.now()
}

export const requireActivePro = async (userId: string): Promise<void> => {
  const user = await User.findById(userId).select('plan proExpiresAt')

  if (!user) {
    throw new AppError('User not found', 404)
  }

  if (!isProActive(user)) {
    throw new AppError(
      'An active Pro subscription is required to perform this action.',
      403
    )
  }
}