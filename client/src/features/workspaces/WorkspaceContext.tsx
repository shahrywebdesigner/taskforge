
import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { WorkspaceContext } from './workspace-context'

interface WorkspaceProviderProps {
  children: ReactNode
}

export function WorkspaceProvider({ children }: WorkspaceProviderProps) {
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(
    () => localStorage.getItem('taskforge_selected_workspace_id')
  )

  const [selectedWorkspaceName, setSelectedWorkspaceName] = useState<
    string | null
  >(() => localStorage.getItem('taskforge_selected_workspace_name'))

  useEffect(() => {
    if (selectedWorkspaceId) {
      localStorage.setItem(
        'taskforge_selected_workspace_id',
        selectedWorkspaceId
      )
    } else {
      localStorage.removeItem('taskforge_selected_workspace_id')
    }
  }, [selectedWorkspaceId])

  useEffect(() => {
    if (selectedWorkspaceName) {
      localStorage.setItem(
        'taskforge_selected_workspace_name',
        selectedWorkspaceName
      )
    } else {
      localStorage.removeItem('taskforge_selected_workspace_name')
    }
  }, [selectedWorkspaceName])

  return (
    <WorkspaceContext.Provider
      value={{
        selectedWorkspaceId,
        setSelectedWorkspaceId,
        selectedWorkspaceName,
        setSelectedWorkspaceName,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  )
}
