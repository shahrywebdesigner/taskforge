
import { Router } from 'express'
import {
  createTaskController,
  getMyTasksController,
  getMyTaskByIdController,
  updateTaskController,
  deleteTaskController,
} from '../controllers/task.controller.js'
import authMiddleware from '../middleware/auth.middleware.js'
import validate from '../middleware/validate.js'
import {
  createTaskSchema,
  updateTaskSchema,
} from '../utils/validators/task.validator.js'
import asyncHandler from '../utils/asyncHandler.js'
import upload from '../middleware/upload.middleware.js'
import {
  getTaskAttachmentsController,
  uploadTaskAttachmentController,
  createTaskLinkController,
  deleteTaskAttachmentController,
} from '../controllers/attachment.controller.js'

const router = Router()

router.get(
  '/:taskId/attachments',
  authMiddleware,
  asyncHandler(getTaskAttachmentsController)
)

router.post(
  '/:taskId/attachments',
  authMiddleware,
  upload.single('file'),
  asyncHandler(uploadTaskAttachmentController)
)

router.post(
  '/:taskId/attachments/links',
  authMiddleware,
  asyncHandler(createTaskLinkController)
)

router.delete(
  '/:taskId/attachments/:attachmentId',
  authMiddleware,
  asyncHandler(deleteTaskAttachmentController)
)

router.post(
  '/',
  authMiddleware,
  validate(createTaskSchema),
  asyncHandler(createTaskController)
)

router.get(
  '/my-tasks',
  authMiddleware,
  asyncHandler(getMyTasksController)
)

router.get(
  '/my-tasks/:taskId',
  authMiddleware,
  asyncHandler(getMyTaskByIdController)
)

router.patch(
  '/:taskId',
  authMiddleware,
  validate(updateTaskSchema),
  asyncHandler(updateTaskController)
)

router.delete(
  '/:taskId',
  authMiddleware,
  asyncHandler(deleteTaskController)
)

export default router
