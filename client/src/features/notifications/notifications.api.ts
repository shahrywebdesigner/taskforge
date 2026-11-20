
import api from "../../lib/axios";

export interface NotificationItem {
  _id: string;
  type:
    | "workspace_invitation"
    | "workspace_updated"
    | "project_created"
    | "project_updated"
    | "task_assigned"
    | "task_updated"
    | "task_completed"
    | "comment_added";
  title: string;
  message: string;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
  actor?: {
    _id: string;
    name: string;
  } | null;
}

interface NotificationsResponse {
  success: boolean;
  notifications: NotificationItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  unreadCount: number;
}

export const getNotifications = async (
  page = 1,
  limit = 20
): Promise<NotificationsResponse> => {
  const response = await api.get("/notifications", {
    params: { page, limit },
  });

  return response.data;
};

export const markNotificationAsRead = async (
  notificationId: string
) => {
  const response = await api.patch(
    `/notifications/${notificationId}/read`
  );

  return response.data;
};

export const markAllNotificationsAsRead = async () => {
  const response = await api.patch("/notifications/read-all");

  return response.data;
};
