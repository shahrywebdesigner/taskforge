import mongoose from 'mongoose'
import Project from '../models/project.model.js'
import Workspace from '../models/workspace.model.js'
import User from '../models/user.model.js'
import AppError from '../utils/AppError.js'
import Task from '../models/task.model.js'
import { getProjectPermissions } from './permission.service.js'
import { isProActive } from './subscription.service.js'
import { deleteProjectAttachments } from './attachment-management.service.js'

import {
  createNotification,
} from './notification.service.js'
interface CreateProjectInput {
  name: string
  description?: string
  workspaceId: string
  status?: 'planning' | 'active' | 'completed'
}

interface UpdateProjectInput {
  name?: string
  description?: string
  status?: 'planning' | 'active' | 'completed'
  workspaceId?: string
}

export type ProjectRole = 'manager' | 'lead'
export type ProjectRoleAction = 'assign' | 'remove'

const hasActiveWorkspacePro = async (workspaceId: string) => {
  const workspace = await Workspace.findById(workspaceId).select('owner')

  if (!workspace) {
    throw new AppError('Workspace not found', 404)
  }

  const owner = await User.findById(workspace.owner).select(
    'plan proExpiresAt'
  )

  if (!owner) {
    throw new AppError('Workspace owner not found', 404)
  }

  return isProActive(owner)
}

const requireWorkspacePro = async (workspaceId: string) => {
  const active = await hasActiveWorkspacePro(workspaceId)

  if (!active) {
    throw new AppError(
      'This workspace is read-only because its owner does not have an active Pro subscription.',
      403
    )
  }
}

const isWorkspaceUser = (
  workspace: {
    owner: mongoose.Types.ObjectId
    admins: mongoose.Types.ObjectId[]
    members: mongoose.Types.ObjectId[]
  },
  userId: string
) => {
  return (
    workspace.owner.toString() === userId ||
    workspace.admins.some((id) => id.toString() === userId) ||
    workspace.members.some((id) => id.toString() === userId)
  )
}

export const createProject = async (
  data: CreateProjectInput,
  userId: string
) => {
  if (!mongoose.isValidObjectId(data.workspaceId)) {
    throw new AppError('Invalid workspace ID', 400)
  }

  const workspace = await Workspace.findById(data.workspaceId)

  if (!workspace) {
    throw new AppError('Workspace not found', 404)
  }

  const isOwner = workspace.owner.toString() === userId
  const isAdmin = workspace.admins.some(
    (admin) => admin.toString() === userId
  )

  if (!isOwner && !isAdmin) {
    throw new AppError(
      'Only workspace Owner or Admin can create projects',
      403
    )
  }

  await requireWorkspacePro(workspace._id.toString())

const project = await Project.create({
  name: data.name,
  description: data.description,
  workspace: workspace._id,
  createdBy: userId,
  status: data.status,
})

const recipients = new Set([
  workspace.owner.toString(),
  ...workspace.admins.map((id) => id.toString()),
  ...workspace.members.map((id) => id.toString()),
])

await Promise.all(
  [...recipients].map((recipient) =>
    createNotification({
      recipient,
      actor: userId,
      workspace: workspace._id.toString(),
      project: project._id.toString(),
      type: 'project_created',
      title: 'New project created',
      message: `"${project.name}" has been created in your workspace.`,
    })
  )
)

return project
}

export const getWorkspaceProjects = async (
  workspaceId: string,
  userId: string
) => {
  if (!mongoose.isValidObjectId(workspaceId)) {
    throw new AppError('Invalid workspace ID', 400)
  }

  const workspace = await Workspace.findById(workspaceId)

  if (!workspace) {
    throw new AppError('Workspace not found', 404)
  }

  if (!isWorkspaceUser(workspace, userId)) {
    throw new AppError('Access denied', 403)
  }

  return Project.find({ workspace: workspaceId }).sort({
    createdAt: -1,
  })
}

export const getProjectById = async (
  projectId: string,
  userId: string
) => {
  const permissions = await getProjectPermissions(projectId, userId)

  const project = await Project.findById(projectId)

  if (!project) {
    throw new AppError('Project not found', 404)
  }

  await project.populate([
    { path: 'workspace', select: 'name' },
    { path: 'createdBy', select: 'name email' },
    { path: 'managers', select: 'name email username' },
    { path: 'leads', select: 'name email username' },
  ])

  const tasks = await Task.find({
    project: project._id,
  })
    .populate('assignedTo', 'name email')
    .sort({ createdAt: -1 })

  return {
    ...project.toObject(),
    tasks,
    permissions,
  }
}

