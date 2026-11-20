import type { RequestHandler } from 'express'
import User from '../models/user.model.js'
import { verifyToken } from '../utils/jwt.js'
import AppError from '../utils/AppError.js'
import { env } from '../config/env.js'

const authMiddleware: RequestHandler = async (req, _res, next) => {
  try {
    const token = req.cookies?.[env.COOKIE_NAME]

    if (!token) {
      throw new AppError('Authentication required', 401)
    }

    const decoded = verifyToken(token)

    const user = await User.findById(decoded.userId)

    if (!user) {
      throw new AppError('User not found', 401)
    }

    req.user = user

    next()
  } catch (error) {
    next(
      error instanceof AppError
        ? error
        : new AppError('Invalid or expired token', 401)
    )
  }
}

export default authMiddleware