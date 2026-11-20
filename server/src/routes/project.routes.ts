import { Router } from 'express'
import {
  createProjectController,
  getWorkspaceProjectsController,
  getProjectByIdController,
  updateProjectController,
  updateProjectRoleController,
  deleteProjectController,
} from '../controllers/project.controller.js'

import {
  createProjectSchema,
  updateProjectSchema,
  updateProjectRoleSchema,
} from '../utils/validators/project.validator.js'

import authMiddleware from '../middleware/auth.middleware.js'
import validate from '../middleware/validate.js'
import asyncHandler from '../utils/asyncHandler.js'

import upload from '../middleware/upload.middleware.js'
import {
  getProjectAttachmentsController,
  uploadProjectAttachmentController,
  createProjectLinkController,
  deleteProjectAttachmentController,
} from '../controllers/attachment.controller.js'

const router = Router()

router.get(
  '/:projectId/attachments',
  authMiddleware,
  asyncHandler(getProjectAttachmentsController)
)

router.post(
  '/:projectId/attachments',
  authMiddleware,
  upload.single('file'),
  asyncHandler(uploadProjectAttachmentController)
)

router.post(
  '/:projectId/attachments/links',
  authMiddleware,
  asyncHandler(createProjectLinkController)
)

router.delete(
  '/:projectId/attachments/:attachmentId',
  authMiddleware,
  asyncHandler(deleteProjectAttachmentController)
)

router.post(
  '/',
  authMiddleware,
  validate(createProjectSchema),
  asyncHandler(createProjectController)
)

router.get(
  '/workspace/:workspaceId',
  authMiddleware,
  asyncHandler(getWorkspaceProjectsController)
)

// Keep this route before /:projectId.
router.patch(
  '/:projectId/roles',
  authMiddleware,
  validate(updateProjectRoleSchema),
  asyncHandler(updateProjectRoleController)
)

router.patch(
  '/:projectId',
  authMiddleware,
  validate(updateProjectSchema),
  asyncHandler(updateProjectController)
)

router.delete(
  '/:projectId',
  authMiddleware,
  asyncHandler(deleteProjectController)
)

router.get(
  '/:projectId',
  authMiddleware,
  asyncHandler(getProjectByIdController)
)

export default router