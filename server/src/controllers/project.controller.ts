import type { Request, Response } from 'express'
import {
  createProject,
  getWorkspaceProjects,
  getProjectById,
  updateProject,
  deleteProject,
  updateProjectRole,
} from '../services/project.service.js'
import AppError from '../utils/AppError.js'

export const createProjectController = async (
  req: Request,
  res: Response
) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401)
  }

  const project = await createProject(
    req.body,
    req.user._id.toString()
  )

  res.status(201).json({
    success: true,
    message: 'Project created successfully',
    data: project,
  })
}

export const getWorkspaceProjectsController = async (
  req: Request,
  res: Response
) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401)
  }

  const workspaceId = req.params.workspaceId

  if (typeof workspaceId !== 'string') {
    throw new AppError('Invalid workspace ID', 400)
  }

  const projects = await getWorkspaceProjects(
    workspaceId,
    req.user._id.toString()
  )

  res.status(200).json({
    success: true,
    data: projects,
  })
}

export const getProjectByIdController = async (
  req: Request,
  res: Response
) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401)
  }

  const projectId = req.params.projectId

  if (typeof projectId !== 'string') {
    throw new AppError('Invalid project ID', 400)
  }

  const project = await getProjectById(
    projectId,
    req.user._id.toString()
  )

  res.status(200).json({
    success: true,
    data: project,
  })
}

export const updateProjectController = async (
  req: Request,
  res: Response
) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401)
  }

  const project = await updateProject(
    String(req.params.projectId),
    req.body,
    req.user._id.toString()
  )

  res.status(200).json({
    success: true,
    message: 'Project updated successfully',
    data: project,
  })
}

export const updateProjectRoleController = async (
  req: Request,
  res: Response
) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401)
  }

  const { memberId, role, action } = req.body

  const project = await updateProjectRole(
    String(req.params.projectId),
    memberId,
    role,
    action,
    req.user._id.toString()
  )

  res.status(200).json({
    success: true,
    message:
      action === 'assign'
        ? `${role === 'manager' ? 'Project Manager' : 'Lead'} assigned successfully`
        : `${role === 'manager' ? 'Project Manager' : 'Lead'} removed successfully`,
    data: project,
  })
}

export const deleteProjectController = async (
  req: Request,
  res: Response
) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401)
  }

  await deleteProject(
    String(req.params.projectId),
    req.user._id.toString()
  )

  res.status(200).json({
    success: true,
    message: 'Project deleted successfully',
  })
}