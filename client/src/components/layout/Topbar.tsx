
import { useState } from 'react'
import { useNavigate } from 'react-router'
import {
  CircleHelp,
  Bell,
  ChevronDown,
  UserRound,
  Menu,
  X,
} from 'lucide-react'

interface TopbarProps {
  isSidebarOpen: boolean
  onMenuClick: () => void
}

type OpenMenu = 'workspace' | 'help' | 'account' | null

function Topbar({ isSidebarOpen, onMenuClick }: TopbarProps) {
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null)
  const navigate = useNavigate()

  const toggleMenu = (menu: OpenMenu) => {
    setOpenMenu(openMenu === menu ? null : menu)
  }

  const goTo = (path: string) => {
    setOpenMenu(null)
    navigate(path)
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-8">
      <div className="relative flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="text-slate-600 md:hidden"
          aria-label={isSidebarOpen ? 'Close menu' : 'Open menu'}
        >
          {isSidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <button
          onClick={() => toggleMenu('workspace')}
          className="flex items-center gap-2 text-sm font-semibold text-slate-700"
        >
          My Workspace <ChevronDown size={16} />
        </button>

        {openMenu === 'workspace' && (
          <div className="absolute left-0 top-10 z-50 w-56 rounded-lg border border-slate-200 bg-white p-2 shadow-lg">
            <p className="px-3 py-2 text-xs font-semibold uppercase text-slate-400">
              Workspaces
            </p>
            <button className="w-full rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100">
              My Workspace
            </button>
            <button
              onClick={() => goTo('/workspaces/create')}
              className="w-full rounded-md px-3 py-2 text-left text-sm text-indigo-600 hover:bg-slate-100">
              + Create Workspace
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-5">
        <div className="relative">
          <button
            onClick={() => toggleMenu('help')}
            aria-label="Help"
            className="text-slate-500 hover:text-slate-900"
          >
            <CircleHelp size={20} />
          </button>

          {openMenu === 'help' && (
            <div className="absolute right-0 top-9 z-50 w-52 rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
              <p className="text-sm font-semibold text-slate-800">Help & Support</p>
              <p className="mt-1 text-xs text-slate-500">
                Need help using TaskForge?
              </p>
              <button
                onClick={() => goTo('/settings')}
                className="mt-3 text-sm text-indigo-600 hover:underline"
              >
                Visit Settings
              </button>
            </div>
          )}
        </div>

        <button
          onClick={() => goTo('/notifications')}
          aria-label="Notifications"
          className="relative text-slate-500 hover:text-slate-900"
        >
          <Bell size={20} />
          <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-red-500" />
        </button>

        <div className="relative border-l border-slate-200 pl-5">
          <button
            onClick={() => toggleMenu('account')}
            className="flex items-center gap-2"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
              <UserRound size={19} />
            </div>
            <span className="hidden text-sm font-medium text-slate-700 sm:inline">
              My Account
            </span>
            <ChevronDown size={14} className="text-slate-500" />
          </button>

          {openMenu === 'account' && (
            <div className="absolute right-0 top-12 z-50 w-48 rounded-lg border border-slate-200 bg-white p-2 shadow-lg">
              <p className="px-3 py-2 text-sm font-semibold text-slate-800">
                My Account
              </p>
              <button
                onClick={() => goTo('/settings')}
                className="w-full rounded-md px-3 py-2 text-left text-sm text-slate-600 hover:bg-slate-100"
              >
                Profile & Settings
              </button>
              <button
                onClick={() => goTo('/billing')}
                className="w-full rounded-md px-3 py-2 text-left text-sm text-slate-600 hover:bg-slate-100"
              >
                Billing
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Topbar
