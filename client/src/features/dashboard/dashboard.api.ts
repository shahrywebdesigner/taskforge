
import api from '../../lib/axios'

export interface DashboardStats {
  totalProjects: number
  totalTasks: number
  completedTasks: number
  pendingTasks: number
}

export interface DashboardProject {
  _id: string
  name: string
  description?: string
  status: 'planning' | 'active' | 'completed'
  workspace?: {
    _id: string
    name: string
  } | null
  createdAt: string
  updatedAt: string
}

export interface DashboardActivity {
  _id: string
  type: string
  title: string
  message: string
  createdAt: string
  actor?: {
    _id: string
    name: string
    username?: string
  } | null
}

export interface DashboardData {
  stats: DashboardStats
  recentProjects: DashboardProject[]
  recentActivity: DashboardActivity[]
}

export const getDashboardData = async (): Promise<DashboardData> => {
  const response = await api.get('/dashboard')
  return response.data.data
}
