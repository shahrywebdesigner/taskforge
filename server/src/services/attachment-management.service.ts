
import mongoose from 'mongoose'
import Attachment from '../models/attachment.model.js'
import Project from '../models/project.model.js'
import Task from '../models/task.model.js'
import User from '../models/user.model.js'
import Workspace from '../models/workspace.model.js'
import AppError from '../utils/AppError.js'
import { getProjectPermissions } from './permission.service.js'
import { isProActive } from './subscription.service.js'
import {
  uploadAttachmentFile,
  deleteAttachmentFile,
} from './attachment.service.js'
import cloudinary from '../config/cloudinary.js'

type AttachmentScope = 'project' | 'task'

interface UploadFileInput {
  buffer: Buffer
  originalName: string
  mimeType: string
  size: number
}

interface CreateLinkInput {
  title: string
  url: string
}

const requireWorkspacePro = async (workspaceId: string) => {
  const workspace = await Workspace.findById(workspaceId).select('owner')

  if (!workspace) throw new AppError('Workspace not found', 404)

  const owner = await User.findById(workspace.owner).select(
    'plan proExpiresAt'
  )

  if (!owner) throw new AppError('Workspace owner not found', 404)

  if (!isProActive(owner)) {
    throw new AppError(
      'This workspace is read-only because its owner does not have an active Pro subscription.',
      403
    )
  }
}

const getTarget = async (
  scope: AttachmentScope,
  targetId: string,
  userId: string
) => {
  if (!mongoose.isValidObjectId(targetId)) {
    throw new AppError(`Invalid ${scope} ID`, 400)
  }

  if (scope === 'project') {
    const project = await Project.findById(targetId)

    if (!project) throw new AppError('Project not found', 404)

    const permissions = await getProjectPermissions(targetId, userId)

    return {
      projectId: project._id,
      workspaceId: project.workspace,
      taskId: undefined,
      permissions,
      isAssignedMember: false,
    }
  }

  const task = await Task.findById(targetId)

  if (!task) throw new AppError('Task not found', 404)

  const permissions = await getProjectPermissions(
    task.project.toString(),
    userId
  )

  const isAssignedMember = task.assignedTo.toString() === userId

  if (!permissions.canManageTasks && !isAssignedMember) {
    throw new AppError('You are not authorized to access this task', 403)
  }

  return {
    projectId: task.project,
    workspaceId: task.workspace,
    taskId: task._id,
    permissions,
    isAssignedMember,
  }
}

const requireTaskEditAccess = async (
  target: Awaited<ReturnType<typeof getTarget>>,
  userId: string
) => {
  if (target.permissions.canManageTasks) return

  if (!target.isAssignedMember) {
    throw new AppError('You are not authorized to upload attachments', 403)
  }

  const user = await User.findById(userId).select('plan proExpiresAt')

  if (!user || !isProActive(user)) {
    throw new AppError(
      'Free members cannot edit assigned tasks. Upgrade to Pro to upload attachments.',
      403
    )
  }
}

const canDeleteAttachment = (
  attachment: { uploadedBy: mongoose.Types.ObjectId },
  scope: AttachmentScope,
  permissions: { canManageProject: boolean; canManageTasks: boolean },
  userId: string
) => {
  const isUploader = attachment.uploadedBy.toString() === userId

  return (
    isUploader ||
    (scope === 'project'
      ? permissions.canManageProject
      : permissions.canManageTasks)
  )
}

const serializeAttachment = (attachment: any) => {
  const data = attachment.toObject ? attachment.toObject() : attachment

  if (data.kind === 'link') {
    return { ...data, fileUrl: undefined }
  }

  const fileUrl = cloudinary.url(data.publicId, {
  secure: true,
  sign_url: true,
  resource_type: data.resourceType,
  type: 'authenticated',
  version: data.version,
  format: data.format,
})
  return { ...data, fileUrl }
}

