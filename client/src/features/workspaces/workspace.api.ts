import api from '../../lib/axios'

export interface CreateWorkspaceData {
  name: string
  description?: string
}

export const createWorkspace = async (
  data: CreateWorkspaceData
) => {
  const response = await api.post('/workspaces', data)

  return response.data
}

export const getWorkspaces = async () => {
  const response = await api.get('/workspaces')

  return response.data
}

export const getWorkspaceMembers = async (
  workspaceId: string
) => {
  const response = await api.get(
    `/workspaces/${workspaceId}/members`
  )

  return response.data
}

export const addWorkspaceMember = async (
  workspaceId: string,
  identifier: string
) => {
  const response = await api.post(
    `/workspaces/${workspaceId}/members`,
    { identifier }
  )

  return response.data
}

export const updateWorkspaceAdmin = async (
  workspaceId: string,
  memberId: string,
  isAdmin: boolean
) => {
  const response = await api.patch(
    `/workspaces/${workspaceId}/admins`,
    { memberId, isAdmin }
  )

  return response.data
}

export interface UpdateWorkspaceData {
  name?: string
  description?: string
}

export const updateWorkspace = async (
  workspaceId: string,
  data: UpdateWorkspaceData
) => {
  const response = await api.patch(
    `/workspaces/${workspaceId}`,
    data
  )

  return response.data
}

export const deleteWorkspace = async (
  workspaceId: string
) => {
  const response = await api.delete(
    `/workspaces/${workspaceId}`
  )

  return response.data
}

export const removeWorkspaceMember = async (
  workspaceId: string,
  memberId: string
) => {
  const response = await api.delete(
    `/workspaces/${workspaceId}/members/${memberId}`
  )

  return response.data
}
