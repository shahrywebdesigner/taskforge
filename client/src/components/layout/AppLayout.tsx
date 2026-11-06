import { useState } from 'react'
import { Outlet } from 'react-router'
import { X } from 'lucide-react'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-slate-50">

      {/* Desktop Sidebar */}
      <Sidebar className="hidden md:flex" />

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transition-transform duration-300 md:hidden ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar className="flex"   onNavigate={() => setIsSidebarOpen(false)} />

        <button
          onClick={() => setIsSidebarOpen(false)}
          className="absolute right-3 top-5 rounded-lg bg-white p-2 text-slate-600 shadow"
          aria-label="Close sidebar"
        >
          <X size={18} />
        </button>
      </div>

      <div className="min-w-0 flex-1">
        <Topbar
          isSidebarOpen={isSidebarOpen}
          onMenuClick={() => setIsSidebarOpen((prev) => !prev)}
        />

        <main className="p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AppLayout