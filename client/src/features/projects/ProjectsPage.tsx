
import { FolderKanban, Plus } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'

const projects = [
  {
    name: 'Website Redesign',
    description: 'Redesign the company website and improve user experience.',
    status: 'In Progress',
    progress: 65,
  },
  {
    name: 'Mobile App Development',
    description: 'Build a responsive mobile application.',
    status: 'In Progress',
    progress: 40,
  },
  {
    name: 'Marketing Campaign',
    description: 'Plan and launch the marketing campaign.',
    status: 'Completed',
    progress: 100,
  },
]

function ProjectsPage() {
  return (
    <div>
      <PageHeader
        title="Projects"
        description="Manage and track all your team projects."
      />

      <div className="mt-6 flex justify-end">
        <Button>
          <Plus size={18} />
          Create Project
        </Button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((project) => (
          <Card key={project.name}>
            <div className="flex items-start justify-between">
              <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
                <FolderKanban size={20} />
              </div>

              <Badge
                variant={
                  project.status === 'Completed' ? 'success' : 'warning'
                }
              >
                {project.status}
              </Badge>
            </div>

            <h2 className="mt-4 font-semibold text-slate-900">
              {project.name}
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {project.description}
            </p>

            <div className="mt-5">
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-slate-500">Progress</span>
                <span className="font-medium text-slate-700">
                  {project.progress}%
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-indigo-600"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default ProjectsPage
