import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router";
import { X } from "lucide-react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

function AppLayout() {
  const location = useLocation();

  const [sidebarState, setSidebarState] = useState({
    open: false,
    pathname: location.pathname,
  });

  // Route change par drawer automatically closed rahega.
  const isSidebarOpen =
    sidebarState.open && sidebarState.pathname === location.pathname;

  const closeSidebar = () => {
    setSidebarState({
      open: false,
      pathname: location.pathname,
    });
  };

  const toggleSidebar = () => {
    setSidebarState({
      open: !isSidebarOpen,
      pathname: location.pathname,
    });
  };

  // Escape key se mobile drawer close karein.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSidebarState((prev) => ({
          ...prev,
          open: false,
        }));
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <Sidebar className="hidden md:flex" />

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 cursor-default bg-slate-900/40 md:hidden"
          onClick={closeSidebar}
          aria-label="Close sidebar overlay"
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
        aria-hidden={!isSidebarOpen}
        inert={!isSidebarOpen}
        className={`fixed inset-y-0 left-0 z-50 transition-transform duration-300 md:hidden ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar className="flex w-64" onNavigate={closeSidebar} />

        <button
          type="button"
          onClick={closeSidebar}
          className="absolute right-3 top-5 rounded-lg bg-white p-2 text-slate-600 shadow"
          aria-label="Close sidebar"
        >
          <X size={18} />
        </button>
      </div>

      <div className="min-w-0 flex-1">
        <Topbar isSidebarOpen={isSidebarOpen} onMenuClick={toggleSidebar} />

        <main className="p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
