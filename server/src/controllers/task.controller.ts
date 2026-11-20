
import type { Request, Response } from 'express'
import AppError from '../utils/AppError.js'
import {
  createTask,
  getMyTasks,
  getMyTaskById,
  updateTask,
  deleteTask,
} from '../services/task.service.js'

export const createTaskController = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!req.user) {
    throw new AppError('Authentication required', 401)
  }

  const task = await createTask(
    req.body,
    req.user._id.toString()
  )

  res.status(201).json({
    success: true,
    message: 'Task created successfully',
    data: task,
  })
}

export const getMyTasksController = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!req.user) {
    throw new AppError('Authentication required', 401)
  }

  const tasks = await getMyTasks(req.user._id.toString())

  res.status(200).json({
    success: true,
    data: tasks,
  })
}

export const getMyTaskByIdController = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!req.user) {
    throw new AppError('Authentication required', 401)
  }

const taskId = String(req.params.taskId)

const task = await getMyTaskById(
  taskId,
  req.user._id.toString()
)

  res.status(200).json({
    success: true,
    data: task,
  })
}

export const updateTaskController = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!req.user) {
    throw new AppError('Authentication required', 401)
  }

  const task = await updateTask(
    String(req.params.taskId),
    req.body,
    req.user._id.toString()
  )

  res.status(200).json({
    success: true,
    message: 'Task updated successfully',
    data: task,
  })
}

export const deleteTaskController = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!req.user) {
    throw new AppError('Authentication required', 401)
  }

  await deleteTask(
    String(req.params.taskId),
    req.user._id.toString()
  )

  res.status(200).json({
    success: true,
    message: 'Task deleted successfully',
  })
}