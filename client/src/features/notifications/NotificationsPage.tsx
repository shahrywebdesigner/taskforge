
import { useEffect, useState } from "react";
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  FolderKanban,
  MessageSquare,
  UserPlus,
  RefreshCw,
  ListTodo,
} from "lucide-react";

import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import ErrorMessage from "../../components/ui/ErrorMessage";

import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type NotificationItem,
} from "./notifications.api";

const getNotificationIcon = (type: NotificationItem["type"]) => {
  switch (type) {
    case "workspace_invitation":
      return UserPlus;
    case "workspace_updated":
    case "project_updated":
      return RefreshCw;
    case "project_created":
      return FolderKanban;
    case "task_assigned":
    case "task_updated":
      return ListTodo;
    case "task_completed":
      return CheckCircle2;
    case "comment_added":
      return MessageSquare;
    default:
      return Bell;
  }
};

const formatTime = (date: string) => {
  const diff = Date.now() - new Date(date).getTime();

  if (Number.isNaN(diff)) return "";

  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} minutes ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hours ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} days ago`;

  return new Date(date).toLocaleDateString();
};

function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);


useEffect(() => {
  let cancelled = false;

  const loadNotifications = async () => {
    try {
      const response = await getNotifications();

      if (cancelled) return;

      setNotifications(response.notifications);
      setUnreadCount(response.unreadCount);
    } catch {
      if (!cancelled) {
        setError("Unable to load notifications. Please try again.");
      }
    } finally {
      if (!cancelled) {
        setLoading(false);
      }
    }
  };

  void loadNotifications();

  return () => {
    cancelled = true;
  };
}, []);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);

      setNotifications((current) =>
        current.map((notification) =>
          notification._id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );

      setUnreadCount((count) => Math.max(0, count - 1));
      window.dispatchEvent(new Event("taskforge:notifications-updated"));
    } catch {
      setError("Unable to update notification. Please try again.");
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;

    try {
      setUpdating(true);
      await markAllNotificationsAsRead();

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );

      setUnreadCount(0);
      window.dispatchEvent(new Event("taskforge:notifications-updated"));
    } catch {
      setError("Unable to mark all notifications as read.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Notifications"
        description="Stay updated with your workspace activity."
      />

      <div className="mt-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            {unreadCount} unread notifications
          </p>

          <button
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0 || updating}
            className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CheckCheck size={17} />
            {updating ? "Updating..." : "Mark all as read"}
          </button>
        </div>

{error && (
  <div className="mb-4">
    <ErrorMessage message={error} />
  </div>
)}

{loading ? (
  <LoadingSpinner message="Loading notifications..." />
) : notifications.length === 0 ? (
  <EmptyState
    title="No notifications yet"
    description="Workspace activity notifications will appear here."
    icon={Bell}
  />
) : (
          <div className="space-y-4">
            {notifications.map((notification) => {
              const Icon = getNotificationIcon(notification.type);

              return (
                <Card key={notification._id}>
                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-indigo-50 p-3 text-indigo-600">
                      <Icon size={20} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold text-slate-900">
                            {notification.title}
                          </h3>

                          <p className="mt-1 text-sm text-slate-500">
                            {notification.message}
                          </p>
                        </div>

                        {!notification.isRead && (
                          <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-indigo-600" />
                        )}
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <p className="text-xs text-slate-400">
                          {formatTime(notification.createdAt)}
                        </p>

                        {!notification.isRead && (
                          <button
                            onClick={() =>
                              handleMarkAsRead(notification._id)
                            }
                            className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default NotificationsPage;
