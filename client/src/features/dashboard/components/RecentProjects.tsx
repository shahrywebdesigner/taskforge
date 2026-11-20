
import { Link } from 'react-router'
import { FolderKanban } from 'lucide-react'

import Badge from '../../../components/ui/Badge'
import Card from '../../../components/ui/Card'
import type { DashboardProject } from '../dashboard.api'

interface Props {
  projects: DashboardProject[]
}

function RecentProjects({ projects }: Props) {
  return (
    <Card>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">
          Recent Projects
        </h2>

        <Link
          to="/projects"
          className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          View All
        </Link>
      </div>

      {projects.length === 0 ? (
        <p className="text-sm text-slate-500">
          No projects available yet.
        </p>
      ) : (
        <div className="space-y-5">
          {projects.map((project) => (
            <Link
              key={project._id}
              to={`/projects/${project._id}`}
              className="block rounded-lg transition hover:bg-slate-50"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
                    <FolderKanban size={18} />
                  </div>

                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold text-slate-800">
                      {project.name}
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      {project.workspace?.name || 'Workspace'}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {project.description || 'No description provided.'}
                    </p>
                  </div>
                </div>

                <Badge
                  variant={
                    project.status === 'completed' ? 'success' : 'warning'
                  }
                >
                  {project.status.charAt(0).toUpperCase() +
                    project.status.slice(1)}
                </Badge>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Card>
  )
}

export default RecentProjects
