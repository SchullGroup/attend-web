import { apiClient } from "@/lib/api-client";
import {
  EventsListResponse,
  EventDetailResponse,
  EventsQueryParams,
  MyTicketResponse,
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

  getMyEvents: async () => {
    const response = await apiClient.get<EventsListResponse>(
      "/api/v1/participant/events/mine",
    );
    return response.data;
  },

  checkIn: async (id: string) => {
    const response = await apiClient.post<ApiResponse>(
      `/api/v1/participant/events/${id}/check-in`,
    );
    return response.data;
  },

  getEvent: async (id: string) => {
    const response = await apiClient.get<EventDetailResponse>(
      `/api/v1/participant/events/${id}`,
    );
    return response.data;
  },

  getMyTicket: async (id: string) => {
    const response = await apiClient.get<MyTicketResponse>(
      `/api/v1/participant/events/${id}/my-ticket`,
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

  getSavedEvents: async () => {
    const response = await apiClient.get<EventsListResponse>(
      "/api/v1/participant/events/saved",
    );
    return response.data;
  },

  saveEvent: async (id: string) => {
    const response = await apiClient.post<ApiResponse>(
      `/api/v1/participant/events/${id}/save`,
    );
    return response.data;
  },

  unsaveEvent: async (id: string) => {
    const response = await apiClient.delete<ApiResponse>(
      `/api/v1/participant/events/${id}/save`,
    );
    return response.data;
  },
};
