import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { useAuth } from "../../features/auth/useAuth";
import { useWorkspace } from "../../features/workspaces/useWorkspace";
import { getNotifications } from "../../features/notifications/notifications.api";
import { useTheme } from "../../context/useTheme";

import {
  CircleHelp,
  Bell,
  ChevronDown,
  UserRound,
  Menu,
  X,
  LogOut,
  Moon,
  Sun,
} from "lucide-react";

interface TopbarProps {
  isSidebarOpen: boolean;
  onMenuClick: () => void;
}

type OpenMenu = "workspace" | "help" | "account" | null;

function Topbar({ isSidebarOpen, onMenuClick }: TopbarProps) {
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const workspaceMenuRef = useRef<HTMLDivElement>(null);
  const helpMenuRef = useRef<HTMLDivElement>(null);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: PointerEvent) => {
      const target = event.target;

      if (!(target instanceof Node)) return;

      const activeMenuRef =
        openMenu === "workspace"
          ? workspaceMenuRef
          : openMenu === "help"
            ? helpMenuRef
            : openMenu === "account"
              ? accountMenuRef
              : null;

      if (activeMenuRef && !activeMenuRef.current?.contains(target)) {
        setOpenMenu(null);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenMenu(null);
      }
    };

    document.addEventListener("pointerdown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [openMenu]);

  const navigate = useNavigate();
  const location = useLocation();

  const { user, logout } = useAuth();
  const { selectedWorkspaceName } = useWorkspace();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await getNotifications(1, 1);
        setUnreadCount(response.unreadCount);
      } catch {
        setUnreadCount(0);
      }
    };

    void fetchUnreadCount();

    const handleNotificationUpdate = () => {
      void fetchUnreadCount();
    };

    window.addEventListener(
      "taskforge:notifications-updated",
      handleNotificationUpdate,
    );

    return () => {
      window.removeEventListener(
        "taskforge:notifications-updated",
        handleNotificationUpdate,
      );
    };
  }, [location.pathname]);

  const toggleMenu = (menu: OpenMenu) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  const goTo = (path: string) => {
    setOpenMenu(null);
    navigate(path);
  };

  const handleCreateWorkspace = () => {
    goTo(user?.isProActive ? "/workspaces/create" : "/billing");
  };

  const handleLogout = async () => {
    try {
      await logout();
      setOpenMenu(null);
      navigate("/login", { replace: true });
    } catch {
      console.error("Logout failed");
    }
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-3 sm:px-4 md:px-8">
      <div ref={workspaceMenuRef} className="relative flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="text-slate-600 md:hidden"
          aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
        >
          {isSidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <button
          onClick={() => toggleMenu("workspace")}
          className="flex items-center gap-2 text-sm font-semibold text-slate-700"
        >
          <span className="max-w-28 truncate sm:max-w-40">
            {selectedWorkspaceName || "My Workspace"}
          </span>
          <ChevronDown size={16} />
        </button>

        {openMenu === "workspace" && (
          <div className="absolute left-0 top-10 z-50 w-56 rounded-lg border border-slate-200 bg-white p-2 shadow-lg">
            <p className="px-3 py-2 text-xs font-semibold uppercase text-slate-400">
              Workspaces
            </p>

            <button
              onClick={() => goTo("/workspaces")}
              className="flex w-full items-center rounded-md px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
            >
              My Workspaces
            </button>

            <button
              onClick={handleCreateWorkspace}
              className="w-full rounded-md px-3 py-2 text-left text-sm text-indigo-600 hover:bg-slate-100"
            >
              {user?.isProActive
                ? "+ Create Workspace"
                : "Upgrade to create workspace"}
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 sm:gap-5">
        <button
          onClick={toggleTheme}
          aria-label={
            theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
          }
          title={theme === "dark" ? "Light Mode" : "Dark Mode"}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 hover:text-indigo-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-indigo-400"
        >
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <div ref={helpMenuRef} className="relative">
          <button
            onClick={() => toggleMenu("help")}
            aria-label="Help"
            className="text-slate-500 hover:text-slate-900"
          >
            <CircleHelp size={20} />
          </button>

          {openMenu === "help" && (
            <div className="absolute right-0 top-9 z-50 w-52 rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
              <p className="text-sm font-semibold text-slate-800">
                Help & Support
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Need help using TaskForge?
              </p>
              <button
                onClick={() => goTo("/help")}
                className="mt-3 text-sm text-indigo-600 hover:underline"
              >
                Visit Help & Support
              </button>
            </div>
          )}
        </div>

        <button
          onClick={() => goTo("/notifications")}
          aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
          className="relative text-slate-500 hover:text-slate-900"
        >
          <Bell size={20} />

          {unreadCount > 0 && (
            <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>

        <div
          ref={accountMenuRef}
          className="relative border-l border-slate-200 pl-3 sm:pl-5"
        >
          <button
            onClick={() => toggleMenu("account")}
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

          {openMenu === "account" && (
            <div className="absolute right-0 top-12 z-50 w-48 rounded-lg border border-slate-200 bg-white p-2 shadow-lg">
              <p className="px-3 py-2 text-sm font-semibold text-slate-800">
                {user?.name || "My Account"}
              </p>

              <button
                onClick={() => goTo("/settings")}
                className="w-full rounded-md px-3 py-2 text-left text-sm text-slate-600 hover:bg-slate-100"
              >
                Profile & Settings
              </button>

              <button
                onClick={() => goTo("/billing")}
                className="w-full rounded-md px-3 py-2 text-left text-sm text-slate-600 hover:bg-slate-100"
              >
                Billing
              </button>

              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Topbar;
