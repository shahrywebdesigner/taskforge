
import api from '../../lib/axios'

export interface Task {
  _id: string
  title: string
  description?: string
  project: {
    _id: string
    name: string
  }
  workspace: {
    _id: string
    name: string
  }
  assignedTo: string
  createdBy: string
  status: 'todo' | 'in-progress' | 'review' | 'done'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  dueDate?: string
  createdAt: string
  updatedAt: string
}

export interface TaskMember {
  _id: string
  name: string
  email: string
  role?: 'Owner' | 'Admin' | 'Member'
}

export interface TaskDetails extends Omit<Task, 'assignedTo' | 'createdBy'> {
  assignedTo: TaskMember
  createdBy: TaskMember
}

export interface TaskPermissions {
  isOwner: boolean
  isAdmin: boolean
  isManager: boolean
  isLead: boolean
  canManageTasks: boolean
  canManageProject: boolean
  canManageWorkspace: boolean
  canEditTask: boolean
  canDeleteTask: boolean
}

export interface TaskOverviewResponse {
  task: TaskDetails
  permissions: TaskPermissions
}

export interface CreateTaskData {
  title: string
  description?: string
  projectId: string
  assignedTo?: string
  status?: Task['status']
  priority?: Task['priority']
  dueDate?: string
}

export interface UpdateTaskData {
  title?: string
  description?: string
  assignedTo?: string
  status?: Task['status']
  priority?: Task['priority']
  dueDate?: string
}

export const getMyTasks = async (): Promise<Task[]> => {
  const response = await api.get('/tasks/my-tasks')
  return response.data.data
}

export const createTask = async (data: CreateTaskData) => {
  const response = await api.post('/tasks', data)
  return response.data.data as Task
}

export const getMyTaskById = async (
  taskId: string
): Promise<TaskOverviewResponse> => {
  const response = await api.get(`/tasks/my-tasks/${taskId}`)
  return response.data.data
}
export const updateTask = async (
  taskId: string,
  data: UpdateTaskData
): Promise<Task> => {
  const response = await api.patch(`/tasks/${taskId}`, data)
  return response.data.data
}
export const deleteTask = async (taskId: string): Promise<void> => {
  await api.delete(`/tasks/${taskId}`)
}
