
import { Router } from 'express'
import authMiddleware from '../middleware/auth.middleware.js'
import asyncHandler from '../utils/asyncHandler.js'
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from '../controllers/notification.controller.js'

const router = Router()

router.use(authMiddleware)

router.get('/', asyncHandler(getNotifications))
router.patch('/read-all', asyncHandler(markAllAsRead))
router.patch('/:notificationId/read', asyncHandler(markAsRead))

export default router
