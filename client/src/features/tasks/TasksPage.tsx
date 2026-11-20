import { useEffect, useState } from "react";
import { CalendarDays, ListTodo, Plus, X } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import { getMyTasks, createTask, type Task } from "./task.api";
import {
  getWorkspaces,
  getWorkspaceMembers,
} from "../workspaces/workspace.api";
import { getWorkspaceProjects, getProjectById } from "../projects/project.api";
import { Link } from "react-router";
import EmptyState from "../../components/ui/EmptyState";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import ErrorMessage from "../../components/ui/ErrorMessage";

interface Workspace {
  _id: string;
  name: string;
  isProActive: boolean;
}

interface Project {
  _id: string;
  name: string;
  workspaceId: string;
  workspaceName: string;
  canManageTasks: boolean;
}

interface Member {
  _id: string;
  name: string;
  email: string;
  role: "Owner" | "Admin" | "Member";
}

interface TaskForm {
  title: string;
  description: string;
  projectId: string;
  assignedTo: string;
  status: Task["status"];
  priority: Task["priority"];
  dueDate: string;
}

function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [form, setForm] = useState<TaskForm>({
    title: "",
    description: "",
    projectId: "",
    assignedTo: "",
    status: "todo",
    priority: "medium",
    dueDate: "",
  });

  const canCreateTasks = projects.length > 0;

  const fetchTasks = async () => {
    try {
      const data = await getMyTasks();
      setTasks(data);
      setError("");
    } catch {
      setError("Failed to load tasks. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;

    getMyTasks()
      .then((data) => {
        if (!ignore) {
          setTasks(data);
          setError("");
        }
      })
      .catch(() => {
        if (!ignore) {
          setError("Failed to load tasks. Please try again.");
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
  }, []);

  useEffect(() => {
    let ignore = false;

    const loadCreatableProjects = async () => {
      try {
        const workspaceResponse = await getWorkspaces();
        const workspaces: Workspace[] = workspaceResponse.data;

        const projectGroups = await Promise.all(
          workspaces
            .filter((workspace) => workspace.isProActive === true)
            .map(async (workspace) => {
              const response = await getWorkspaceProjects(workspace._id);
              const workspaceProjects = response.data;

              return Promise.all(
                workspaceProjects.map(
                  async (project: { _id: string; name: string }) => {
                    const detail = await getProjectById(project._id);
                    return {
                      _id: project._id,
                      name: project.name,
                      workspaceId: workspace._id,
                      workspaceName: workspace.name,
                      canManageTasks:
                        detail.permissions?.canManageTasks === true,
                    };
                  },
                ),
              );
            }),
        );

        if (!ignore) {
          const eligibleProjects = projectGroups
            .flat()
            .filter((project) => project.canManageTasks);

          setProjects(eligibleProjects);
        }
      } catch {
        if (!ignore) {
          setError("Failed to load projects and permissions.");
        }
      } finally {
        if (!ignore) {
          setProjectsLoading(false);
        }
      }
    };

    loadCreatableProjects();

    return () => {
      ignore = true;
    };
  }, []);
  useEffect(() => {
    const selectedProject = projects.find(
      (project) => project._id === form.projectId,
    );

    if (!selectedProject) {
      return;
    }

    let ignore = false;

    const loadMembers = async () => {
      try {
        setMembersLoading(true);

        const response = await getWorkspaceMembers(selectedProject.workspaceId);

        if (!ignore) {
          setMembers(response.data);
        }
      } catch {
        if (!ignore) {
          setMembers([]);
          setError("Unable to load workspace members.");
        }
      } finally {
        if (!ignore) {
          setMembersLoading(false);
        }
      }
    };

    loadMembers();

    return () => {
      ignore = true;
    };
  }, [form.projectId, projects]);

  const handleCreateTask = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const selectedProject = projects.find(
      (project) => project._id === form.projectId,
    );

    if (!selectedProject?.canManageTasks) {
      setError("You do not have permission to create tasks in this project.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      await createTask({
        title: form.title,
        description: form.description || undefined,
        projectId: form.projectId,
        assignedTo: form.assignedTo || undefined,
        status: form.status,
        priority: form.priority,
        dueDate: form.dueDate || undefined,
      });

      await fetchTasks();

      setForm({
        title: "",
        description: "",
        projectId: "",
        assignedTo: "",
        status: "todo",
        priority: "medium",
        dueDate: "",
      });

      setIsModalOpen(false);
    } catch {
      setError("Failed to create task. Please try again.");
    } finally {
      setIsSubmitting(false);
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
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div>
      <PageHeader
        title="My Tasks"
        description="View and manage your assigned tasks."
      />

      {canCreateTasks && (
        <div className="mt-6 flex justify-stretch sm:justify-end">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex w-full justify-center sm:w-auto items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700"
          >
            <Plus size={18} />
            Create Task
          </button>
        </div>
      )}

      {error && (
        <div className="mt-4">
          <ErrorMessage message={error} />
        </div>
      )}

      <div className="mt-6 space-y-4">
        {loading ? (
          <LoadingSpinner message="Loading your tasks..." />
        ) : tasks.length === 0 ? (
          <EmptyState
            title="No tasks assigned"
            description="Tasks assigned to you will appear here."
            icon={ListTodo}
          />
        ) : (
          tasks.map((task) => (
            <Link key={task._id} to={`/tasks/${task._id}`} className="block">
              <Card>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
                      <ListTodo size={20} />
                    </div>

                    <div>
                      <h3 className="font-semibold text-slate-900">
                        {task.title}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        Project: {task.project.name}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Workspace: {task.workspace.name}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <CalendarDays size={14} />
                          Due: {formatDate(task.dueDate)}
                        </span>

                        <span>Priority: {task.priority}</span>
                      </div>
                    </div>
                  </div>

                  <Badge variant={getStatusVariant(task.status)}>
                    {formatStatus(task.status)}
                  </Badge>
                </div>
              </Card>
            </Link>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-3 sm:p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-4 shadow-xl sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                Create New Task
              </h2>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  minLength={2}
                  maxLength={150}
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Enter task title"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Describe your task"
                  rows={3}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Project
                </label>
                <select
                  required
                  value={form.projectId}
                  onChange={(e) =>
                    setForm({ ...form, projectId: e.target.value })
                  }
                  disabled={projectsLoading}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
                >
                  <option value="">
                    {projectsLoading
                      ? "Loading projects..."
                      : "Select a project"}
                  </option>

                  {projects.map((project) => (
                    <option key={project._id} value={project._id}>
                      {project.name} — {project.workspaceName}
                    </option>
                  ))}
                </select>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Assign To
                  </label>

                  <select
                    value={form.assignedTo}
                    onChange={(e) =>
                      setForm({ ...form, assignedTo: e.target.value })
                    }
                    disabled={!form.projectId || membersLoading}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
                  >
                    <option value="">
                      {membersLoading
                        ? "Loading members..."
                        : "Assign to yourself"}
                    </option>

                    {members.map((member) => (
                      <option key={member._id} value={member._id}>
                        {member.name} ({member.role}) — {member.email}
                      </option>
                    ))}
                  </select>

                  <p className="mt-1 text-xs text-slate-400">
                    Leave empty to assign this task to yourself.
                  </p>
                </div>

                {!projectsLoading && projects.length === 0 && (
                  <p className="mt-1 text-xs text-amber-600">
                    You do not have permission to create tasks in any available
                    project, or no active Pro workspace is available.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        status: e.target.value as Task["status"],
                      })
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="review">In Review</option>
                    <option value="done">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Priority
                  </label>
                  <select
                    value={form.priority}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        priority: e.target.value as Task["priority"],
                      })
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Due Date
                </label>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) =>
                    setForm({ ...form, dueDate: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-full sm:w-auto rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    projectsLoading ||
                    projects.length === 0 ||
                    !form.projectId
                  }
                  className="w-full sm:w-auto rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting ? "Creating..." : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default TasksPage;
