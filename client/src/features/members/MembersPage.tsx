
import { useEffect, useState, type FormEvent } from 'react'
import axios from 'axios'
import {
  Mail,
  Plus,
  AtSign,
  Shield,
  ShieldCheck,
  UserMinus,
  FolderKanban,
  UserRound, 
} from 'lucide-react'

import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'

import { useWorkspace } from '../workspaces/useWorkspace'
import {
  getWorkspaces,
  getWorkspaceMembers,
  addWorkspaceMember,
  updateWorkspaceAdmin,
  removeWorkspaceMember,
} from '../workspaces/workspace.api'
import EmptyState from '../../components/ui/EmptyState'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import ErrorMessage from '../../components/ui/ErrorMessage'

interface Workspace {
  _id: string
  name: string
  isProActive: boolean
  permissions?: {
    isOwner: boolean
    isAdmin: boolean
    canManageWorkspace: boolean
  }
}

interface ProjectRole {
  projectId: string
  projectName: string
  roles: string[]
}

interface Member {
  _id: string
  name: string
  username?: string
  email: string
  role: 'Owner' | 'Admin' | 'Member'
  status: string
  projectRoles: ProjectRole[]
}

function MembersPage() {
  const { selectedWorkspaceId, setSelectedWorkspaceId } = useWorkspace()

  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [members, setMembers] = useState<Member[]>([])

  const [identifier, setIdentifier] = useState('')

  const [loading, setLoading] = useState(true)
  const [membersLoading, setMembersLoading] = useState(false)
  const [adding, setAdding] = useState(false)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const selectedWorkspace = workspaces.find(
    (workspace) => workspace._id === selectedWorkspaceId
  )

  const canManageWorkspace =
    selectedWorkspace?.isProActive === true &&
    selectedWorkspace.permissions?.canManageWorkspace === true

  const canManageRoles =
    selectedWorkspace?.isProActive === true &&
    selectedWorkspace.permissions?.isOwner === true

  useEffect(() => {
    let active = true

    const fetchWorkspaces = async () => {
      try {
        const response = await getWorkspaces()

        if (active) {
          setWorkspaces(response.data)
        }
      } catch {
        if (active) {
          setError('Unable to load workspaces.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    fetchWorkspaces()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (loading) return

    if (workspaces.length === 0) {
      if (selectedWorkspaceId) {
        setSelectedWorkspaceId(null)
      }
      return
    }

    const selectedExists = workspaces.some(
      (workspace) => workspace._id === selectedWorkspaceId
    )

    if (!selectedExists) {
      setSelectedWorkspaceId(workspaces[0]._id)
    }
  }, [
    loading,
    workspaces,
    selectedWorkspaceId,
    setSelectedWorkspaceId,
  ])

  useEffect(() => {
    if (!selectedWorkspaceId) {
      return
    }

    let active = true

    const fetchMembers = async () => {
      try {
        setMembersLoading(true)
        setError('')
        setSuccess('')

        const response = await getWorkspaceMembers(selectedWorkspaceId)

        if (active) {
          setMembers(response.data)
        }
      } catch (error: unknown) {
        if (active) {
          const message = axios.isAxiosError(error)
            ? error.response?.data?.message
            : undefined

          setError(message || 'Unable to load workspace members.')
          setMembers([])
        }
      } finally {
        if (active) {
          setMembersLoading(false)
        }
      }
    }

    fetchMembers()

    return () => {
      active = false
    }
  }, [selectedWorkspaceId])

  const refreshMembers = async () => {
    if (!selectedWorkspaceId) return

    try {
      setMembersLoading(true)

      const response = await getWorkspaceMembers(selectedWorkspaceId)

      setMembers(response.data)
    } catch {
      setError('Unable to refresh workspace members.')
    } finally {
      setMembersLoading(false)
    }
  }

  const handleAddMember = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!canManageWorkspace || !selectedWorkspaceId) return

    const value = identifier.trim()

    if (!value) return

    try {
      setAdding(true)
      setError('')
      setSuccess('')

      const response = await addWorkspaceMember(
        selectedWorkspaceId,
        value
      )

      setIdentifier('')
      setSuccess(response.message || 'Member added successfully.')

      await refreshMembers()
    } catch (error: unknown) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message
        : undefined

      setError(message || 'Unable to add member.')
    } finally {
      setAdding(false)
    }
  }

  const handleAdminChange = async (member: Member) => {
    if (!canManageRoles || !selectedWorkspaceId) return
    if (member.role === 'Owner') return

    const isAdmin = member.role !== 'Admin'

    try {
      setActionLoadingId(member._id)
      setError('')
      setSuccess('')

      const response = await updateWorkspaceAdmin(
        selectedWorkspaceId,
        member._id,
        isAdmin
      )

      setSuccess(
        response.message ||
          (isAdmin
            ? `${member.name} promoted to Admin.`
            : `${member.name} changed to Member.`)
      )

      await refreshMembers()
    } catch (error: unknown) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message
        : undefined

      setError(message || 'Unable to update member role.')
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleRemoveMember = async (member: Member) => {
    if (!canManageWorkspace || !selectedWorkspaceId) return

    const isOwner = selectedWorkspace?.permissions?.isOwner === true

    const canRemove = isOwner
      ? member.role !== 'Owner'
      : member.role === 'Member'

    if (!canRemove) return

    const confirmed = window.confirm(
      `Are you sure you want to remove ${member.name} from this workspace?`
    )

    if (!confirmed) return

    try {
      setActionLoadingId(member._id)
      setError('')
      setSuccess('')

      const response = await removeWorkspaceMember(
        selectedWorkspaceId,
        member._id
      )

      setSuccess(response.message || `${member.name} removed successfully.`)

      await refreshMembers()
    } catch (error: unknown) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message
        : undefined

      setError(message || 'Unable to remove member.')
    } finally {
      setActionLoadingId(null)
    }
  }

if (loading) {
  return <LoadingSpinner message="Loading workspaces..." fullPage />
}
  return (
    <div className="space-y-6">
            <PageHeader
        title="Team Members"
        description="Manage your workspace members and view their project roles."
      />

      {error && !selectedWorkspace && (
        <ErrorMessage message={error} />
      )}

      <Card>
        <div className="w-full max-w-md">
          <label
            htmlFor="workspace"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Select Workspace
          </label>

          <select
            id="workspace"
            value={selectedWorkspaceId || ''}
            onChange={(event) =>
              setSelectedWorkspaceId(event.target.value || null)
            }
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          >
            {workspaces.map((workspace) => (
              <option key={workspace._id} value={workspace._id}>
                {workspace.name}
              </option>
            ))}
          </select>
        </div>
      </Card>

{workspaces.length === 0 && (
  <EmptyState
    title="No workspace found"
    description="You need to be invited to a workspace before you can view team members."
    icon={FolderKanban}
  />
)}

      {selectedWorkspace && (
        <>
          {!selectedWorkspace.isProActive && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="font-medium text-amber-800">
                This workspace is read-only
              </p>

              <p className="mt-1 text-sm text-amber-700">
                The workspace owner's Pro subscription has expired.
                Members can still view the team, but management actions
                are unavailable until Pro is renewed.
              </p>
            </div>
          )}

          {canManageWorkspace && (
            <Card>
              <div className="mb-4">
                <h2 className="font-semibold text-slate-900">
                  Add Team Member
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Enter a registered user's email or username.
                </p>
              </div>

              <form
                onSubmit={handleAddMember}
                className="flex flex-col gap-3 sm:flex-row"
              >
                <div className="relative flex-1">
                  <AtSign
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    value={identifier}
                    onChange={(event) => setIdentifier(event.target.value)}
                    placeholder="Email or username"
                    minLength={3}
                    maxLength={254}
                    required
                    className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                <button
                  type="submit"
                  disabled={adding || !identifier.trim()}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Plus size={17} />
                  {adding ? 'Adding...' : 'Add Member'}
                </button>
              </form>

              <p className="mt-2 text-xs text-slate-400">
                Only workspace owners and admins can add members.
              </p>
            </Card>
          )}

{error && (
  <ErrorMessage message={error} />
)}

          {success && (
            <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
              {success}
            </p>
          )}

          <section>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold text-slate-900">
                  Workspace Members
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {members.length} {members.length === 1 ? 'member' : 'members'}
                </p>
              </div>

              <Badge>{members.length} Members</Badge>
            </div>

{membersLoading ? (
  <LoadingSpinner message="Loading workspace members..." />
) : members.length === 0 ? (
  <EmptyState
    title="No members found"
    description="There are currently no members to display in this workspace."
    icon={UserRound}
  />
) : (
              <Card>
                <div className="divide-y divide-slate-100">
                  {members.map((member) => {
                    const isOwner = member.role === 'Owner'
                    const isAdmin = member.role === 'Admin'

                    const canRemoveThisMember =
                      canManageWorkspace &&
                      (selectedWorkspace.permissions?.isOwner
                        ? !isOwner
                        : member.role === 'Member')

                    return (
                      <div
                        key={member._id}
                        className="flex flex-col justify-between gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-start"
                      >
                        <div className="flex min-w-0 items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 font-semibold text-indigo-600">
                            {member.name.charAt(0).toUpperCase()}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium text-slate-900">
                              {member.name}
                            </p>

                            <p className="flex items-center gap-1 truncate text-sm text-slate-500">
                              <Mail size={13} />
                              {member.email}
                            </p>

                            {member.username && (
                              <p className="text-xs text-slate-400">
                                @{member.username}
                              </p>
                            )}

                            <div className="mt-3">
                              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Project Roles
                              </p>

                              {member.projectRoles?.length ? (
                                <div className="space-y-2">
                                  {member.projectRoles.map((projectRole) => (
                                    <div
                                      key={projectRole.projectId}
                                      className="flex flex-wrap items-center gap-2"
                                    >
                                      <span className="flex items-center gap-1 text-xs text-slate-600">
                                        <FolderKanban size={13} />
                                        {projectRole.projectName}
                                      </span>

                                      {projectRole.roles.map((role) => (
                                        <Badge key={role}>
                                          {role}
                                        </Badge>
                                      ))}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-slate-400">
                                  No special project role assigned.
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 sm:max-w-[55%] sm:justify-end">
                          <Badge>{member.role}</Badge>

                          <Badge
                            variant={
                              member.status === 'Active'
                                ? 'success'
                                : 'warning'
                            }
                          >
                            {member.status}
                          </Badge>

                          {canManageRoles && !isOwner && (
                            <button
                              type="button"
                              onClick={() => handleAdminChange(member)}
                              disabled={actionLoadingId !== null}
                              className="flex items-center gap-1 rounded-lg border border-indigo-200 px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <Shield size={14} />

                              {actionLoadingId === member._id
                                ? 'Updating...'
                                : isAdmin
                                  ? 'Make Member'
                                  : 'Make Admin'}
                            </button>
                          )}

                          {canRemoveThisMember && (
                            <button
                              type="button"
                              onClick={() => handleRemoveMember(member)}
                              disabled={actionLoadingId !== null}
                              className="flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <UserMinus size={14} />

                              {actionLoadingId === member._id
                                ? 'Processing...'
                                : 'Remove'}
                            </button>
                          )}

                          {(isOwner || isAdmin) && (
                            <span className="sr-only">
                              <ShieldCheck />
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </Card>
            )}
          </section>
        </>
      )}
    </div>
  )
}

export default MembersPage
