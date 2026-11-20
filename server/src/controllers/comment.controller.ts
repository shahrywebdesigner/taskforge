
import type { Request, Response } from 'express'
import {
  getTaskComments,
  createTaskComment,
  updateTaskComment,
  deleteTaskComment,
} from '../services/comment.service.js'

const getParam = (value: string | string[] | undefined): string => {
  return Array.isArray(value) ? value[0] : value ?? ''
}

export const getTaskCommentsController = async (
  req: Request,
  res: Response
) => {
  const result = await getTaskComments(
    getParam(req.params.taskId),
    req.user!._id.toString()
  )

  res.status(200).json({
    success: true,
    data: result,
  })
}

export const createTaskCommentController = async (
  req: Request,
  res: Response
) => {
  const comment = await createTaskComment(
    getParam(req.params.taskId),
    req.user!._id.toString(),
    req.body.content
  )

  res.status(201).json({
    success: true,
    data: comment,
  })
}

export const updateTaskCommentController = async (
  req: Request,
  res: Response
) => {
  const comment = await updateTaskComment(
    getParam(req.params.commentId),
    req.user!._id.toString(),
    req.body.content
  )

  res.status(200).json({
    success: true,
    data: comment,
  })
}

export const deleteTaskCommentController = async (
  req: Request,
  res: Response
) => {
  const result = await deleteTaskComment(
    getParam(req.params.commentId),
    req.user!._id.toString()
  )

  res.status(200).json({
    success: true,
    data: result,
  })
}
