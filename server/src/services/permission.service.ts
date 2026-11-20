
import mongoose from 'mongoose'
import Workspace from '../models/workspace.model.js'
import Project from '../models/project.model.js'
import AppError from '../utils/AppError.js'

export interface ProjectPermissions {
  isOwner: boolean
  isAdmin: boolean
  isManager: boolean
  isLead: boolean
  canManageTasks: boolean
  canManageProject: boolean
  canManageWorkspace: boolean
}

export const getProjectPermissions = async (
  projectId: string,
  userId: string
): Promise<ProjectPermissions> => {
  if (
    !mongoose.isValidObjectId(projectId) ||
    !mongoose.isValidObjectId(userId)
  ) {
    throw new AppError('Invalid ID', 400)
  }

  const project = await Project.findById(projectId)

  if (!project) {
    throw new AppError('Project not found', 404)
  }

  const workspace = await Workspace.findById(project.workspace)

  if (!workspace) {
    throw new AppError('Workspace not found', 404)
  }

  const isOwner = workspace.owner.toString() === userId

  const isAdmin = workspace.admins.some(
    (admin) => admin.toString() === userId
  )

  const isManager = project.managers.some(
    (manager) => manager.toString() === userId
  )

  const isLead = project.leads.some(
    (lead) => lead.toString() === userId
  )

  const isWorkspaceMember = workspace.members.some(
    (member) => member.toString() === userId
  )

if (!isOwner && !isAdmin && !isWorkspaceMember) {
  throw new AppError('Access denied', 403)
}

  const canManageTasks =
    isOwner || isAdmin || isManager || isLead

  const canManageProject =
    isOwner || isAdmin || isManager

  const canManageWorkspace =
    isOwner || isAdmin

  return {
    isOwner,
    isAdmin,
    isManager,
    isLead,
    canManageTasks,
    canManageProject,
    canManageWorkspace,
  }
}

export const requireTaskManagement = async (
  projectId: string,
  userId: string
) => {
  const permissions = await getProjectPermissions(
    projectId,
    userId
  )

  if (!permissions.canManageTasks) {
    throw new AppError(
      'You are not authorized to manage this task',
      403
    )
  }

  return permissions
}

export const requireProjectManagement = async (
  projectId: string,
  userId: string
) => {
  const permissions = await getProjectPermissions(
    projectId,
    userId
  )

  if (!permissions.canManageProject) {
    throw new AppError(
      'You are not authorized to manage this project',
      403
    )
  }

  return permissions
}
