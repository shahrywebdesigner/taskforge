
import { Router } from 'express'
import authMiddleware from '../middleware/auth.middleware.js'
import asyncHandler from '../utils/asyncHandler.js'
import {
  getTaskCommentsController,
  createTaskCommentController,
  updateTaskCommentController,
  deleteTaskCommentController,
} from '../controllers/comment.controller.js'

const router = Router()

router.use(authMiddleware)

router.get(
  '/task/:taskId',
  asyncHandler(getTaskCommentsController)
)

router.post(
  '/task/:taskId',
  asyncHandler(createTaskCommentController)
)

router.patch(
  '/:commentId',
  asyncHandler(updateTaskCommentController)
)

router.delete(
  '/:commentId',
  asyncHandler(deleteTaskCommentController)
)

export default router
