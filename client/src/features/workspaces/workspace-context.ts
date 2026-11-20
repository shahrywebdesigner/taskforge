
import { createContext } from 'react'

interface WorkspaceContextType {
  selectedWorkspaceId: string | null
  setSelectedWorkspaceId: (id: string | null) => void

  selectedWorkspaceName: string | null
  setSelectedWorkspaceName: (name: string | null) => void
}

export const WorkspaceContext = createContext<
  WorkspaceContextType | undefined
>(undefined)
