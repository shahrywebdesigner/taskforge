
import type { Request, Response } from 'express'
import AppError from '../utils/AppError.js'
import {
  getAttachments,
  createFileAttachment,
  createLinkAttachment,
  removeAttachment,
} from '../services/attachment-management.service.js'

type AttachmentScope = 'project' | 'task'

const getUserId = (req: Request) => {
  if (!req.user) throw new AppError('Authentication required', 401)
  return req.user._id.toString()
}

const getScopeId = (req: Request, scope: AttachmentScope) =>
  String(scope === 'project' ? req.params.projectId : req.params.taskId)

const validateLink = (title: unknown, url: unknown) => {
  if (typeof title !== 'string' || title.trim().length < 1 || title.trim().length > 150) {
    throw new AppError('Link title must be between 1 and 150 characters', 400)
  }

  if (typeof url !== 'string' || url.length > 2048) {
    throw new AppError('A valid link URL is required', 400)
  }

  let parsedUrl: URL

  try {
    parsedUrl = new URL(url)
  } catch {
    throw new AppError('Invalid link URL', 400)
  }

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    throw new AppError('Only HTTP and HTTPS links are allowed', 400)
  }

  return { title: title.trim(), url: parsedUrl.toString() }
}

export const getProjectAttachmentsController = async (req: Request, res: Response) => {
  const attachments = await getAttachments(
    'project',
    getScopeId(req, 'project'),
    getUserId(req)
  )

  res.status(200).json({ success: true, data: attachments })
}

export const uploadProjectAttachmentController = async (req: Request, res: Response) => {
  if (!req.file) throw new AppError('Please select a file', 400)

  const attachment = await createFileAttachment(
    'project',
    getScopeId(req, 'project'),
    getUserId(req),
    {
      buffer: req.file.buffer,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
    }
  )

  res.status(201).json({
    success: true,
    message: 'File uploaded successfully',
    data: attachment,
  })
}

export const createProjectLinkController = async (req: Request, res: Response) => {
  const link = validateLink(req.body.title, req.body.url)

  const attachment = await createLinkAttachment(
    'project',
    getScopeId(req, 'project'),
    getUserId(req),
    link
  )

  res.status(201).json({
    success: true,
    message: 'Link added successfully',
    data: attachment,
  })
}

export const deleteProjectAttachmentController = async (req: Request, res: Response) => {
  await removeAttachment(
    'project',
    getScopeId(req, 'project'),
    String(req.params.attachmentId),
    getUserId(req)
  )

  res.status(200).json({
    success: true,
    message: 'Attachment deleted successfully',
  })
}

export const getTaskAttachmentsController = async (req: Request, res: Response) => {
  const attachments = await getAttachments(
    'task',
    getScopeId(req, 'task'),
    getUserId(req)
  )

  res.status(200).json({ success: true, data: attachments })
}

export const uploadTaskAttachmentController = async (req: Request, res: Response) => {
  if (!req.file) throw new AppError('Please select a file', 400)

  const attachment = await createFileAttachment(
    'task',
    getScopeId(req, 'task'),
    getUserId(req),
    {
      buffer: req.file.buffer,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
    }
  )

  res.status(201).json({
    success: true,
    message: 'File uploaded successfully',
    data: attachment,
  })
}

export const createTaskLinkController = async (req: Request, res: Response) => {
  const link = validateLink(req.body.title, req.body.url)

  const attachment = await createLinkAttachment(
    'task',
    getScopeId(req, 'task'),
    getUserId(req),
    link
  )

  res.status(201).json({
    success: true,
    message: 'Link added successfully',
    data: attachment,
  })
}

export const deleteTaskAttachmentController = async (req: Request, res: Response) => {
  await removeAttachment(
    'task',
    getScopeId(req, 'task'),
    String(req.params.attachmentId),
    getUserId(req)
  )

  res.status(200).json({
    success: true,
    message: 'Attachment deleted successfully',
  })
}
