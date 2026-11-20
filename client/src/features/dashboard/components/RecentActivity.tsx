
import Card from '../../../components/ui/Card'
import type { DashboardActivity } from '../dashboard.api'

interface Props {
  activities: DashboardActivity[]
}

const getTimeAgo = (date: string) => {
  const seconds = Math.floor(
    (Date.now() - new Date(date).getTime()) / 1000
  )

  if (!Number.isFinite(seconds)) return 'Recently'

  if (seconds < 60) return 'Just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`

  return new Date(date).toLocaleDateString()
}

function RecentActivity({ activities }: Props) {
  return (
    <Card>
      <h2 className="mb-6 text-lg font-semibold text-slate-900">
        Recent Activity
      </h2>

      {activities.length === 0 ? (
        <p className="text-sm text-slate-500">
          No recent activity available.
        </p>
      ) : (
        <div className="space-y-5">
          {activities.map((activity) => (
            <div key={activity._id} className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-600">
                {activity.actor?.name?.charAt(0).toUpperCase() || 'T'}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900">
                  {activity.actor?.name || 'TaskForge'}
                </p>

                <p className="mt-1 text-sm text-slate-700">
                  {activity.title}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {activity.message}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  {getTimeAgo(activity.createdAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

export default RecentActivity
