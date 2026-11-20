
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
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
import {
  getDashboardData,
  type DashboardData,
} from './dashboard.api'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import ErrorMessage from '../../components/ui/ErrorMessage'

const initialData: DashboardData = {
  stats: {
    totalProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
  },
  recentProjects: [],
  recentActivity: [],
}

function DashboardPage() {
  const navigate = useNavigate()

  const [dashboard, setDashboard] = useState(initialData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isActive = true

    const fetchDashboard = async () => {
      try {
        const data = await getDashboardData()

        if (isActive) {
          setDashboard(data)
        }
      } catch {
        if (isActive) {
          setError('Unable to load dashboard data.')
        }
      } finally {
        if (isActive) {
          setLoading(false)
        }
      }
    }

    fetchDashboard()

    return () => {
      isActive = false
    }
  }, [])

  const stats = [
    {
      title: 'Total Projects',
      value: dashboard.stats.totalProjects,
      description: 'Projects across your workspaces',
      icon: FolderKanban,
    },
    {
      title: 'Total Tasks',
      value: dashboard.stats.totalTasks,
      description: 'Tasks assigned to you',
      icon: ListTodo,
    },
    {
      title: 'Completed Tasks',
      value: dashboard.stats.completedTasks,
      description: 'Your completed tasks',
      icon: CheckCircle2,
    },
    {
      title: 'Pending Tasks',
      value: dashboard.stats.pendingTasks,
      description: 'Tasks awaiting completion',
      icon: Clock,
    },
  ]

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Dashboard"
          description="Welcome back! Here's what's happening with your workspace."
        />

        <Button onClick={() => navigate('/projects?create=1')}>
          Create Project
        </Button>
      </div>

{error && (
  <div className="mt-5">
    <ErrorMessage message={error} />
  </div>
)}

{loading ? (
  <div className="mt-8">
    <LoadingSpinner message="Loading dashboard..." />
  </div>
) : (
  <>
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
      <RecentProjects projects={dashboard.recentProjects} />
      <RecentActivity activities={dashboard.recentActivity} />
    </div>
  </>
)}
    </div>
  )
}

export default DashboardPage
