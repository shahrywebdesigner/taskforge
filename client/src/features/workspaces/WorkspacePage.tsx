
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { ArrowLeft, BriefcaseBusiness } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'

function WorkspacePage() {
  const navigate = useNavigate()
  const [workspaceName, setWorkspaceName] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    // Actual workspace creation will be connected to the backend later.
    alert('Workspace creation will be connected with the backend soon.')
  }

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

      <Card className="max-w-2xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <BriefcaseBusiness size={22} />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">Workspace Details</h2>
            <p className="text-sm text-slate-500">Enter your workspace information.</p>
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

          <button
            type="submit"
            className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700"
          >
            Create Workspace
          </button>
        </form>
      </Card>
    </div>
  )
}

export default WorkspacePage
