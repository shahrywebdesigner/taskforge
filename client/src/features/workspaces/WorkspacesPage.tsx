
import { useCallback, useEffect, useState } from 'react'
import {
  BriefcaseBusiness,
  Plus,
  FolderKanban,
  UserRound,
  Crown,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router'

import { getWorkspaces } from './workspace.api'
import { useWorkspace } from './useWorkspace'
import { useAuth } from '../../features/auth/useAuth'

import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import EmptyState from '../../components/ui/EmptyState'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import ErrorMessage from '../../components/ui/ErrorMessage'

interface Workspace {
  _id: string
  name: string
  description?: string
  createdAt: string
  owner: {
    _id: string
    name: string
  }
  projects: {
    _id: string
    name: string
  }[]
}

function WorkspacesPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const {
    selectedWorkspaceId,
    setSelectedWorkspaceId,
    setSelectedWorkspaceName,
  } = useWorkspace()

  const isPro = user?.isProActive === true

  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchWorkspaces = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const response = await getWorkspaces()
      setWorkspaces(response.data)
    } catch {
      setError('Unable to load your workspaces.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let isActive = true

    const loadWorkspaces = async () => {
      try {
        const response = await getWorkspaces()

        if (isActive) {
          setWorkspaces(response.data)
          setError('')
        }
      } catch {
        if (isActive) {
          setError('Unable to load your workspaces.')
        }
      } finally {
        if (isActive) {
          setLoading(false)
        }
      }
    }

    void loadWorkspaces()

    return () => {
      isActive = false
    }
  }, [])

  const handleSelectWorkspace = (workspaceId: string) => {
    const selectedWorkspace = workspaces.find(
      (workspace) => workspace._id === workspaceId
    )

    if (!selectedWorkspace) return

    setSelectedWorkspaceId(workspaceId)
    setSelectedWorkspaceName(selectedWorkspace.name)

    navigate(`/workspaces/${workspaceId}`)
  }

  const sortedWorkspaces = [...workspaces].sort((a, b) => {
    if (a._id === selectedWorkspaceId) return -1
    if (b._id === selectedWorkspaceId) return 1
    return 0
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="My Workspaces"
          description="View and manage your workspaces."
        />

        {isPro ? (
          <Link
            to="/workspaces/create"
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 sm:w-auto"
          >
            <Plus size={17} />
            Create Workspace
          </Link>
        ) : (
          <Link
            to="/billing"
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-amber-50 px-4 py-2.5 text-sm font-medium text-amber-700 hover:bg-amber-100 sm:w-auto"
          >
            <Crown size={17} />
            Upgrade to Pro
          </Link>
        )}
      </div>

      {loading ? (
        <LoadingSpinner message="Loading workspaces..." />
      ) : error ? (
        <ErrorMessage
          message={error}
          onRetry={fetchWorkspaces}
        />
      ) : workspaces.length === 0 ? (
        <EmptyState
          title="No workspaces found"
          description="You can join a workspace when its owner invites you."
          icon={BriefcaseBusiness}
          action={
            !isPro ? (
              <Link
                to="/billing"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
              >
                <Crown size={17} />
                Upgrade to Pro
              </Link>
            ) : (
              <Link
                to="/workspaces/create"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
              >
                <Plus size={17} />
                Create Workspace
              </Link>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {sortedWorkspaces.map((workspace) => {
            const isSelected = selectedWorkspaceId === workspace._id

            return (
              <Card key={workspace._id}>
                <button
                  type="button"
                  onClick={() => handleSelectWorkspace(workspace._id)}
                  className="w-full rounded-lg text-left"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="shrink-0 rounded-lg bg-indigo-50 p-3 text-indigo-600">
                        <BriefcaseBusiness size={22} />
                      </div>

                      <div className="min-w-0">
                        <h2 className="break-words font-semibold text-slate-900">
                          {workspace.name}
                        </h2>

                        <p className="mt-1 break-words text-sm text-slate-500">
                          {workspace.description || 'No description provided.'}
                        </p>
                      </div>
                    </div>

                    {isSelected && (
                      <span className="shrink-0 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-600">
                        Selected
                      </span>
                    )}
                  </div>

                  <div className="mt-5 border-t border-slate-100 pt-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      <FolderKanban
                        size={16}
                        className="shrink-0 text-indigo-500"
                      />
                      Projects ({workspace.projects.length})
                    </div>

                    {workspace.projects.length > 0 ? (
                      <ul className="mt-2 space-y-1 pl-6">
                        {workspace.projects.map((project) => (
                          <li
                            key={project._id}
                            className="list-disc break-words text-sm text-slate-500"
                          >
                            {project.name}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-2 pl-6 text-sm text-slate-400">
                        No projects yet.
                      </p>
                    )}
                  </div>

                  <div className="mt-4 flex min-w-0 items-center gap-2 text-sm text-slate-600">
                    <UserRound
                      size={16}
                      className="shrink-0 text-indigo-500"
                    />
                    <span className="min-w-0 break-words">
                      Created by:{' '}
                      <strong>{workspace.owner?.name || 'Unknown'}</strong>
                    </span>
                  </div>

                  <p className="mt-3 text-xs text-slate-400">
                    Created:{' '}
                    {new Date(workspace.createdAt).toLocaleDateString()}
                  </p>

                  <p className="mt-4 text-sm font-medium text-indigo-600">
                    {isSelected ? 'Current Workspace' : 'Select Workspace →'}
                  </p>
                </button>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default WorkspacesPage
