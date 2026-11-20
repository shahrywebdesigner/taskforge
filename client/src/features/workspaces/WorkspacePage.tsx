
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import { ArrowLeft, BriefcaseBusiness, Crown } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import { createWorkspace } from "./workspace.api";
import { useAuth } from "../../features/auth/useAuth";

function WorkspacePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [workspaceName, setWorkspaceName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isPro = user?.isProActive === true;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await createWorkspace({
        name: workspaceName,
        description,
      });

      setSuccess("Workspace created successfully!");
      setWorkspaceName("");
      setDescription("");

      setTimeout(() => {
        navigate("/workspaces");
      }, 1000);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
            "Workspace creation failed. Please try again.",
        );
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600"
      >
        <ArrowLeft size={17} />
        Go Back
      </button>

      <PageHeader
        title="Create Workspace"
        description="Create a workspace to organize your team's projects and tasks."
      />

      {!isPro ? (
        <Card className="max-w-2xl">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Crown size={24} />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                Upgrade to Pro
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Creating and managing workspaces is a Pro feature. Upgrade
                your plan to create your own workspace and manage your team.
              </p>

              <button
                onClick={() => navigate("/billing")}
                className="mt-5 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700"
              >
                View Pro Plans
              </button>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="max-w-2xl">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <BriefcaseBusiness size={22} />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">
                Workspace Details
              </h2>
              <p className="text-sm text-slate-500">
                Enter your workspace information.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Workspace Name
              </label>
              <input
                type="text"
                required
                minLength={3}
                maxLength={50}
                value={workspaceName}
                onChange={(event) => setWorkspaceName(event.target.value)}
                placeholder="e.g. My Development Team"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Description
              </label>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="What is this workspace for?"
                rows={4}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}
              </p>
            )}

            {success && (
              <p className="rounded-lg bg-green-50 p-3 text-sm text-green-600">
                {success}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating..." : "Create Workspace"}
            </button>
          </form>
        </Card>
      )}
    </div>
  );
}

export default WorkspacePage;
