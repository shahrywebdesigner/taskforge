
import type { Request, Response } from 'express'
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../services/notification.service.js'

export const getNotifications = async (
  req: Request,
  res: Response
) => {
  const userId = req.user!._id.toString()

  const page = Math.max(1, Number(req.query.page) || 1)
  const limit = Math.min(
    50,
    Math.max(1, Number(req.query.limit) || 20)
  )

  const result = await getUserNotifications(userId, page, limit)

  res.status(200).json({
    success: true,
    ...result,
  })
}

export const markAsRead = async (
  req: Request,
  res: Response
) => {
  const userId = req.user!._id.toString()

  const notification = await markNotificationAsRead(
    req.params.notificationId as string,
    userId
  )

  res.status(200).json({
    success: true,
    message: 'Notification marked as read',
    notification,
  })
}

export const markAllAsRead = async (
  req: Request,
  res: Response
) => {
  const userId = req.user!._id.toString()

  const result = await markAllNotificationsAsRead(userId)

  res.status(200).json({
    success: true,
    message: 'All notifications marked as read',
    ...result,
  })
}
