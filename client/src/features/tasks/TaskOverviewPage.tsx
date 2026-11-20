import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  CalendarDays,
  FolderKanban,
  ListTodo,
  Pencil,
  Trash2,
} from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import ErrorMessage from "../../components/ui/ErrorMessage";
import {
  getMyTaskById,
  updateTask,
  deleteTask,
  type Task,
  type TaskDetails,
  type TaskPermissions,
  type TaskMember,
} from "./task.api";
import TaskComments from "./components/TaskComments";
import { getWorkspaceMembers } from "../workspaces/workspace.api";
import AttachmentsPanel from '../attachments/AttachmentsPanel'

function TaskOverviewPage() {
  const { taskId } = useParams();
  const [task, setTask] = useState<TaskDetails | null>(null);
  const [permissions, setPermissions] = useState<TaskPermissions | null>(null);
  const [members, setMembers] = useState<TaskMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const isInvalidTaskId = !taskId;
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState("");

  const [formData, setFormData] = useState({
  title: "",
  description: "",
  assignedTo: "",
  status: "todo" as Task["status"],
  priority: "medium" as Task["priority"],
  dueDate: "",
});

  const navigate = useNavigate();

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    if (!taskId) return;

    let ignore = false;

    getMyTaskById(taskId)
      .then((data) => {
        if (!ignore) {
          setTask(data.task);
          setPermissions(data.permissions);
          setError("");
        }
      })
      .catch(() => {
        if (!ignore) {
          setError("Task not found or you do not have access to it.");
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
  }, [taskId]);

const openEditModal = async () => {
  if (!task) return;

  setFormData({
    title: task.title,
    description: task.description || "",
    assignedTo: task.assignedTo._id,
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate ? task.dueDate.slice(0, 10) : "",
  });

  setEditError("");
  setIsEditOpen(true);

  if (!permissions?.canManageTasks) return;

  try {
    setMembersLoading(true);

    const response = await getWorkspaceMembers(task.workspace._id);

    setMembers(response.data);
  } catch {
    setEditError("Unable to load workspace members.");
  } finally {
    setMembersLoading(false);
  }
};

  const handleUpdateTask = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!taskId || !permissions?.canEditTask) return;

    try {
      setSaving(true);
      setEditError("");

      await updateTask(taskId, {
  title: formData.title,
  description: formData.description,
  ...(permissions.canManageTasks
    ? { assignedTo: formData.assignedTo }
    : {}),
  status: formData.status,
  priority: formData.priority,
  dueDate: formData.dueDate,
});

      const updatedData = await getMyTaskById(taskId);

      setTask(updatedData.task);
      setPermissions(updatedData.permissions);
      setIsEditOpen(false);
    } catch {
      setEditError("Unable to update task. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!taskId || !permissions?.canDeleteTask) return;

    try {
      setDeleting(true);
      setDeleteError("");

      await deleteTask(taskId);

      navigate("/tasks");
    } catch {
      setDeleteError("Unable to delete task. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const formatStatus = (status: Task["status"]) => {
    const labels: Record<Task["status"], string> = {
      todo: "To Do",
      "in-progress": "In Progress",
      review: "In Review",
      done: "Completed",
    };

    return labels[status];
  };

  const getStatusVariant = (status: Task["status"]) => {
    if (status === "done") return "success";
    if (status === "todo") return "warning";
    return "default";
  };

  const formatDate = (date?: string) => {
    if (!date) return "No due date";

    return new Date(date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };
  if (isInvalidTaskId) {
    return (
      <Card>
        <p className="text-sm text-red-500">Invalid task ID.</p>
        <Link to="/tasks" className="mt-3 inline-block text-sm text-indigo-600">
          Back to My Tasks
        </Link>
      </Card>
    );
  }

  if (loading) {
    return (
      <LoadingSpinner
        message="Loading task details..."
        fullPage
      />
    );
  }

  if (error || !task) {
    return (
      <div>
        <Link
          to="/tasks"
          className="mb-5 inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700"
        >
          <ArrowLeft size={16} />
          Back to My Tasks
        </Link>

                <Card>
          <ErrorMessage message={error || "Task not found."} />
        </Card>
      </div>
    );
  }

  return (
    <div>
      <Link
        to="/tasks"
        className="mb-5 inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700"
      >
        <ArrowLeft size={16} />
        Back to My Tasks
      </Link>

      <PageHeader
        title="Task Overview"
        description="View complete information about this task."
      />
            <div className="mb-5 flex flex-wrap justify-end gap-3">
        {permissions?.canEditTask && (
          <button
            type="button"
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 sm:w-auto"
            onClick={openEditModal}
          >
            <Pencil size={16} />
            Edit Task
          </button>
        )}

        {permissions?.canDeleteTask && (
          <button
            type="button"
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 sm:w-auto"
            onClick={() => {
              setDeleteError("");
              setIsDeleteOpen(true);
            }}
          >
            <Trash2 size={16} />
            Delete Task
          </button>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-indigo-50 p-3 text-indigo-600">
                <ListTodo size={24} />
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="text-xl font-semibold text-slate-900">
                  {task.title}
                </h2>

                <div className="mt-3">
                  <Badge variant={getStatusVariant(task.status)}>
                    {formatStatus(task.status)}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-slate-100 pt-5">
              <h3 className="text-sm font-semibold text-slate-900">
                Description
              </h3>

              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                {task.description || "No description provided."}
              </p>
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold text-slate-900">
              Project Information
            </h3>

            <div className="mt-4 flex items-center gap-3">
              <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                <FolderKanban size={20} />
              </div>

              <div>
                <Link
                  to={`/projects/${task.project._id}`}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:underline"
                >
                  {task.project.name}
                </Link>
                <p className="text-xs text-slate-500">{task.workspace.name}</p>
              </div>
            </div>
          </Card>
        </div>

        <div>
          <Card>
            <h3 className="font-semibold text-slate-900">Task Details</h3>

            <div className="mt-5 space-y-5">
              <div>
                <p className="text-xs text-slate-500">Priority</p>
                <p className="mt-1 text-sm font-medium capitalize text-slate-900">
                  {task.priority}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">Due Date</p>
                <p className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-900">
                  <CalendarDays size={16} className="text-slate-400" />
                  {formatDate(task.dueDate)}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">Created</p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {formatDate(task.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Assigned To</p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {task.assignedTo.name}
                </p>
                <p className="text-xs text-slate-500">
                  {task.assignedTo.email}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">Created By</p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {task.createdBy.name}
                </p>
                <p className="text-xs text-slate-500">{task.createdBy.email}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
      <div className="mt-6 space-y-6">
  <TaskComments taskId={task._id} />

  <AttachmentsPanel
    scope="task"
    targetId={task._id}
  />
</div>
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-4 shadow-xl sm:p-6">
            <h2 className="text-lg font-semibold text-slate-900">Edit Task</h2>

            <p className="mt-1 text-sm text-slate-500">
              Update your task information.
            </p>

            <form onSubmit={handleUpdateTask} className="mt-5 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Task Title
                </label>
                <input
                  required
                  minLength={2}
                  maxLength={150}
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Description
                </label>
                <textarea
                  maxLength={2000}
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                />
              </div>
                  {permissions?.canManageTasks && (
  <div>
    <label className="mb-1 block text-sm font-medium text-slate-700">
      Assign To
    </label>

    <select
      value={formData.assignedTo}
      onChange={(e) =>
        setFormData({
          ...formData,
          assignedTo: e.target.value,
        })
      }
      disabled={membersLoading}
      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500"
    >
      <option value="">
        {membersLoading ? "Loading members..." : "Select a member"}
      </option>

      {!members.some((member) => member._id === task.assignedTo._id) && (
        <option value={task.assignedTo._id}>
          {task.assignedTo.name} — Current Assignee
        </option>
      )}

      {members.map((member) => (
        <option key={member._id} value={member._id}>
          {member.name} ({member.role || "Member"}) — {member.email}
        </option>
      ))}
    </select>
  </div>
)}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as Task["status"],
                    })
                  }
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="review">In Review</option>
                  <option value="done">Completed</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      priority: e.target.value as Task["priority"],
                    })
                  }
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Due Date
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData({ ...formData, dueDate: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </div>

              {editError && <p className="text-sm text-red-500">{editError}</p>}

                            <div className="flex flex-col-reverse justify-end gap-3 pt-2 sm:flex-row">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setIsEditOpen(false)}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 sm:w-auto"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 sm:w-auto"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-4 shadow-xl sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900">Delete Task</h2>

            <p className="mt-2 text-sm text-gray-600">
              Are you sure you want to delete this task? This action cannot be
              undone.
            </p>

            {deleteError && (
              <p className="mt-3 text-sm text-red-600">{deleteError}</p>
            )}

                        <div className="mt-6 flex flex-col-reverse justify-end gap-3 pt-2 sm:flex-row">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setIsDeleteOpen(false)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 sm:w-auto"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteTask}
                className="w-full rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 sm:w-auto"
              >
                {deleting ? "Deleting..." : "Delete Task"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TaskOverviewPage;
