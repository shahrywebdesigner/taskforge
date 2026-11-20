
import mongoose from 'mongoose'
import Task from '../models/task.model.js'
import Project from '../models/project.model.js'
import Workspace from '../models/workspace.model.js'
import User from '../models/user.model.js'
import AppError from '../utils/AppError.js'
import { getProjectPermissions } from './permission.service.js'
import { isProActive } from './subscription.service.js'
import { createNotification } from './notification.service.js'
import { deleteTaskAttachments } from './attachment-management.service.js'

interface CreateTaskInput {
  title: string
  description?: string
  projectId: string
  assignedTo?: string
  status?: 'todo' | 'in-progress' | 'review' | 'done'
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  dueDate?: string
}

interface UpdateTaskInput {
  title?: string
  description?: string
  status?: 'todo' | 'in-progress' | 'review' | 'done'
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  dueDate?: string
  assignedTo?: string
}
const isWorkspaceAssignee = (
  workspace: {
    owner: mongoose.Types.ObjectId
    admins: mongoose.Types.ObjectId[]
    members: mongoose.Types.ObjectId[]
  },
  userId: string
) => {
  return (
    workspace.owner.toString() === userId ||
    workspace.admins.some((admin) => admin.toString() === userId) ||
    workspace.members.some((member) => member.toString() === userId)
  )
}

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
  const isActive = await hasActiveWorkspacePro(workspaceId)

  if (!isActive) {
    throw new AppError(
      'This workspace is read-only because its owner does not have an active Pro subscription.',
      403
    )
  }
}

const hasActiveUserPro = async (userId: string) => {
  const user = await User.findById(userId).select('plan proExpiresAt')

  if (!user) {
    throw new AppError('User not found', 404)
  }

  return isProActive(user)
}

export const createTask = async (
  data: CreateTaskInput,
  userId: string
) => {
  const project = await Project.findById(data.projectId)

  if (!project) {
    throw new AppError('Project not found', 404)
  }

  const workspaceId = project.workspace.toString()

  await requireWorkspacePro(workspaceId)

  const permissions = await getProjectPermissions(
    project._id.toString(),
    userId
  )

  if (!permissions.canManageTasks) {
    throw new AppError(
      'You are not authorized to create tasks in this project',
      403
    )
  }

  const workspace = await Workspace.findById(project.workspace)

  if (!workspace) {
    throw new AppError('Workspace not found', 404)
  }

  const assignedUserId = data.assignedTo || userId

if (!isWorkspaceAssignee(workspace, assignedUserId)) {
  throw new AppError('Assigned user is not a workspace member', 400)
}

  const task = await Task.create({
    title: data.title,
    description: data.description,
    project: project._id,
    workspace: workspace._id,
    assignedTo: new mongoose.Types.ObjectId(assignedUserId),
    createdBy: userId,
    status: data.status,
    priority: data.priority,
    dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
  })
  await createNotification({
  recipient: assignedUserId,
  actor: userId,
  workspace: workspace._id.toString(),
  project: project._id.toString(),
  task: task._id.toString(),
  type: 'task_assigned',
  title: 'New task assigned',
  message: `You have been assigned to "${task.title}".`,
})

  return task
}

export const getMyTasks = async (userId: string) => {
  const tasks = await Task.find({
    assignedTo: userId,
  })
    .populate('project', 'name')
    .populate('workspace', 'name')
    .sort({ createdAt: -1 })

  return tasks
}

export const getMyTaskById = async (
  taskId: string,
  userId: string
) => {
  if (!mongoose.isValidObjectId(taskId)) {
    throw new AppError('Invalid task ID', 400)
  }

  const task = await Task.findById(taskId)

  if (!task) {
    throw new AppError('Task not found', 404)
  }

  const permissions = await getProjectPermissions(
    task.project.toString(),
    userId
  )

  const isAssignedMember =
    task.assignedTo.toString() === userId

  if (!permissions.canManageTasks && !isAssignedMember) {
    throw new AppError(
      'You are not authorized to view this task',
      403
    )
  }

  const workspaceHasPro = await hasActiveWorkspacePro(
    task.workspace.toString()
  )

  const actorHasPro = permissions.canManageTasks
    ? false
    : await hasActiveUserPro(userId)

  await task.populate([
    { path: 'project', select: 'name' },
    { path: 'workspace', select: 'name' },
    { path: 'assignedTo', select: 'name email' },
    { path: 'createdBy', select: 'name email' },
  ])

  return {
    task,
    permissions: {
      ...permissions,
      canEditTask:
        workspaceHasPro &&
        (permissions.canManageTasks ||
          (isAssignedMember && actorHasPro)),
      canDeleteTask:
        workspaceHasPro && permissions.canManageTasks,
    },
  }
}

