import { Router } from 'express'
import {
  createWorkspaceController,
  getWorkspacesController,
  getWorkspaceMembersController,
  updateWorkspaceAdminController,
  addWorkspaceMemberController,
  updateWorkspaceController,
  deleteWorkspaceController,
  removeWorkspaceMemberController,
} from '../controllers/workspace.controller.js'
import authMiddleware from '../middleware/auth.middleware.js'
import validate from '../middleware/validate.js'
import {
  createWorkspaceSchema,
  updateWorkspaceAdminSchema,
  addWorkspaceMemberSchema,
  updateWorkspaceSchema,
} from '../utils/validators/workspace.validator.js'
import asyncHandler from '../utils/asyncHandler.js'


const router = Router()

router.post(
  '/',
  authMiddleware,
  validate(createWorkspaceSchema),
  asyncHandler(createWorkspaceController)
)
router.get(
  '/',
  authMiddleware,
  asyncHandler(getWorkspacesController)
)

router.patch(
  '/:workspaceId/admins',
  authMiddleware,
  validate(updateWorkspaceAdminSchema),
  asyncHandler(updateWorkspaceAdminController)
)
router.get(
  '/:workspaceId/members',
  authMiddleware,
  asyncHandler(getWorkspaceMembersController)
)

router.post(
  '/:workspaceId/members',
  authMiddleware,
  validate(addWorkspaceMemberSchema),
  asyncHandler(addWorkspaceMemberController)
)

router.patch(
  '/:workspaceId',
  authMiddleware,
  validate(updateWorkspaceSchema),
  asyncHandler(updateWorkspaceController)
)

router.delete(
  '/:workspaceId',
  authMiddleware,
  asyncHandler(deleteWorkspaceController)
)
router.delete(
  '/:workspaceId/members/:memberId',
  authMiddleware,
  asyncHandler(removeWorkspaceMemberController)
)

export default router