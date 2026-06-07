import { apiClient } from "@/lib/api-client";
import { NotificationsResponse, NotificationsParams, ApiResponse } from "@/types";

export const notificationsClient = {
  getNotifications: async (params?: NotificationsParams) => {
    const response = await apiClient.get<NotificationsResponse>(
      "/api/v1/participant/notifications",
      { params },
    );
    return response.data;
  },

  markRead: async (id: string) => {
    const response = await apiClient.patch<ApiResponse>(
      `/api/v1/participant/notifications/${id}/read`,
    );
    return response.data;
  },

  markAllRead: async () => {
    const response = await apiClient.patch<ApiResponse>(
      "/api/v1/participant/notifications/read-all",
    );
    return response.data;
  },
};