export const updateTask = async (
  taskId: string,
  data: UpdateTaskInput,
  userId: string
) => {
  if (!mongoose.isValidObjectId(taskId)) {
    throw new AppError('Invalid task ID', 400)
  }

  const task = await Task.findById(taskId)

  if (!task) {
    throw new AppError('Task not found', 404)
  }
  const previousAssignedTo = task.assignedTo.toString()
const previousStatus = task.status

  await requireWorkspacePro(task.workspace.toString())

  const permissions = await getProjectPermissions(
    task.project.toString(),
    userId
  )

  const isAssignedMember =
    task.assignedTo.toString() === userId

  if (!permissions.canManageTasks && !isAssignedMember) {
    throw new AppError(
      'You are not authorized to update this task',
      403
    )
  }

  // Assigned Members can edit their tasks only with their own active Pro.
  // Owner, Admin, Manager and Lead permissions remain role-based.
  if (!permissions.canManageTasks && isAssignedMember) {
    const actorHasPro = await hasActiveUserPro(userId)

    if (!actorHasPro) {
      throw new AppError(
        'Free members cannot edit assigned tasks. Upgrade to Pro to edit tasks.',
        403
      )
    }
  }

  if (data.title !== undefined) task.title = data.title
  if (data.description !== undefined) task.description = data.description
  if (data.status !== undefined) task.status = data.status
  if (data.priority !== undefined) task.priority = data.priority

  if (data.dueDate !== undefined) {
    task.dueDate = data.dueDate
      ? new Date(data.dueDate)
      : undefined
  }

  if (data.assignedTo !== undefined) {
    if (!permissions.canManageTasks) {
      throw new AppError(
        'You are not authorized to reassign this task',
        403
      )
    }

    if (!mongoose.isValidObjectId(data.assignedTo)) {
      throw new AppError('Invalid assigned user ID', 400)
    }

    const workspace = await Workspace.findById(task.workspace)

    if (!workspace) {
      throw new AppError('Workspace not found', 404)
    }

if (!isWorkspaceAssignee(workspace, data.assignedTo)) {
  throw new AppError('Assigned user is not a workspace member', 400)
}

    task.assignedTo = new mongoose.Types.ObjectId(data.assignedTo)
  }

await task.save()

const currentAssignedTo = task.assignedTo.toString()
const currentStatus = task.status

// Notify the new assignee when task is reassigned.
if (currentAssignedTo !== previousAssignedTo) {
  await createNotification({
    recipient: currentAssignedTo,
    actor: userId,
    workspace: task.workspace.toString(),
    project: task.project.toString(),
    task: task._id.toString(),
    type: 'task_assigned',
    title: 'Task assigned to you',
    message: `You have been assigned to "${task.title}".`,
  })
}

// Notify task creator when task is completed.
if (previousStatus !== 'done' && currentStatus === 'done') {
  await createNotification({
    recipient: task.createdBy.toString(),
    actor: userId,
    workspace: task.workspace.toString(),
    project: task.project.toString(),
    task: task._id.toString(),
    type: 'task_completed',
    title: 'Task completed',
    message: `"${task.title}" has been completed.`,
  })
}

return task
}

export const deleteTask = async (
  taskId: string,
  userId: string
) => {
  if (!mongoose.isValidObjectId(taskId)) {
    throw new AppError('Invalid task ID', 400)
  }

  const task = await Task.findById(taskId)

  if (!task) {
    throw new AppError('Task not found', 404)
  }

  await requireWorkspacePro(task.workspace.toString())

  const permissions = await getProjectPermissions(
    task.project.toString(),
    userId
  )

  if (!permissions.canManageTasks) {
    throw new AppError(
      'You are not authorized to delete this task',
      403
    )
  }

await deleteTaskAttachments(taskId)
await Task.findByIdAndDelete(taskId)

return task
}
