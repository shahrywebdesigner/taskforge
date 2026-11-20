import { useEffect, useState } from "react";
import { FolderKanban, Plus, X, BriefcaseBusiness } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import { createProject, getWorkspaceProjects } from "./project.api";
import { getWorkspaces } from "../workspaces/workspace.api";
import { useWorkspace } from "../workspaces/useWorkspace";
import { Link, useLocation, useNavigate } from "react-router";
import EmptyState from "../../components/ui/EmptyState";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import ErrorMessage from "../../components/ui/ErrorMessage";

interface Project {
  _id: string;
  name: string;
  description?: string;
  status: "planning" | "active" | "completed";
}

interface Workspace {
  _id: string;
  name: string;
  isProActive: boolean;
  permissions?: {
    isOwner: boolean;
    isAdmin: boolean;
    canManageWorkspace: boolean;
  };
}

interface ProjectWithWorkspace extends Project {
  workspaceId: string;
  workspaceName: string;
}

function ProjectsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedWorkspaceId } = useWorkspace();
  const [projects, setProjects] = useState<ProjectWithWorkspace[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<Project["status"]>("planning");
  const [projectWorkspaceId, setProjectWorkspaceId] = useState("");

  const eligibleWorkspaces = workspaces.filter(
    (workspace) =>
      workspace.isProActive === true &&
      workspace.permissions?.canManageWorkspace === true,
  );

  const canOpenCreateModal = eligibleWorkspaces.length > 0;

  useEffect(() => {
    let isActive = true;

    const fetchAllProjects = async () => {
      try {
        setLoading(true);
        setError("");

        const workspaceResponse = await getWorkspaces();
        const workspaceList: Workspace[] = workspaceResponse.data;

        if (isActive) {
          setWorkspaces(workspaceList);
        }
        const shouldOpenCreateModal =
          new URLSearchParams(location.search).get("create") === "1";

        if (shouldOpenCreateModal) {
          const eligible = workspaceList.filter(
            (workspace) =>
              workspace.isProActive === true &&
              workspace.permissions?.canManageWorkspace === true,
          );

          if (eligible.length > 0) {
            const defaultWorkspace =
              eligible.find(
                (workspace) => workspace._id === selectedWorkspaceId,
              ) || eligible[0];

            setProjectWorkspaceId(defaultWorkspace._id);
            setIsModalOpen(true);
          }

          navigate("/projects", { replace: true });
        }

        const projectResults = await Promise.allSettled(
          workspaceList.map(async (workspace) => {
            const response = await getWorkspaceProjects(workspace._id);

            return (response.data as Project[]).map((project) => ({
              ...project,
              workspaceId: workspace._id,
              workspaceName: workspace.name,
            }));
          }),
        );

        const loadedProjects = projectResults.flatMap((result) =>
          result.status === "fulfilled" ? result.value : [],
        );

        const failedRequests = projectResults.filter(
          (result) => result.status === "rejected",
        ).length;

        if (isActive) {
          setProjects(loadedProjects);

          if (failedRequests > 0) {
            setError(
              `${failedRequests} workspace(s) projects could not be loaded.`,
            );
          }
        }
      } catch {
        if (isActive) {
          setError("Unable to load projects.");
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchAllProjects();

    return () => {
      isActive = false;
    };
  }, [location.search, navigate, selectedWorkspaceId]);

  const handleCreateProject = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const selectedWorkspace = eligibleWorkspaces.find(
      (workspace) => workspace._id === projectWorkspaceId,
    );

    if (!selectedWorkspace) {
      setError(
        "You need workspace Owner/Admin permission and an active workspace Pro subscription to create a project.",
      );
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const response = await createProject({
        name,
        description,
        workspaceId: projectWorkspaceId,
        status,
      });

      const newProject: ProjectWithWorkspace = {
        ...response.data,
        workspaceId: selectedWorkspace._id,
        workspaceName: selectedWorkspace.name,
      };

      setProjects((previous) => [newProject, ...previous]);

      setName("");
      setDescription("");
      setStatus("planning");
      setProjectWorkspaceId("");
      setIsModalOpen(false);
    } catch {
      setError("Unable to create project. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Projects"
        description="View and manage all projects across your workspaces."
      />

      <div className="mt-6 flex justify-end">
        {canOpenCreateModal && (
          <Button
            onClick={() => {
              const defaultWorkspace =
                eligibleWorkspaces.find(
                  (workspace) => workspace._id === selectedWorkspaceId,
                ) || eligibleWorkspaces[0];

              setProjectWorkspaceId(defaultWorkspace._id);
              setIsModalOpen(true);
            }}
          >
            <Plus size={18} />
            Create Project
          </Button>
        )}
      </div>

      {error && (
        <div className="mt-5">
          <ErrorMessage message={error} />
        </div>
      )}

      {loading ? (
        <div className="mt-6">
          <LoadingSpinner message="Loading projects..." />
        </div>
      ) : projects.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="No projects found"
            description="Create a project in one of your eligible workspaces to get started."
            icon={FolderKanban}
            action={
              canOpenCreateModal ? (
                <Button
                  onClick={() => {
                    const defaultWorkspace =
                      eligibleWorkspaces.find(
                        (workspace) => workspace._id === selectedWorkspaceId,
                      ) || eligibleWorkspaces[0];

                    setProjectWorkspaceId(defaultWorkspace._id);
                    setIsModalOpen(true);
                  }}
                >
                  <Plus size={18} />
                  Create Project
                </Button>
              ) : (
                <Link
                  to="/workspaces"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                >
                  View Workspaces
                </Link>
              )
            }
          />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <Link
              key={project._id}
              to={`/projects/${project._id}`}
              className="block"
            >
              <Card>
                <div className="flex items-start justify-between">
                  <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
                    <FolderKanban size={20} />
                  </div>

                  <Badge
                    variant={
                      project.status === "completed" ? "success" : "warning"
                    }
                  >
                    {project.status.charAt(0).toUpperCase() +
                      project.status.slice(1)}
                  </Badge>
                </div>

                <h2 className="mt-4 font-semibold text-slate-900">
                  {project.name}
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  {project.description || "No description provided."}
                </p>

                <div className="mt-5 border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <BriefcaseBusiness size={16} className="text-indigo-500" />
                    <span>
                      Workspace: <strong>{project.workspaceName}</strong>
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                Create New Project
              </h2>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Project Name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Enter project name"
                  minLength={2}
                  maxLength={100}
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Describe your project"
                  maxLength={1000}
                  rows={3}
                  className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Project Status
                </label>

                <select
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value as Project["status"])
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                >
                  <option value="planning">Planning</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Select Workspace
                </label>

                <select
                  value={projectWorkspaceId}
                  onChange={(event) =>
                    setProjectWorkspaceId(event.target.value)
                  }
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                >
                  <option value="">Select a workspace</option>

                  {eligibleWorkspaces.map((workspace) => (
                    <option key={workspace._id} value={workspace._id}>
                      {workspace.name}
                    </option>
                  ))}
                </select>

                {eligibleWorkspaces.length === 0 && (
                  <p className="mt-1 text-xs text-amber-600">
                    You need an active Pro workspace and Owner/Admin access to
                    create projects.
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting || !projectWorkspaceId}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? "Creating..." : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectsPage;