export const getAttachments = async (
  scope: AttachmentScope,
  targetId: string,
  userId: string
) => {
  const target = await getTarget(scope, targetId, userId)

  const attachments =
    scope === 'project'
      ? await Attachment.find({
          project: target.projectId,
          scope: 'project',
        })
          .populate('uploadedBy', 'name username')
          .sort({ createdAt: -1 })
      : await Attachment.find({
          task: target.taskId,
          scope: 'task',
        })
          .populate('uploadedBy', 'name username')
          .sort({ createdAt: -1 })

  return attachments.map(serializeAttachment)
}

export const createFileAttachment = async (
  scope: AttachmentScope,
  targetId: string,
  userId: string,
  file: UploadFileInput
) => {
  const target = await getTarget(scope, targetId, userId)

  await requireWorkspacePro(target.workspaceId.toString())

  if (scope === 'task') {
    await requireTaskEditAccess(target, userId)
  }

  const uploaded = await uploadAttachmentFile({
    buffer: file.buffer,
    originalName: file.originalName,
    mimeType: file.mimeType,
  })

  try {
    const attachment = await Attachment.create({
      kind: 'file',
      scope,
      workspace: target.workspaceId,
      project: target.projectId,
      task: target.taskId,
      uploadedBy: new mongoose.Types.ObjectId(userId),
      originalName: file.originalName,
      mimeType: file.mimeType,
      size: file.size,
      publicId: uploaded.public_id,
      resourceType: uploaded.resource_type,
      format: uploaded.format,
      version: uploaded.version,
    })

    await attachment.populate('uploadedBy', 'name username')

    return serializeAttachment(attachment)
  } catch (error) {
    await deleteAttachmentFile(uploaded.public_id, uploaded.resource_type)
    throw error
  }
}

export const createLinkAttachment = async (
  scope: AttachmentScope,
  targetId: string,
  userId: string,
  data: CreateLinkInput
) => {
  const target = await getTarget(scope, targetId, userId)

  await requireWorkspacePro(target.workspaceId.toString())

  if (scope === 'task') {
    await requireTaskEditAccess(target, userId)
  }

  const attachment = await Attachment.create({
    kind: 'link',
    scope,
    workspace: target.workspaceId,
    project: target.projectId,
    task: target.taskId,
    uploadedBy: new mongoose.Types.ObjectId(userId),
    title: data.title.trim(),
    url: data.url,
  })

  await attachment.populate('uploadedBy', 'name username')

  return serializeAttachment(attachment)
}

export const removeAttachment = async (
  scope: AttachmentScope,
  targetId: string,
  attachmentId: string,
  userId: string
) => {
  if (!mongoose.isValidObjectId(attachmentId)) {
    throw new AppError('Invalid attachment ID', 400)
  }

  const target = await getTarget(scope, targetId, userId)

  const attachment = await Attachment.findOne({
    _id: attachmentId,
    scope,
    project: target.projectId,
    ...(scope === 'task' ? { task: target.taskId } : {}),
  })

  if (!attachment) throw new AppError('Attachment not found', 404)

  await requireWorkspacePro(target.workspaceId.toString())

  if (
    !canDeleteAttachment(
      attachment,
      scope,
      target.permissions,
      userId
    )
  ) {
    throw new AppError('You are not authorized to delete this attachment', 403)
  }

  if (attachment.kind === 'file' && attachment.publicId && attachment.resourceType) {
    await deleteAttachmentFile(
      attachment.publicId,
      attachment.resourceType
    )
  }

  await Attachment.findByIdAndDelete(attachmentId)

  return true
}

export const deleteTaskAttachments = async (taskId: string) => {
  const attachments = await Attachment.find({ task: taskId })

  for (const attachment of attachments) {
    if (
      attachment.kind === 'file' &&
      attachment.publicId &&
      attachment.resourceType
    ) {
      await deleteAttachmentFile(
        attachment.publicId,
        attachment.resourceType
      )
    }
  }

  await Attachment.deleteMany({ task: taskId })
}

export const deleteProjectAttachments = async (projectId: string) => {
  const attachments = await Attachment.find({ project: projectId })

  for (const attachment of attachments) {
    if (
      attachment.kind === 'file' &&
      attachment.publicId &&
      attachment.resourceType
    ) {
      await deleteAttachmentFile(
        attachment.publicId,
        attachment.resourceType
      )
    }
  }

  await Attachment.deleteMany({ project: projectId })
}