
import api from '../../lib/axios'

export interface CommentItem {
  _id: string
  content: string
  createdAt: string
  updatedAt: string
  canEdit: boolean
  author: {
    _id: string
    name: string
    email: string
  }
}

interface CommentsResponse {
  comments: CommentItem[]
  canComment: boolean
}

export const getTaskComments = async (
  taskId: string
): Promise<CommentsResponse> => {
  const response = await api.get(`/comments/task/${taskId}`)
  return response.data.data
}

export const createTaskComment = async (
  taskId: string,
  content: string
): Promise<CommentItem> => {
  const response = await api.post(`/comments/task/${taskId}`, {
    content,
  })

  return response.data.data
}

export const updateTaskComment = async (
  commentId: string,
  content: string
): Promise<CommentItem> => {
  const response = await api.patch(`/comments/${commentId}`, {
    content,
  })

  return response.data.data
}

export const deleteTaskComment = async (
  commentId: string
): Promise<void> => {
  await api.delete(`/comments/${commentId}`)
}
