
import {CheckCircle2, FolderKanban, MessageSquare } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'

const notifications = [
  {
    title: 'Project updated',
    description: 'Alex Morgan updated Website Redesign.',
    time: '10 minutes ago',
    icon: FolderKanban,
  },
  {
    title: 'Task completed',
    description: 'Sarah Wilson completed Design Homepage.',
    time: '1 hour ago',
    icon: CheckCircle2,
  },
  {
    title: 'New comment',
    description: 'John Smith commented on API Integration.',
    time: '3 hours ago',
    icon: MessageSquare,
  },
]

function NotificationsPage() {
  return (
    <div>
      <PageHeader
        title="Notifications"
        description="Stay updated with your workspace activity."
      />

      <div className="mt-6 space-y-4">
        {notifications.map((notification, index) => {
          const Icon = notification.icon

          return (
            <Card key={index}>
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-indigo-50 p-3 text-indigo-600">
                  <Icon size={20} />
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900">
                    {notification.title}
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    {notification.description}
                  </p>

                  <p className="mt-2 text-xs text-slate-400">
                    {notification.time}
                  </p>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

export default NotificationsPage
