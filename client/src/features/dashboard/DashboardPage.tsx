import {
  FolderKanban,
  ListTodo,
  CheckCircle2,
  Clock,
} from 'lucide-react'

import StatCard from './components/StatCard'
import RecentProjects from './components/RecentProjects'
import RecentActivity from './components/RecentActivity'
import PageHeader from '../../components/ui/PageHeader'
import Button from '../../components/ui/Button'

const stats = [
  {
    title: 'Total Projects',
    value: 12,
    description: 'Projects in your workspace',
    icon: FolderKanban,
  },
  {
    title: 'Total Tasks',
    value: 48,
    description: 'Tasks across all projects',
    icon: ListTodo,
  },
  {
    title: 'Completed Tasks',
    value: 32,
    description: 'Tasks successfully completed',
    icon: CheckCircle2,
  },
  {
    title: 'Pending Tasks',
    value: 16,
    description: 'Tasks waiting for completion',
    icon: Clock,
  },
]

function DashboardPage() {
  return (
    <div>
<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
  <PageHeader
    title="Dashboard"
    description="Welcome back! Here's what's happening with your workspace."
  />

  <Button>
    Create Project
  </Button>
</div>

      {/* Stats Cards */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            description={stat.description}
            icon={stat.icon}
          />
        ))}
      </div>

        <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
            <RecentProjects />
            <RecentActivity />
        </div>

    </div>
  )
}

export default DashboardPage