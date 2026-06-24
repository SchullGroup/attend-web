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

  // Live stream — gated by the backend: 403 if not registered, 409 if not live.
  // Returns a generic map (eventId, eventTitle, streamUrl, status).
  getStream: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Record<string, unknown>>>(
      `/api/v1/participant/events/${id}/stream`,
    );
    return response.data;
  },

  // Countdown to start — { status, startsAt, secondsUntilStart } (0 when LIVE, null when ended).
  getCountdown: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Record<string, unknown>>>(
      `/api/v1/participant/events/${id}/countdown`,
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
