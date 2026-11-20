
import Workspace from '../models/workspace.model.js'
import Project from '../models/project.model.js'
import mongoose from 'mongoose'
import AppError from '../utils/AppError.js'
import User from '../models/user.model.js'
import Task from '../models/task.model.js'
import { requireActivePro, isProActive } from './subscription.service.js'
import { createNotification } from './notification.service.js'

interface CreateWorkspaceInput {
  name: string
  description?: string
}

interface UpdateWorkspaceInput {
  name?: string
  description?: string
}

// Check workspace owner's Pro subscription
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

// Block workspace mutations if owner's Pro is expired
const requireWorkspacePro = async (workspaceId: string) => {
  const isActive = await hasActiveWorkspacePro(workspaceId)

  if (!isActive) {
    throw new AppError(
      'This workspace is read-only because its owner does not have an active Pro subscription.',
      403
    )
  }
}

export const createWorkspace = async (
  data: CreateWorkspaceInput,
  userId: string
) => {
  // Creating a workspace requires the creator's active Pro plan
  await requireActivePro(userId)

  const workspace = await Workspace.create({
    name: data.name,
    description: data.description,
    owner: userId,
    members: [userId],
  })

  return workspace
}

export const getUserWorkspaces = async (userId: string) => {
  const workspaces = await Workspace.find({
    $or: [
      { owner: userId },
      { members: userId },
      { admins: userId },
    ],
  })
    .populate('owner', 'name')
    .sort({ createdAt: -1 })

  const workspacesWithProjects = await Promise.all(
    workspaces.map(async (workspace) => {
      const projects = await Project.find({
        workspace: workspace._id,
      })
        .select('name')
        .sort({ createdAt: -1 })

      const ownerId = workspace.owner._id.toString()

      const isOwner = ownerId === userId

      const isAdmin = workspace.admins.some(
        (admin) => admin.toString() === userId
      )

      return {
        ...workspace.toObject(),
        projects,
        isProActive: await hasActiveWorkspacePro(
          workspace._id.toString()
        ),
        permissions: {
          isOwner,
          isAdmin,
          canManageWorkspace: isOwner || isAdmin,
        },
      }
    })
  )

  return workspacesWithProjects
}

export const updateWorkspaceAdmin = async (
  workspaceId: string,
  memberId: string,
  isAdmin: boolean,
  ownerId: string
) => {
  if (
    !mongoose.isValidObjectId(workspaceId) ||
    !mongoose.isValidObjectId(memberId)
  ) {
    throw new AppError('Invalid ID', 400)
  }

  const workspace = await Workspace.findOne({
    _id: workspaceId,
    owner: ownerId,
  })

  if (!workspace) {
    throw new AppError(
      'Workspace not found or access denied',
      404
    )
  }

  await requireWorkspacePro(workspace._id.toString())

  if (memberId === ownerId) {
    throw new AppError(
      'Workspace owner already has full permissions',
      400
    )
  }

  const isMember = workspace.members.some(
    (member) => member.toString() === memberId
  )

  if (!isMember) {
    throw new AppError(
      'User is not a workspace member',
      400
    )
  }

  const alreadyAdmin = workspace.admins.some(
    (admin) => admin.toString() === memberId
  )

  if (isAdmin && !alreadyAdmin) {
    workspace.admins.push(
      new mongoose.Types.ObjectId(memberId)
    )
  }

  if (!isAdmin && alreadyAdmin) {
    workspace.admins = workspace.admins.filter(
      (admin) => admin.toString() !== memberId
    )
  }

  await workspace.save()
    await createNotification({
    recipient: memberId,
    actor: ownerId,
    workspace: workspace._id.toString(),
    type: 'workspace_updated',
    title: 'Workspace role updated',
    message: isAdmin
      ? `You have been promoted to Admin in "${workspace.name}".`
      : `Your Admin role has been removed from "${workspace.name}". You are now a Member.`,
  })
  return workspace
}

