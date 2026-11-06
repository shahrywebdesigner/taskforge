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
} from 'lucide-react'

interface SidebarProps {
  className?: string
  onNavigate?: () => void
}

const navigation = [
  { name: 'Overview', icon: LayoutDashboard, path: '/dashboard' },
  { name: 'Projects', icon: FolderKanban, path: '/projects' },
  { name: 'My Tasks', icon: CheckSquare, path: '/tasks' },
  { name: 'Members', icon: Users, path: '/members' },
  { name: 'Notifications', icon: Bell, path: '/notifications' },
  { name: 'Billing', icon: CreditCard, path: '/billing' },
  { name: 'Settings', icon: Settings, path: '/settings' },
]

function Sidebar({ className = '',onNavigate, }: SidebarProps) {
  return (
  <aside
  className={`flex h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white ${className}`}
      >
{/* Logo */}
<NavLink
  to="/dashboard"
  onClick={onNavigate}
  className="flex h-20 items-center gap-3 border-b border-slate-200 px-6"
>
  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white">
    <Zap size={21} />
  </div>

  <span className="text-xl font-bold tracking-tight text-slate-900">
    TaskForge
  </span>
</NavLink>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-4 py-6">
        <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Workspace
        </p>

        {navigation.map((item) => {
          const Icon = item.icon

          return (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={onNavigate}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              <Icon size={19} />
              {item.name}
            </NavLink>
          )
        })}
      </nav>

{/* Bottom section */}
<div className="border-t border-slate-200 p-4">
  <NavLink
    to="/billing"
    onClick={onNavigate}
    className="block rounded-lg p-2 transition hover:bg-slate-100"
  >
    <p className="text-xs text-slate-400">
      TaskForge Workspace
    </p>

    <div className="mt-1 flex items-center justify-between">
      <p className="text-sm font-semibold text-slate-700">
        Free Plan
      </p>
      <CreditCard size={17} className="text-indigo-600" />
    </div>

    <p className="mt-1 text-xs text-indigo-600">
      View plans & upgrade →
    </p>
  </NavLink>
</div>
    </aside>
  )
}

export default Sidebar