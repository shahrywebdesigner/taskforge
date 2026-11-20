
import mongoose, { Types } from 'mongoose'

import Notification, {
  type NotificationType,
} from '../models/notification.model.js'

import User from '../models/user.model.js'
import AppError from '../utils/AppError.js'
import { queueEmail } from './email.service.js'

interface CreateNotificationInput {
  recipient: string
  actor?: string
  workspace?: string
  project?: string
  task?: string
  type: NotificationType
  title: string
  message: string
}

type NotificationCategory =
  | 'workspace'
  | 'project'
  | 'task'
  | 'comments'

const getNotificationCategory = (
  type: NotificationType
): NotificationCategory => {
  switch (type) {
    case 'workspace_invitation':
    case 'workspace_updated':
      return 'workspace'

    case 'project_created':
    case 'project_updated':
      return 'project'

    case 'task_assigned':
    case 'task_updated':
    case 'task_completed':
      return 'task'

    case 'comment_added':
      return 'comments'
  }
}

export const createNotification = async (
  data: CreateNotificationInput
) => {
  if (!mongoose.isValidObjectId(data.recipient)) {
    throw new AppError('Invalid notification recipient', 400)
  }

  if (data.actor && data.actor === data.recipient) {
    return null
  }

  const recipient = await User.findById(data.recipient)
    .select('email name notificationPreferences emailPreferences')
    .lean()

  if (!recipient) {
    return null
  }

  const category = getNotificationCategory(data.type)

  // In-app preference independently check hogi.
  const inAppEnabled =
    recipient.notificationPreferences?.[category] ?? true

  // Email preference independently check hogi.
  const emailEnabled =
    recipient.emailPreferences?.[category] ?? true

  const eventId = new Types.ObjectId()

  let notification = null

  if (inAppEnabled) {
    notification = await Notification.create({
      _id: eventId,
      recipient: new Types.ObjectId(data.recipient),

      ...(data.actor && {
        actor: new Types.ObjectId(data.actor),
      }),

      ...(data.workspace && {
        workspace: new Types.ObjectId(data.workspace),
      }),

      ...(data.project && {
        project: new Types.ObjectId(data.project),
      }),

      ...(data.task && {
        task: new Types.ObjectId(data.task),
      }),

      type: data.type,
      title: data.title,
      message: data.message,
    })
  }

  // Activity email ko persistent queue mein add karein.
  if (emailEnabled && recipient.email) {
    try {
      await queueEmail({
        eventKey: `activity:${eventId.toString()}`,
        to: recipient.email,
        subject: `TaskForge - ${data.title}`,
        title: data.title,
        message: data.message,
        footer: 'You received this email because activity emails are enabled in your TaskForge settings.',
      })
    } catch (error) {
      // Email queue failure se main application operation fail nahi hogi.
      console.error('Failed to queue activity email:', error)
    }
  }

  return notification
}

export const getUserNotifications = async (
  userId: string,
  page = 1,
  limit = 20
) => {
  const skip = (page - 1) * limit

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find({ recipient: userId })
      .populate('actor', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    Notification.countDocuments({ recipient: userId }),

    Notification.countDocuments({
      recipient: userId,
      isRead: false,
    }),
  ])

  return {
    notifications,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    unreadCount,
  }
}

export const markNotificationAsRead = async (
  notificationId: string,
  userId: string
) => {
  if (!mongoose.isValidObjectId(notificationId)) {
    throw new AppError('Invalid notification ID', 400)
  }

  const notification = await Notification.findOneAndUpdate(
    {
      _id: notificationId,
      recipient: userId,
      isRead: false,
    },
    {
      isRead: true,
      readAt: new Date(),
    },
    { new: true }
  )

  if (!notification) {
    const existing = await Notification.exists({
      _id: notificationId,
      recipient: userId,
    })

    if (!existing) {
      throw new AppError('Notification not found', 404)
    }

    return existing
  }

  return notification
}

export const markAllNotificationsAsRead = async (
  userId: string
) => {
  const result = await Notification.updateMany(
    {
      recipient: userId,
      isRead: false,
    },
    {
      isRead: true,
      readAt: new Date(),
    }
  )

  return {
    modifiedCount: result.modifiedCount,
  }
}