export const addWorkspaceMember = async (
  workspaceId: string,
  identifier: string,
  currentUserId: string
) => {
  if (!mongoose.isValidObjectId(workspaceId)) {
    throw new AppError('Invalid workspace ID', 400)
  }

  const workspace = await Workspace.findById(workspaceId)

  if (!workspace) {
    throw new AppError('Workspace not found', 404)
  }

  const isOwner =
    workspace.owner.toString() === currentUserId

  const isAdmin = workspace.admins.some(
    (admin) => admin.toString() === currentUserId
  )

  if (!isOwner && !isAdmin) {
    throw new AppError(
      'Only workspace owner or admin can add members',
      403
    )
  }

  await requireWorkspacePro(workspace._id.toString())

  const normalizedIdentifier = identifier.trim().toLowerCase()

  const user = await User.findOne({
    $or: [
      { email: normalizedIdentifier },
      { username: normalizedIdentifier },
    ],
  })

  if (!user) {
    throw new AppError(
      'No registered user found with this email or username',
      404
    )
  }

  const alreadyMember = workspace.members.some(
    (member) => member.toString() === user._id.toString()
  )

  if (alreadyMember) {
    throw new AppError(
      'User is already a workspace member',
      409
    )
  }

  workspace.members.push(user._id)

  await workspace.save()
  await createNotification({
  recipient: user._id.toString(),
  actor: currentUserId,
  workspace: workspace._id.toString(),
  type: 'workspace_invitation',
  title: 'Workspace invitation',
  message: `You have been added to "${workspace.name}".`,
})

  return {
    workspaceId: workspace._id,
    member: {
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: 'member',
    },
  }
}


export const getWorkspaceMembers = async (
  workspaceId: string,
  currentUserId: string
) => {
  if (!mongoose.isValidObjectId(workspaceId)) {
    throw new AppError('Invalid workspace ID', 400)
  }

  const workspace = await Workspace.findById(workspaceId)

  if (!workspace) {
    throw new AppError('Workspace not found', 404)
  }

  const isOwner =
    workspace.owner.toString() === currentUserId

  const isMember = workspace.members.some(
    (member) => member.toString() === currentUserId
  )

  if (!isOwner && !isMember) {
    throw new AppError('Access denied', 403)
  }

  const users = await User.find({
    _id: { $in: workspace.members },
  }).select('name username email')

  const projects = await Project.find({
    workspace: workspace._id,
  }).select('name managers leads')

  const projectRoles = new Map<
    string,
    { projectId: string; projectName: string; roles: string[] }[]
  >()

  for (const project of projects) {
    for (const managerId of project.managers) {
      const userId = managerId.toString()
      const roles = projectRoles.get(userId) || []

      roles.push({
        projectId: project._id.toString(),
        projectName: project.name,
        roles: ['Manager'],
      })

      projectRoles.set(userId, roles)
    }

    for (const leadId of project.leads) {
      const userId = leadId.toString()
      const roles = projectRoles.get(userId) || []

      const existingProject = roles.find(
        (item) => item.projectId === project._id.toString()
      )

      if (existingProject) {
        existingProject.roles.push('Lead')
      } else {
        roles.push({
          projectId: project._id.toString(),
          projectName: project.name,
          roles: ['Lead'],
        })
      }

      projectRoles.set(userId, roles)
    }
  }

  return users.map((user) => {
    const userId = user._id.toString()

    let role = 'Member'

    if (userId === workspace.owner.toString()) {
      role = 'Owner'
    } else if (
      workspace.admins.some(
        (admin) => admin.toString() === userId
      )
    ) {
      role = 'Admin'
    }

    return {
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      role,
      status: 'Active',
      projectRoles: projectRoles.get(userId) || [],
    }
  })
}


