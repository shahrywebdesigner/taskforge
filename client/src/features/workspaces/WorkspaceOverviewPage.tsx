import { useEffect, useState, type FormEvent } from "react";
import { useParams, useNavigate } from "react-router";
import { useWorkspace } from "./useWorkspace";
import {
  ArrowLeft,
  BriefcaseBusiness,
  FolderKanban,
  UserRound,
  CalendarDays,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

import EmptyState from "../../components/ui/EmptyState";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import ErrorMessage from "../../components/ui/ErrorMessage";

import {
  getWorkspaces,
  updateWorkspace,
  deleteWorkspace,
} from "./workspace.api";

import Card from "../../components/ui/Card";
import PageHeader from "../../components/ui/PageHeader";

interface Workspace {
  _id: string;
  name: string;
  description?: string;
  createdAt: string;
  isProActive: boolean;
  owner: {
    _id: string;
    name: string;
  };
  projects: {
    _id: string;
    name: string;
  }[];
  permissions?: {
    isOwner: boolean;
    isAdmin: boolean;
    canManageWorkspace: boolean;
  };
}

function WorkspaceOverviewPage() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const {
    selectedWorkspaceId,
    setSelectedWorkspaceId,
    setSelectedWorkspaceName,
  } = useWorkspace();

  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState("");

  // Fetch Workspace
  useEffect(() => {
    let isActive = true;

    const fetchWorkspace = async () => {
      try {
        const response = await getWorkspaces();

        const foundWorkspace = response.data.find(
          (item: Workspace) => item._id === workspaceId,
        );

        if (!isActive) return;

        if (!foundWorkspace) {
          setError("Workspace not found or access denied.");
          return;
        }

        setWorkspace(foundWorkspace);
      } catch {
        if (isActive) {
          setError("Unable to load workspace.");
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchWorkspace();

    return () => {
      isActive = false;
    };
  }, [workspaceId]);

  const canManageWorkspace =
    workspace?.isProActive === true &&
    workspace.permissions?.canManageWorkspace === true;

  // Open Edit Modal
  const openEditModal = () => {
    if (!workspace) return;

    setEditName(workspace.name);
    setEditDescription(workspace.description || "");
    setActionError("");
    setShowEditModal(true);
  };

  // Update Workspace
  const handleUpdateWorkspace = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      !workspace?.isProActive ||
      !workspace.permissions?.canManageWorkspace ||
      !workspaceId
    ) {
      return;
    }

    try {
      setSaving(true);
      setActionError("");

      await updateWorkspace(workspaceId, {
        name: editName.trim(),
        description: editDescription.trim(),
      });

      setWorkspace({
        ...workspace,
        name: editName.trim(),
        description: editDescription.trim(),
      });
      if (selectedWorkspaceId === workspaceId) {
        setSelectedWorkspaceName(editName.trim());
      }

      setShowEditModal(false);
    } catch {
      setActionError("Unable to update workspace. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Delete Workspace
  const handleDeleteWorkspace = async () => {
    if (!canManageWorkspace || !workspaceId) return;

    try {
      setDeleting(true);
      setActionError("");

      await deleteWorkspace(workspaceId);
      if (selectedWorkspaceId === workspaceId) {
        setSelectedWorkspaceId(null);
        setSelectedWorkspaceName(null);
      }

      navigate("/workspaces", { replace: true });
    } catch {
      setActionError("Unable to delete workspace. Please try again.");
      setDeleting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading workspace..." fullPage />;
  }

  if (error || !workspace) {
    return (
      <div className="space-y-4">
        <ErrorMessage message={error || "Workspace not found."} />

        <button
          onClick={() => navigate("/workspaces")}
          className="text-sm font-medium text-indigo-600"
        >
          Back to Workspaces
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate("/workspaces")}
        className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
      >
        <ArrowLeft size={17} />
        All Workspaces
      </button>

      {/* Workspace Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <PageHeader
          title={workspace.name}
          description={workspace.description || "No description provided."}
        />

        {canManageWorkspace && (
          <div className="flex gap-2">
            <button
              onClick={openEditModal}
              className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <Pencil size={16} />
              Edit
            </button>

            <button
              onClick={() => {
                setActionError("");
                setShowDeleteModal(true);
              }}
              className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
            >
              <Trash2 size={16} />
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Read-only Notice */}
      {!workspace.isProActive && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="font-medium text-amber-800">
            This workspace is read-only
          </p>

          <p className="mt-1 text-sm text-amber-700">
            The workspace owner's Pro subscription has expired. The workspace
            and its projects remain available for viewing. The owner must renew
            Pro to restore management permissions.
          </p>
        </div>
      )}

      {actionError && !showEditModal && !showDeleteModal && (
        <p className="text-sm text-red-500">{actionError}</p>
      )}

      {/* Workspace Statistics */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <Card>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-indigo-50 p-3 text-indigo-600">
              <FolderKanban size={22} />
            </div>

            <div>
              <p className="text-sm text-slate-500">Total Projects</p>
              <h3 className="text-2xl font-semibold text-slate-900">
                {workspace.projects.length}
              </h3>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-indigo-50 p-3 text-indigo-600">
              <UserRound size={22} />
            </div>

            <div>
              <p className="text-sm text-slate-500">Created By</p>
              <h3 className="font-semibold text-slate-900">
                {workspace.owner?.name || "Unknown"}
              </h3>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-indigo-50 p-3 text-indigo-600">
              <CalendarDays size={22} />
            </div>

            <div>
              <p className="text-sm text-slate-500">Created On</p>
              <h3 className="font-semibold text-slate-900">
                {new Date(workspace.createdAt).toLocaleDateString()}
              </h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Projects Section */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Projects</h2>

        {workspace.projects.length === 0 ? (
          <EmptyState
            title="No projects yet"
            description="This workspace does not have any projects yet."
            icon={FolderKanban}
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {workspace.projects.map((project) => (
              <Card key={project._id}>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
                    <BriefcaseBusiness size={20} />
                  </div>

                  <h3 className="font-semibold text-slate-900">
                    {project.name}
                  </h3>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Edit Workspace Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                Edit Workspace
              </h2>

              <button
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateWorkspace} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Workspace Name
                </label>

                <input
                  type="text"
                  value={editName}
                  onChange={(event) => setEditName(event.target.value)}
                  minLength={2}
                  maxLength={50}
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Description
                </label>

                <textarea
                  value={editDescription}
                  onChange={(event) => setEditDescription(event.target.value)}
                  maxLength={500}
                  rows={4}
                  className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                />
              </div>

              {actionError && (
                <p className="text-sm text-red-500">{actionError}</p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  disabled={saving}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving || editName.trim().length < 2}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Workspace Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                Delete Workspace?
              </h2>

              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-sm leading-6 text-slate-600">
              Are you sure you want to delete <strong>{workspace.name}</strong>?
              All projects and tasks inside this workspace will also be
              permanently deleted. This action cannot be undone.
            </p>

            {actionError && (
              <p className="mt-3 text-sm text-red-500">{actionError}</p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                onClick={handleDeleteWorkspace}
                disabled={deleting}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Delete Workspace"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WorkspaceOverviewPage;
