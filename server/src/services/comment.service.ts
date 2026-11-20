import mongoose from 'mongoose'
import Comment from '../models/comment.model.js'
import Task from '../models/task.model.js'
import Workspace from '../models/workspace.model.js'
import User from '../models/user.model.js'
import AppError from '../utils/AppError.js'
import { getProjectPermissions } from './permission.service.js'
import { isProActive } from './subscription.service.js'
import { createNotification } from './notification.service.js'

const getTaskAndAccess = async (taskId: string, userId: string) => {
  if (!mongoose.isValidObjectId(taskId)) {
    throw new AppError('Invalid task ID.', 400)
  }

  const task = await Task.findById(taskId)

  if (!task) {
    throw new AppError('Task not found.', 404)
  }

  // Confirms that the user belongs to this workspace.
  await getProjectPermissions(task.project.toString(), userId)

  const workspace = await Workspace.findById(task.workspace)

  if (!workspace) {
    throw new AppError('Workspace not found.', 404)
  }

  const owner = await User.findById(workspace.owner).select(
    'plan proExpiresAt'
  )

  const workspaceHasPro = Boolean(owner && isProActive(owner))

  return { task, workspace, workspaceHasPro }
}

export const getTaskComments = async (
  taskId: string,
  userId: string
) => {
  const { task, workspaceHasPro } = await getTaskAndAccess(
    taskId,
    userId
  )

  const comments = await Comment.find({ task: task._id })
    .populate('author', 'name email')
    .sort({ createdAt: 1 })

  const result = comments.map((comment) => {
    const author = comment.author as unknown as {
      _id: mongoose.Types.ObjectId
      name: string
      email: string
    }

    return {
      ...comment.toObject(),
      canEdit: author._id.toString() === userId,
    }
  })

  return {
    comments: result,
    canComment: workspaceHasPro,
  }
}

export const createTaskComment = async (
  taskId: string,
  userId: string,
  content: string
) => {
  const { task, workspace, workspaceHasPro } = await getTaskAndAccess(
    taskId,
    userId
  )

  if (!workspaceHasPro) {
    throw new AppError(
      'Workspace owner must have an active Pro plan to add comments.',
      403
    )
  }

  const cleanContent = content.trim()

  if (!cleanContent || cleanContent.length > 2000) {
    throw new AppError(
      'Comment must contain between 1 and 2000 characters.',
      400
    )
  }

  const comment = await Comment.create({
    task: task._id,
    project: task.project,
    workspace: task.workspace,
    author: userId,
    content: cleanContent,
  })

  const populatedComment = await Comment.findById(comment._id)
    .populate('author', 'name email')

  // Notify task creator and assigned member without duplicates.
  const recipients = new Set([
    task.createdBy.toString(),
    task.assignedTo.toString(),
  ])

  for (const recipient of recipients) {
    await createNotification({
      recipient,
      actor: userId,
      workspace: workspace._id.toString(),
      project: task.project.toString(),
      task: task._id.toString(),
      type: 'comment_added',
      title: 'New comment on task',
      message: `A new comment was added to "${task.title}".`,
    })
  }

  return {
    ...populatedComment!.toObject(),
    canEdit: true,
  }
}

export const updateTaskComment = async (
  commentId: string,
  userId: string,
  content: string
) => {
  if (!mongoose.isValidObjectId(commentId)) {
    throw new AppError('Invalid comment ID.', 400)
  }

  const comment = await Comment.findById(commentId)

  if (!comment) {
    throw new AppError('Comment not found.', 404)
  }

  if (comment.author.toString() !== userId) {
    throw new AppError(
      'You can only edit your own comments.',
      403
    )
  }

  const { workspaceHasPro } = await getTaskAndAccess(
    comment.task.toString(),
    userId
  )

  if (!workspaceHasPro) {
    throw new AppError(
      'Workspace owner must have an active Pro plan to edit comments.',
      403
    )
  }

  const cleanContent = content.trim()

  if (!cleanContent || cleanContent.length > 2000) {
    throw new AppError(
      'Comment must contain between 1 and 2000 characters.',
      400
    )
  }

  comment.content = cleanContent
  await comment.save()

  const updatedComment = await Comment.findById(comment._id)
    .populate('author', 'name email')

  return {
    ...updatedComment!.toObject(),
    canEdit: true,
  }
}

export const deleteTaskComment = async (
  commentId: string,
  userId: string
) => {
  if (!mongoose.isValidObjectId(commentId)) {
    throw new AppError('Invalid comment ID.', 400)
  }

  const comment = await Comment.findById(commentId)

  if (!comment) {
    throw new AppError('Comment not found.', 404)
  }

  if (comment.author.toString() !== userId) {
    throw new AppError(
      'You can only delete your own comments.',
      403
    )
  }

  const { workspaceHasPro } = await getTaskAndAccess(
    comment.task.toString(),
    userId
  )

  if (!workspaceHasPro) {
    throw new AppError(
      'Workspace owner must have an active Pro plan to delete comments.',
      403
    )
  }

  await comment.deleteOne()

  return { message: 'Comment deleted successfully.' }
}
