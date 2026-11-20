
import { createBrowserRouter } from "react-router";

import AppLayout from "../components/layout/AppLayout";
import HomePage from "../pages/HomePage";

import LoginPage from "../features/auth/pages/LoginPage";
import RegisterPage from "../features/auth/pages/RegisterPage";
import ProtectedRoute from "../features/auth/ProtectedRoute";
import GuestRoute from "../features/auth/GuestRoute";

import DashboardPage from "../features/dashboard/DashboardPage";
import ProjectsPage from "../features/projects/ProjectsPage";
import TasksPage from "../features/tasks/TasksPage";
import MembersPage from "../features/members/MembersPage";
import NotificationsPage from "../features/notifications/NotificationsPage";
import BillingPage from "../features/billing/BillingPage";
import SettingsPage from "../features/settings/SettingsPage";
import WorkspacePage from "../features/workspaces/WorkspacePage";
import WorkspacesPage from "../features/workspaces/WorkspacesPage";
import WorkspaceOverviewPage from "../features/workspaces/WorkspaceOverviewPage";
import TaskOverviewPage from "../features/tasks/TaskOverviewPage";
import ProjectOverviewPage from "../features/projects/ProjectOverviewPage";
import HelpSupportPage from "../features/help/HelpSupportPage";

const router = createBrowserRouter([
  // Public homepage
  {
    path: "/",
    element: <HomePage />,
  },

  // Guest routes
  {
    element: <GuestRoute />,
    children: [
      {
        path: "/login",
        element: <LoginPage />,
      },
      {
        path: "/register",
        element: <RegisterPage />,
      },
    ],
  },

  // Protected application routes
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            path: "/dashboard",
            element: <DashboardPage />,
          },
          {
            path: "/projects",
            element: <ProjectsPage />,
          },
          {
            path: "/projects/:projectId",
            element: <ProjectOverviewPage />,
          },
          {
            path: "/tasks",
            element: <TasksPage />,
          },
          {
            path: "/tasks/:taskId",
            element: <TaskOverviewPage />,
          },
          {
            path: "/members",
            element: <MembersPage />,
          },
          {
            path: "/notifications",
            element: <NotificationsPage />,
          },
          {
            path: "/billing",
            element: <BillingPage />,
          },
          {
            path: "/settings",
            element: <SettingsPage />,
          },
          {
            path: "/help",
            element: <HelpSupportPage />,
          },
          {
            path: "/workspaces/create",
            element: <WorkspacePage />,
          },
          {
            path: "/workspaces",
            element: <WorkspacesPage />,
          },
          {
            path: "/workspaces/:workspaceId",
            element: <WorkspaceOverviewPage />,
          },
        ],
      },
    ],
  },
]);

export default router;
