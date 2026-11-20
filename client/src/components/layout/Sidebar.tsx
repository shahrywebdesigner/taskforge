
import { NavLink } from 'react-router'
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users,
  Bell,
  CreditCard,
  Settings,
  Zap,
  BriefcaseBusiness,
  LifeBuoy,
} from 'lucide-react'
import { useAuth } from '../../features/auth/useAuth'

interface SidebarProps {
  className?: string
  onNavigate?: () => void
}

const navigation = [
  { name: 'Overview', icon: LayoutDashboard, path: '/dashboard' },
  { name: 'My Workspaces', icon: BriefcaseBusiness, path: '/workspaces' },
  { name: 'Projects', icon: FolderKanban, path: '/projects' },
  { name: 'My Tasks', icon: CheckSquare, path: '/tasks' },
  { name: 'Members', icon: Users, path: '/members' },
  { name: 'Notifications', icon: Bell, path: '/notifications' },
  { name: 'Billing', icon: CreditCard, path: '/billing' },
  { name: 'Settings', icon: Settings, path: '/settings' },
  { name: 'Help & Support', icon: LifeBuoy, path: '/help' },
]

function Sidebar({ className = '', onNavigate }: SidebarProps) {
  const { user } = useAuth()
  const isPro = user?.isProActive === true

  return (
    <aside
      className={`flex h-screen w-16 shrink-0 flex-col border-r border-slate-200 bg-white transition-all duration-300 lg:w-64 ${className}`}
    >
      {/* Logo */}
      <NavLink
        to="/dashboard"
        onClick={onNavigate}
        title="TaskForge"
        className="flex h-20 items-center justify-center gap-3 border-b border-slate-200 px-2 lg:justify-start lg:px-6"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white">
          <Zap size={21} />
        </div>

        <span className="hidden text-xl font-bold tracking-tight text-slate-900 lg:inline">
          TaskForge
        </span>
      </NavLink>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-6 lg:px-4">
        <p className="mb-4 hidden px-3 text-xs font-semibold uppercase tracking-wider text-slate-400 lg:block">
          Workspace
        </p>

        {navigation.map((item) => {
          const Icon = item.icon

          return (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={onNavigate}
              title={item.name}
              className={({ isActive }) =>
                `flex items-center justify-center gap-3 rounded-lg px-2 py-2.5 text-sm font-medium transition lg:justify-start lg:px-3 ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              <Icon size={19} className="shrink-0" />

              <span className="hidden lg:inline">
                {item.name}
              </span>
            </NavLink>
          )
        })}
      </nav>

      {/* Subscription */}
      <div className="border-t border-slate-200 p-2 lg:p-4">
        <NavLink
          to="/billing"
          onClick={onNavigate}
          title={isPro ? 'Pro Plan' : 'Free Plan'}
          className="flex items-center justify-center rounded-lg p-2 transition hover:bg-slate-100 lg:block lg:p-2"
        >
          <CreditCard
            size={19}
            className={isPro ? 'text-amber-500' : 'text-indigo-600'}
          />

          <div className="hidden lg:block">
            <p className="mt-2 text-xs text-slate-400">
              TaskForge Subscription
            </p>

            <div className="mt-1 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-700">
                {isPro ? 'Pro Plan' : 'Free Plan'}
              </p>
            </div>

            <p className="mt-1 text-xs text-indigo-600">
              {isPro ? 'Manage subscription →' : 'View plans & upgrade →'}
            </p>
          </div>
        </NavLink>
      </div>
    </aside>
  )
}

export default Sidebar
