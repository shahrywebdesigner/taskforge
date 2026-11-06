
import { CalendarDays, ListTodo } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'

const tasks = [
  {
    title: 'Design Homepage',
    project: 'Website Redesign',
    dueDate: 'Nov 10, 2026',
    status: 'In Progress',
  },
  {
    title: 'Create Login API',
    project: 'Mobile App Development',
    dueDate: 'Nov 12, 2026',
    status: 'Pending',
  },
  {
    title: 'Prepare Marketing Content',
    project: 'Marketing Campaign',
    dueDate: 'Nov 08, 2026',
    status: 'Completed',
  },
]

function TasksPage() {
  return (
    <div>
      <PageHeader
        title="My Tasks"
        description="View and manage your assigned tasks."
      />

      <div className="mt-6 space-y-4">
        {tasks.map((task) => (
          <Card key={task.title}>
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
                    {task.project}
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                    <CalendarDays size={14} />
                    Due: {task.dueDate}
                  </div>
                </div>
              </div>

              <Badge
                variant={
                  task.status === 'Completed'
                    ? 'success'
                    : task.status === 'Pending'
                      ? 'warning'
                      : 'default'
                }
              >
                {task.status}
              </Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default TasksPage