export const updateProject = async (
  projectId: string,
  data: UpdateProjectInput,
  userId: string
) => {
  if (!mongoose.isValidObjectId(projectId)) {
    throw new AppError('Invalid project ID', 400)
  }

  const project = await Project.findById(projectId)

  if (!project) {
    throw new AppError('Project not found', 404)
  }

  await requireWorkspacePro(project.workspace.toString())

  const permissions = await getProjectPermissions(projectId, userId)

  if (!permissions.canManageProject) {
    throw new AppError(
      'You are not authorized to update this project',
      403
    )
  }

  if (data.name !== undefined) project.name = data.name

  if (data.description !== undefined) {
    project.description = data.description
  }

  if (data.status !== undefined) project.status = data.status

  if (data.workspaceId !== undefined) {
    if (!permissions.canManageWorkspace) {
      throw new AppError(
        'Only workspace Owner or Admin can move projects',
        403
      )
    }

    if (!mongoose.isValidObjectId(data.workspaceId)) {
      throw new AppError('Invalid workspace ID', 400)
    }

    const targetWorkspace = await Workspace.findById(data.workspaceId)

    if (!targetWorkspace) {
      throw new AppError('Target workspace not found', 404)
    }

    const isTargetOwner =
      targetWorkspace.owner.toString() === userId

    const isTargetAdmin = targetWorkspace.admins.some(
      (admin) => admin.toString() === userId
    )

    if (!isTargetOwner && !isTargetAdmin) {
      throw new AppError(
        'You must be an Owner or Admin of the target workspace',
        403
      )
    }

    await requireWorkspacePro(targetWorkspace._id.toString())

    const tasks = await Task.find({
      project: project._id,
    }).select('assignedTo')

    const invalidAssignee = tasks.some(
      (task) =>
        !isWorkspaceUser(
          targetWorkspace,
          task.assignedTo.toString()
        )
    )

    if (invalidAssignee) {
      throw new AppError(
        'Some assigned task members are not part of the target workspace',
        400
      )
    }

    // Existing project roles must also belong to the target workspace.
    const invalidManager = project.managers.some(
      (manager) => !isWorkspaceUser(targetWorkspace, manager.toString())
    )

    const invalidLead = project.leads.some(
      (lead) => !isWorkspaceUser(targetWorkspace, lead.toString())
    )

    if (invalidManager || invalidLead) {
      throw new AppError(
        'Project Managers and Leads must belong to the target workspace',
        400
      )
    }

    await Task.updateMany(
      { project: project._id },
      { $set: { workspace: targetWorkspace._id } }
    )

    project.workspace = targetWorkspace._id
  }

await project.save()

const workspace = await Workspace.findById(project.workspace)

if (workspace) {
  const recipients = new Set([
    workspace.owner.toString(),
    ...workspace.admins.map((id) => id.toString()),
    ...workspace.members.map((id) => id.toString()),
  ])

  await Promise.all(
    [...recipients].map((recipient) =>
      createNotification({
        recipient,
        actor: userId,
        workspace: workspace._id.toString(),
        project: project._id.toString(),
        type: 'project_updated',
        title: 'Project updated',
        message: `"${project.name}" has been updated.`,
      })
    )
  )
}

return project
}

/**
 * Assign or remove a Project Manager / Lead.
 * Only the workspace Owner or Admin can perform this action.
 */
export const updateProjectRole = async (
  projectId: string,
  memberId: string,
  role: ProjectRole,
  action: ProjectRoleAction,
  userId: string
) => {
  if (
    !mongoose.isValidObjectId(projectId) ||
    !mongoose.isValidObjectId(memberId)
  ) {
    throw new AppError('Invalid project or member ID', 400)
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

  if (!isOwner && !isAdmin) {
    throw new AppError(
      'Only workspace Owner or Admin can assign project roles',
      403
    )
  }

  await requireWorkspacePro(workspace._id.toString())

  if (!isWorkspaceUser(workspace, memberId)) {
    throw new AppError(
      'You can only assign project roles to workspace members',
      400
    )
  }

  const targetRoleArray =
    role === 'manager' ? project.managers : project.leads

  const alreadyAssigned = targetRoleArray.some(
    (id) => id.toString() === memberId
  )

  if (action === 'assign' && !alreadyAssigned) {
    targetRoleArray.push(new mongoose.Types.ObjectId(memberId))
  }

  if (action === 'remove' && alreadyAssigned) {
    if (role === 'manager') {
      project.managers = project.managers.filter(
        (id) => id.toString() !== memberId
      )
    } else {
      project.leads = project.leads.filter(
        (id) => id.toString() !== memberId
      )
    }
  }

  const roleChanged =
    (action === 'assign' && !alreadyAssigned) ||
    (action === 'remove' && alreadyAssigned)

  await project.save()

  if (roleChanged) {
    const roleName = role === 'manager' ? 'Manager' : 'Lead'

    await createNotification({
      recipient: memberId,
      actor: userId,
      workspace: workspace._id.toString(),
      project: project._id.toString(),
      type: 'project_updated',
      title: 'Project role updated',
      message:
        action === 'assign'
          ? `You have been assigned as ${roleName} to a project.`
          : `Your ${roleName} role has been removed from a project.`,
    })
  }
  await project.populate([
    { path: 'managers', select: 'name email username' },
    { path: 'leads', select: 'name email username' },
  ])

  return project
}
 
export const deleteProject = async (
  projectId: string,
  userId: string
) => {
  if (!mongoose.isValidObjectId(projectId)) {
    throw new AppError('Invalid project ID', 400)
  }

  const project = await Project.findById(projectId)

  if (!project) {
    throw new AppError('Project not found', 404)
  }

  await requireWorkspacePro(project.workspace.toString())

  const permissions = await getProjectPermissions(projectId, userId)

  if (!permissions.canManageProject) {
    throw new AppError(
      'You are not authorized to delete this project',
      403
    )
  }

await deleteProjectAttachments(projectId)
await Task.deleteMany({ project: project._id })
await Project.findByIdAndDelete(projectId)

return project
}
