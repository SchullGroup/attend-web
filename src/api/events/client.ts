import { apiClient } from "@/lib/api-client";
import {
  EventsListResponse,
  EventDetailResponse,
  EventsQueryParams,
  ApiResponse,
} from "@/types";

export const eventsClient = {
  getEvents: async (params?: EventsQueryParams) => {
    const response = await apiClient.get<EventsListResponse>(
      "/api/v1/participant/events",
      { params },
    );
    return response.data;
  },

  getEvent: async (id: string) => {
    const response = await apiClient.get<EventDetailResponse>(
      `/api/v1/participant/events/${id}`,
    );
    return response.data;
  },

  rsvp: async (id: string) => {
    const response = await apiClient.post<ApiResponse>(
      `/api/v1/participant/events/${id}/rsvp`,
    );
    return response.data;
  },

  cancelRsvp: async (id: string) => {
    const response = await apiClient.delete<ApiResponse>(
      `/api/v1/participant/events/${id}/rsvp`,
    );
    return response.data;
  },
};
