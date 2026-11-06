
import { createBrowserRouter, Navigate } from 'react-router'
import AppLayout from '../components/layout/AppLayout'
import DashboardPage from '../features/dashboard/DashboardPage'
import ProjectsPage from '../features/projects/ProjectsPage'
import TasksPage from '../features/tasks/TasksPage'
import MembersPage from '../features/members/MembersPage'
import NotificationsPage from '../features/notifications/NotificationsPage'
import BillingPage from '../features/billing/BillingPage'
import SettingsPage from '../features/settings/SettingsPage'
import WorkspacePage from '../features/workspaces/WorkspacePage'


const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'projects',
        element: <ProjectsPage />,
      },
      {
          path: 'tasks',
          element: <TasksPage />,
      },
      {
          path: 'members',
          element: <MembersPage />,
      },
      {
        path: 'notifications',
        element: <NotificationsPage />,
      },
      {
        path: 'billing',
          element: <BillingPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
      {
        path: 'workspaces/create',
        element: <WorkspacePage />,
      },
    ],
  },
])

export default router
