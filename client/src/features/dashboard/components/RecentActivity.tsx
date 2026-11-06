import Card from '../../../components/ui/Card'

const activities = [
  {
    user: 'Alex Morgan',
    action: 'created a new project',
    target: 'Website Redesign',
    time: '10 minutes ago',
  },
  {
    user: 'Sarah Wilson',
    action: 'completed a task',
    target: 'Design Homepage',
    time: '1 hour ago',
  },
  {
    user: 'John Smith',
    action: 'added a new task',
    target: 'API Integration',
    time: '3 hours ago',
  },
]

function RecentActivity() {
  return (
    <Card >
      <h2 className="mb-6 text-lg font-semibold text-slate-900">
        Recent Activity
      </h2>

      <div className="space-y-5">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-600">
              {activity.user.charAt(0)}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm text-slate-700">
                <span className="font-semibold text-slate-900">
                  {activity.user}
                </span>{' '}
                {activity.action}{' '}
                <span className="font-medium text-indigo-600">
                  {activity.target}
                </span>
              </p>

              <p className="mt-1 text-xs text-slate-400">
                {activity.time}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

export default RecentActivity