export const updateWorkspace = async (
  workspaceId: string,
  data: UpdateWorkspaceInput,
  currentUserId: string
) => {
  if (!mongoose.isValidObjectId(workspaceId)) {
    throw new AppError('Invalid workspace ID', 400)
  }

  const workspace = await Workspace.findById(workspaceId)

  if (!workspace) {
    throw new AppError('Workspace not found', 404)
  }

  const isOwner =
    workspace.owner.toString() === currentUserId

  const isAdmin = workspace.admins.some(
    (admin) => admin.toString() === currentUserId
  )

  if (!isOwner && !isAdmin) {
    throw new AppError(
      'Only workspace owner or admin can update this workspace',
      403
    )
  }

  await requireWorkspacePro(workspace._id.toString())

  if (data.name !== undefined) {
    workspace.name = data.name
  }

  if (data.description !== undefined) {
    workspace.description = data.description
  }

await workspace.save()

const recipients = new Set([
  workspace.owner.toString(),
  ...workspace.admins.map((id) => id.toString()),
  ...workspace.members.map((id) => id.toString()),
])

await Promise.all(
  [...recipients].map((recipient) =>
    createNotification({
      recipient,
      actor: currentUserId,
      workspace: workspace._id.toString(),
      type: 'workspace_updated',
      title: 'Workspace updated',
      message: `"${workspace.name}" workspace details have been updated.`,
    })
  )
)

return workspace
}

export const deleteWorkspace = async (
  workspaceId: string,
  currentUserId: string
) => {
  if (!mongoose.isValidObjectId(workspaceId)) {
    throw new AppError('Invalid workspace ID', 400)
  }

  const workspace = await Workspace.findById(workspaceId)

  if (!workspace) {
    throw new AppError('Workspace not found', 404)
  }

  const isOwner =
    workspace.owner.toString() === currentUserId

  const isAdmin = workspace.admins.some(
    (admin) => admin.toString() === currentUserId
  )

  if (!isOwner && !isAdmin) {
    throw new AppError(
      'Only workspace owner or admin can delete this workspace',
      403
    )
  }

  await requireWorkspacePro(workspace._id.toString())

  // Delete all tasks and projects belonging to this workspace
  await Task.deleteMany({ workspace: workspace._id })
  await Project.deleteMany({ workspace: workspace._id })

  // Finally, delete the workspace
  await Workspace.findByIdAndDelete(workspace._id)

  return { workspaceId: workspace._id }
}

export const removeWorkspaceMember = async (
  workspaceId: string,
  memberId: string,
  currentUserId: string
) => {
  if (
    !mongoose.isValidObjectId(workspaceId) ||
    !mongoose.isValidObjectId(memberId)
  ) {
    throw new AppError('Invalid ID', 400)
  }

  const workspace = await Workspace.findById(workspaceId)

  if (!workspace) {
    throw new AppError('Workspace not found', 404)
  }

  const isOwner =
    workspace.owner.toString() === currentUserId

  const isAdmin = workspace.admins.some(
    (admin) => admin.toString() === currentUserId
  )

  if (!isOwner && !isAdmin) {
    throw new AppError(
      'Only workspace owner or admin can remove members',
      403
    )
  }

  await requireWorkspacePro(workspace._id.toString())

  if (memberId === workspace.owner.toString()) {
    throw new AppError(
      'Workspace owner cannot be removed',
      400
    )
  }

  if (memberId === currentUserId) {
    throw new AppError(
      'You cannot remove yourself from this workspace',
      400
    )
  }

  const isMember = workspace.members.some(
    (member) => member.toString() === memberId
  )

  if (!isMember) {
    throw new AppError(
      'User is not a workspace member',
      404
    )
  }

  const targetIsAdmin = workspace.admins.some(
    (admin) => admin.toString() === memberId
  )

  if (!isOwner && targetIsAdmin) {
    throw new AppError(
      'Only the workspace owner can remove an admin',
      403
    )
  }

  workspace.members = workspace.members.filter(
    (member) => member.toString() !== memberId
  )

  workspace.admins = workspace.admins.filter(
    (admin) => admin.toString() !== memberId
  )

  // Remove this member's Manager and Lead roles from workspace projects
  const memberObjectId = new mongoose.Types.ObjectId(memberId)

  await Project.updateMany(
    { workspace: workspace._id },
    {
      $pull: {
        managers: memberObjectId,
        leads: memberObjectId,
      },
    }
  )

  await workspace.save()

  return {
    workspaceId: workspace._id,
    removedMemberId: memberId,
  }
}
