import Badge from '../../../components/ui/Badge'
import Card from '../../../components/ui/Card'
const projects = [
  {
    name: 'Website Redesign',
    description: 'Redesign the company website',
    status: 'In Progress',
    progress: 65,
  },
  {
    name: 'Mobile App Development',
    description: 'Build a mobile application',
    status: 'In Progress',
    progress: 40,
  },
  {
    name: 'Marketing Campaign',
    description: 'Prepare the marketing campaign',
    status: 'Completed',
    progress: 100,
  },
]

function RecentProjects() {
  return (
    <Card>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">
          Recent Projects
        </h2>

        <span className="text-sm font-medium text-indigo-600">
          View All
        </span>
      </div>

      <div className="space-y-6">
        {projects.map((project) => (
          <div key={project.name}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-800">
                  {project.name}
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  {project.description}
                </p>
              </div>

            <Badge
                variant={project.status === 'Completed' ? 'success' : 'warning'}
                >
                    {project.status}
            </Badge>
            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-indigo-600"
                style={{ width: `${project.progress}%` }}
              />
            </div>

            <p className="mt-1 text-right text-xs text-slate-500">
              {project.progress}%
            </p>
          </div>
        ))}
      </div>
    </Card>
  )
}

export default RecentProjects