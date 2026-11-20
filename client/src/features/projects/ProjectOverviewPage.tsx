import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router";
import AttachmentsPanel from '../attachments/AttachmentsPanel'

import {
  ArrowLeft,
  CalendarDays,
  FolderKanban,
  ListTodo,
  UserRound,
  Pencil,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";

import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";

import {
  getProjectById,
  updateProject,
  deleteProject,
  updateProjectRole,
  type ProjectDetails,
  type ProjectTask,
  type ProjectMember,
} from "./project.api";

import {
  getWorkspaces,
  getWorkspaceMembers,
} from "../workspaces/workspace.api";

import EmptyState from "../../components/ui/EmptyState";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import ErrorMessage from "../../components/ui/ErrorMessage";

interface WorkspaceOption {
  _id: string;
  name: string;
  isProActive: boolean;
  permissions?: {
    isOwner: boolean;
    isAdmin: boolean;
    canManageWorkspace: boolean;
  };
}

interface WorkspaceMember {
  _id: string;
  name: string;
  email: string;
  username?: string;
  role: "Owner" | "Admin" | "Member";
  status?: string;
}

function ProjectOverviewPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [workspaces, setWorkspaces] = useState<WorkspaceOption[]>([]);
  const [workspaceMembers, setWorkspaceMembers] = useState<WorkspaceMember[]>(
    [],
  );

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState("");

  const [roleError, setRoleError] = useState("");
  const [roleLoading, setRoleLoading] = useState("");

  const [selectedManagerId, setSelectedManagerId] = useState("");
  const [selectedLeadId, setSelectedLeadId] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "planning" as ProjectDetails["status"],
    workspaceId: "",
  });

  const currentWorkspace = workspaces.find(
    (workspace) => workspace._id === project?.workspace._id,
  );

  const workspaceIsProActive = currentWorkspace?.isProActive === true;
  const eligibleTargetWorkspaces = workspaces.filter(
    (workspace) =>
      workspace.isProActive === true &&
      workspace.permissions?.canManageWorkspace === true,
  );
  const isInvalidProjectId = !projectId;

  // Load project
  useEffect(() => {
    if (!projectId) return;

    let ignore = false;

    getProjectById(projectId)
      .then((data) => {
        if (!ignore) {
          setProject(data);
          setError("");
        }
      })
      .catch(() => {
        if (!ignore) {
          setError("Project not found or you do not have access to it.");
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [projectId]);

  // Load workspaces
  useEffect(() => {
    let ignore = false;

    getWorkspaces()
      .then((response) => {
        if (!ignore) {
          setWorkspaces(response.data || []);
        }
      })
      .catch(() => {
        if (!ignore) {
          setActionError("Unable to load workspaces.");
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  // Load members of current project workspace
  useEffect(() => {
    if (!project?.workspace._id) return;

    let ignore = false;

    getWorkspaceMembers(project.workspace._id)
      .then((response) => {
        if (!ignore) {
          setWorkspaceMembers(response.data || []);
        }
      })
      .catch(() => {
        if (!ignore) {
          setWorkspaceMembers([]);
          setRoleError("Unable to load workspace members.");
        }
      });

    return () => {
      ignore = true;
    };
  }, [project?.workspace._id]);

  const openEditModal = () => {
    if (!project) return;

    setFormData({
      name: project.name,
      description: project.description || "",
      status: project.status,
      workspaceId: project.workspace._id,
    });

    setActionError("");
    setIsEditOpen(true);
  };

  const handleUpdateProject = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!workspaceIsProActive || !project?.permissions.canManageProject) {
      return;
    }

    if (!projectId || !project) return;

    try {
      setSaving(true);
      setActionError("");

      await updateProject(projectId, {
        name: formData.name,
        description: formData.description,
        status: formData.status,
        ...(project.permissions.canManageWorkspace
          ? { workspaceId: formData.workspaceId }
          : {}),
      });

      const updatedProject = await getProjectById(projectId);
      setProject(updatedProject);
      setIsEditOpen(false);
    } catch {
      setActionError("Unable to update project. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!workspaceIsProActive || !project?.permissions.canManageProject) {
      return;
    }

    if (!projectId) return;

    try {
      setDeleting(true);
      setActionError("");

      await deleteProject(projectId);
      navigate("/projects");
    } catch {
      setActionError("Unable to delete project. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  // Assign or remove Project Manager / Lead
  const handleProjectRole = async (
    memberId: string,
    role: "manager" | "lead",
    action: "assign" | "remove",
  ) => {
    if (!projectId || !project) return;

    if (!workspaceIsProActive || !project.permissions.canManageWorkspace) {
      return;
    }

    try {
      setRoleLoading(`${role}-${memberId}`);
      setRoleError("");

      await updateProjectRole(projectId, memberId, role, action);

      const updatedProject = await getProjectById(projectId);
      setProject(updatedProject);

      if (role === "manager") {
        setSelectedManagerId("");
      } else {
        setSelectedLeadId("");
      }
    } catch {
      setRoleError(
        `Unable to ${action === "assign" ? "assign" : "remove"} ${role}. Please try again.`,
      );
    } finally {
      setRoleLoading("");
    }
  };

  const formatDate = (date?: string) => {
    if (!date) return "Not set";

    return new Date(date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusVariant = (status: ProjectDetails["status"]) => {
    if (status === "completed") return "success";
    if (status === "planning") return "warning";
    return "default";
  };

  const getTaskStatusVariant = (status: ProjectTask["status"]) => {
    if (status === "done") return "success";
    if (status === "todo") return "warning";
    return "default";
  };

  const formatTaskStatus = (status: ProjectTask["status"]) => {
    const labels: Record<ProjectTask["status"], string> = {
      todo: "To Do",
      "in-progress": "In Progress",
      review: "In Review",
      done: "Completed",
    };

    return labels[status];
  };

  if (isInvalidProjectId) {
    return (
      <Card>
        <p className="text-sm text-red-500">Invalid project ID.</p>

        <Link
          to="/projects"
          className="mt-3 inline-block text-sm text-indigo-600"
        >
          Back to Projects
        </Link>
      </Card>
    );
  }

  if (loading) {
    return <LoadingSpinner message="Loading project details..." fullPage />;
  }

  if (error || !project) {
    return (
      <div>
        <Link
          to="/projects"
          className="mb-5 inline-flex items-center gap-2 text-sm text-indigo-600"
        >
          <ArrowLeft size={16} />
          Back to Projects
        </Link>

        <Card>
          <ErrorMessage message={error || "Project not found."} />
        </Card>
      </div>
    );
  }

  const canManageProject =
    workspaceIsProActive && project.permissions.canManageProject;

  const canManageWorkspace =
    workspaceIsProActive && project.permissions.canManageWorkspace;

  const managers = project.managers || [];
  const leads = project.leads || [];

  const availableManagers = workspaceMembers.filter(
    (member) => !managers.some((manager) => manager._id === member._id),
  );

  const availableLeads = workspaceMembers.filter(
    (member) => !leads.some((lead) => lead._id === member._id),
  );

  const renderAssignedMembers = (
    members: ProjectMember[],
    role: "manager" | "lead",
  ) => {
    if (members.length === 0) {
      return (
        <p className="text-sm text-slate-500">
          No {role === "manager" ? "Project Manager" : "Lead"} assigned yet.
        </p>
      );
    }

    return (
      <div className="mt-3 space-y-3">
        {members.map((member) => (
          <div
            key={member._id}
            className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-3"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                <UserRound size={18} />
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-900">
                  {member.name}
                </p>

                <p className="truncate text-xs text-slate-500">
                  {member.email}
                </p>
              </div>
            </div>

            {canManageWorkspace && (
              <button
                type="button"
                disabled={Boolean(roleLoading)}
                onClick={() => handleProjectRole(member._id, role, "remove")}
                title={`Remove ${role}`}
                className="shrink-0 rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {roleLoading === `${role}-${member._id}` ? (
                  <span className="text-xs">...</span>
                ) : (
                  <X size={17} />
                )}
              </button>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      <Link
        to="/projects"
        className="mb-5 inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700"
      >
        <ArrowLeft size={16} />
        Back to Projects
      </Link>

      <PageHeader
        title="Project Overview"
        description="View project information and its tasks."
      />
      {actionError && !isEditOpen && !isDeleteOpen && (
        <div className="mt-4">
          <ErrorMessage message={actionError} />
        </div>
      )}
      {currentWorkspace && !workspaceIsProActive && (
        <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <h3 className="font-medium text-amber-800">
            This workspace is read-only
          </h3>

          <p className="mt-1 text-sm text-amber-700">
            The workspace owner's Pro subscription has expired. Project changes
            will be available again when the owner renews their subscription.
          </p>
        </div>
      )}

      {canManageProject && (
        <div className="mt-5 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={openEditModal}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 sm:w-auto"
          >
            <Pencil size={16} />
            Edit Project
          </button>

          <button
            type="button"
            onClick={() => {
              setActionError("");
              setIsDeleteOpen(true);
            }}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 sm:w-auto"
          >
            <Trash2 size={16} />
            Delete Project
          </button>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-indigo-50 p-3 text-indigo-600">
                  <FolderKanban size={24} />
                </div>

                <div className="min-w-0">
                  <h2 className="text-xl font-semibold text-slate-900">
                    {project.name}
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {project.description || "No description provided."}
                  </p>
                </div>
              </div>

              <Badge variant={getStatusVariant(project.status)}>
                {project.status.charAt(0).toUpperCase() +
                  project.status.slice(1)}
              </Badge>
            </div>
          </Card>

          {/* Project Team */}
          <Card>
            <div>
              <h3 className="font-semibold text-slate-900">Project Team</h3>

              <p className="mt-1 text-sm text-slate-500">
                Manage the people responsible for this project.
              </p>
            </div>

            {roleError && (
              <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {roleError}
              </p>
            )}
            <div className="mt-5 space-y-6">
              {/* Project Manager */}
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-slate-800">
                    Project Managers
                  </h4>

                  <Badge>{managers.length}</Badge>
                </div>

                {renderAssignedMembers(managers, "manager")}

                {canManageWorkspace && (
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                    <select
                      value={selectedManagerId}
                      onChange={(event) =>
                        setSelectedManagerId(event.target.value)
                      }
                      disabled={
                        Boolean(roleLoading) || availableManagers.length === 0
                      }
                      className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-50"
                    >
                      <option value="">Select Project Manager</option>

                      {availableManagers.map((member) => (
                        <option key={member._id} value={member._id}>
                          {member.name} ({member.role})
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      disabled={!selectedManagerId || Boolean(roleLoading)}
                      onClick={() =>
                        handleProjectRole(
                          selectedManagerId,
                          "manager",
                          "assign",
                        )
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <UserPlus size={16} />
                      Assign
                    </button>
                  </div>
                )}
              </div>

              <div className="border-t border-slate-100" />

              {/* Project Lead */}
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-slate-800">
                    Project Leads
                  </h4>

                  <Badge>{leads.length}</Badge>
                </div>

                {renderAssignedMembers(leads, "lead")}

                {canManageWorkspace && (
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                    <select
                      value={selectedLeadId}
                      onChange={(event) =>
                        setSelectedLeadId(event.target.value)
                      }
                      disabled={
                        Boolean(roleLoading) || availableLeads.length === 0
                      }
                      className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-50"
                    >
                      <option value="">Select Project Lead</option>

                      {availableLeads.map((member) => (
                        <option key={member._id} value={member._id}>
                          {member.name} ({member.role})
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      disabled={!selectedLeadId || Boolean(roleLoading)}
                      onClick={() =>
                        handleProjectRole(selectedLeadId, "lead", "assign")
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <UserPlus size={16} />
                      Assign
                    </button>
                  </div>
                )}
              </div>
            </div>

            {!canManageWorkspace && (
              <p className="mt-5 text-xs text-slate-500">
                Only the Workspace Owner or Admin can manage project roles.
              </p>
            )}
          </Card>
          {/* Project Attachments */}
<AttachmentsPanel
  scope="project"
  targetId={project._id}
/>
          {/* Project Tasks */}
          <Card>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">Project Tasks</h3>

              <Badge>{project.tasks.length} Tasks</Badge>
            </div>

            {project.tasks.length === 0 ? (
              <EmptyState
                title="No tasks yet"
                description="No tasks have been added to this project yet."
                icon={ListTodo}
              />
            ) : (
              <div className="mt-5 divide-y divide-slate-100">
                {project.tasks.map((task) => (
                  <div key={task._id} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <Link
                          to={`/tasks/${task._id}`}
                          className="text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:underline"
                        >
                          {task.title}
                        </Link>

                        <p className="mt-1 text-xs text-slate-500">
                          Assigned to: {task.assignedTo.name}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={getTaskStatusVariant(task.status)}>
                          {formatTaskStatus(task.status)}
                        </Badge>

                        <Badge>
                          {task.priority.charAt(0).toUpperCase() +
                            task.priority.slice(1)}
                        </Badge>
                      </div>
                    </div>

                    <p className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                      <CalendarDays size={14} />
                      Due: {formatDate(task.dueDate)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Project Details */}
        <div>
          <Card>
            <h3 className="font-semibold text-slate-900">Project Details</h3>

            <div className="mt-5 space-y-5">
              <div>
                <p className="text-xs text-slate-500">Workspace</p>

                <p className="mt-1 text-sm font-medium text-slate-900">
                  {project.workspace.name}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">Created By</p>

                <div className="mt-1 flex items-start gap-2">
                  <UserRound size={16} className="mt-0.5 text-slate-400" />

                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {project.createdBy.name}
                    </p>

                    <p className="text-xs text-slate-500">
                      {project.createdBy.email}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs text-slate-500">Created Date</p>

                <p className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-900">
                  <CalendarDays size={16} className="text-slate-400" />
                  {formatDate(project.createdAt)}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">Total Tasks</p>

                <p className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-900">
                  <ListTodo size={16} className="text-slate-400" />
                  {project.tasks.length}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Edit Project Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-4 shadow-xl sm:p-6">
            <h2 className="mb-5 text-lg font-semibold text-slate-900">
              Edit Project
            </h2>

            <form onSubmit={handleUpdateProject} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Project Name
                </label>

                <input
                  value={formData.name}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      name: event.target.value,
                    })
                  }
                  minLength={2}
                  maxLength={100}
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Description
                </label>

                <textarea
                  value={formData.description}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      description: event.target.value,
                    })
                  }
                  maxLength={1000}
                  rows={3}
                  className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Project Status
                </label>

                <select
                  value={formData.status}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      status: event.target.value as ProjectDetails["status"],
                    })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="planning">Planning</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              {canManageWorkspace && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Select Workspace
                  </label>

                  <select
                    value={formData.workspaceId}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        workspaceId: event.target.value,
                      })
                    }
                    required
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  >
                    {eligibleTargetWorkspaces.map((workspace) => (
                      <option key={workspace._id} value={workspace._id}>
                        {workspace.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {actionError && (
                <p className="text-sm text-red-600">{actionError}</p>
              )}

              <div className="flex flex-col-reverse justify-end gap-3 pt-2 sm:flex-row">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setIsEditOpen(false)}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 disabled:opacity-50 sm:w-auto"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 sm:w-auto"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Project Modal */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-4 shadow-xl sm:p-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Delete Project
            </h2>

            <p className="mt-2 text-sm text-slate-600">
              Are you sure you want to delete this project? All tasks belonging
              to this project will also be deleted. This action cannot be
              undone.
            </p>

            {actionError && (
              <p className="mt-3 text-sm text-red-600">{actionError}</p>
            )}

            <div className="mt-6 flex flex-col-reverse justify-end gap-3 pt-2 sm:flex-row">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setIsDeleteOpen(false)}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 disabled:opacity-50 sm:w-auto"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteProject}
                className="w-full rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 sm:w-auto"
              >
                {deleting ? "Deleting..." : "Delete Project"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectOverviewPage;
