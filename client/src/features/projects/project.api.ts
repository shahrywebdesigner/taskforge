import api from '../../lib/axios'

export interface CreateProjectData {
  name: string
  description?: string
  workspaceId: string
  status?: 'planning' | 'active' | 'completed'
}

export interface ProjectMember {
  _id: string
  name: string
  email: string
  username?: string
}

export interface ProjectTask {
  _id: string
  title: string
  description?: string
  status: 'todo' | 'in-progress' | 'review' | 'done'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  dueDate?: string
  createdAt: string
  assignedTo: ProjectMember
}

export interface ProjectDetails {
  _id: string
  name: string
  description?: string
  status: 'planning' | 'active' | 'completed'
  workspace: {
    _id: string
    name: string
  }
  createdBy: ProjectMember
  managers: ProjectMember[]
  leads: ProjectMember[]
  tasks: ProjectTask[]
  createdAt: string
  updatedAt: string
  permissions: {
    isOwner: boolean
    isAdmin: boolean
    isManager: boolean
    isLead: boolean
    canManageTasks: boolean
    canManageProject: boolean
    canManageWorkspace: boolean
  }
}

export const createProject = async (data: CreateProjectData) => {
  const response = await api.post('/projects', data)
  return response.data
}

export const getWorkspaceProjects = async (workspaceId: string) => {
  const response = await api.get(`/projects/workspace/${workspaceId}`)
  return response.data
}

export const getProjectById = async (
  projectId: string
): Promise<ProjectDetails> => {
  const response = await api.get(`/projects/${projectId}`)
  return response.data.data
}

export interface UpdateProjectData {
  name?: string
  description?: string
  status?: ProjectDetails['status']
  workspaceId?: string
}

export const updateProject = async (
  projectId: string,
  data: UpdateProjectData
): Promise<ProjectDetails> => {
  const response = await api.patch(`/projects/${projectId}`, data)
  return response.data.data
}

export const updateProjectRole = async (
  projectId: string,
  memberId: string,
  role: 'manager' | 'lead',
  action: 'assign' | 'remove'
) => {
  const response = await api.patch(`/projects/${projectId}/roles`, {
    memberId,
    role,
    action,
  })

  return response.data
}

export const deleteProject = async (
  projectId: string
): Promise<void> => {
  await api.delete(`/projects/${projectId}`)
}