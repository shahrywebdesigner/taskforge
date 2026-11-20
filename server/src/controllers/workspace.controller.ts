import type { Request, Response } from 'express'
import {
  createWorkspace,
  getUserWorkspaces,
  updateWorkspaceAdmin,
  addWorkspaceMember,
  getWorkspaceMembers,
  updateWorkspace,
  deleteWorkspace,
  removeWorkspaceMember,
} from '../services/workspace.service.js'
import AppError from '../utils/AppError.js'

export const createWorkspaceController = async (
  req: Request,
  res: Response
) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401)
  }

  const workspace = await createWorkspace(
    req.body,
    req.user._id.toString()
  )

  res.status(201).json({
    success: true,
    message: 'Workspace created successfully',
    data: workspace,
  })
};

export const getWorkspacesController = async (
  req: Request,
  res: Response
) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401)
  }

  const workspaces = await getUserWorkspaces(
    req.user._id.toString()
  )

  res.status(200).json({
    success: true,
    data: workspaces,
  })
}

export const updateWorkspaceAdminController = async (
  req: Request,
  res: Response
) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401)
  }

  const workspace = await updateWorkspaceAdmin(
    String(req.params.workspaceId),
    req.body.memberId,
    req.body.isAdmin,
    req.user._id.toString()
  )

  res.status(200).json({
    success: true,
    message: req.body.isAdmin
      ? 'Workspace admin assigned successfully'
      : 'Workspace admin removed successfully',
    data: workspace,
  })
}


export const addWorkspaceMemberController = async (
  req: Request,
  res: Response
) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401)
  }

  const result = await addWorkspaceMember(
    String(req.params.workspaceId),
    req.body.identifier,
    req.user._id.toString()
  )

  res.status(201).json({
    success: true,
    message: 'Workspace member added successfully',
    data: result,
  })
}

export const getWorkspaceMembersController = async (
  req: Request,
  res: Response
) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401)
  }

  const members = await getWorkspaceMembers(
    String(req.params.workspaceId),
    req.user._id.toString()
  )

  res.status(200).json({
    success: true,
    data: members,
  })
}
export const updateWorkspaceController = async (
  req: Request,
  res: Response
) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401)
  }

  const workspace = await updateWorkspace(
    req.params.workspaceId as string,
    req.body,
    req.user._id.toString()
  )

  res.status(200).json({
    success: true,
    message: 'Workspace updated successfully',
    data: workspace,
  })
}

export const deleteWorkspaceController = async (
  req: Request,
  res: Response
) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401)
  }

  const result = await deleteWorkspace(
    req.params.workspaceId as string,
    req.user._id.toString()
  )

  res.status(200).json({
    success: true,
    message: 'Workspace and its projects/tasks deleted successfully',
    data: result,
  })
}

export const removeWorkspaceMemberController = async (
  req: Request,
  res: Response
) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401)
  }

  const result = await removeWorkspaceMember(
    String(req.params.workspaceId),
    String(req.params.memberId),
    req.user._id.toString()
  )

  res.status(200).json({
    success: true,
    message: 'Workspace member removed successfully',
    data: result,
  })
}
