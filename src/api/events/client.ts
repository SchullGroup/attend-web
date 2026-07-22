import axios from "axios";
import { apiClient } from "@/lib/api-client";
import {
  EventsListResponse,
  EventDetailResponse,
  EventDetail,
  EventsQueryParams,
  MyTicketResponse,
  ApiResponse,
  ApiResponseActivePollResponse,
  ApiResponsePressKitResponse,
  GuestEventsListResponse,
  GuestResolutionsResponse,
  QuestionsResponse,
  SubmitQuestionRequest,
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

  // Live quorum — a generic map (percentage + met flag + attendee/share counts).
  getQuorum: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Record<string, unknown>>>(
      `/api/v1/participant/events/${id}/quorum`,
    );
    return response.data;
  },

  // Join the waitlist for a full event.
  joinWaitlist: async (id: string) => {
    const response = await apiClient.post<ApiResponse>(
      `/api/v1/participant/events/${id}/waitlist`,
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

  getActivePoll: async (id: string) => {
    const response = await apiClient.get<ApiResponseActivePollResponse>(
      `/api/v1/participant/events/${id}/polls`,
    );
    return response.data;
  },

  respondToPoll: async (eventId: string, pollId: string, optionId: string) => {
    const response = await apiClient.post<ApiResponse>(
      `/api/v1/participant/events/${eventId}/polls/${pollId}/respond`,
      { optionId }
    );
    return response.data;
  },

  getPressKit: async (id: string) => {
    const response = await apiClient.get<ApiResponsePressKitResponse>(
      `/api/v1/participant/events/${id}/press-kit`,
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

  // Guest access — unauthenticated, bypasses the standard auth interceptor.
  guestJoinEvent: async (eventId: string, code: string) => {
    const response = await axios.post<ApiResponse<Record<string, unknown>>>(
      `/api/v1/guest/events/${eventId}/join`,
      { code },
      { headers: { "Content-Type": "application/json" } },
    );
    return response.data;
  },

  // Public — no token of any kind. This is the only guest entry point that doesn't
  // already require an event id, so it's what "Continue as guest" browses.
  guestBrowseEvents: async (params: { search?: string; page?: number; size?: number }) => {
    const response = await axios.get<GuestEventsListResponse>(`/api/v1/guest/events`, {
      params,
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  },

  // View-only resolutions for a guest. Same items as the participant endpoint, but the
  // payload is a bare array rather than a { resolutions } object.
  guestGetResolutions: async (eventId: string, guestToken: string) => {
    const response = await apiClient.get<GuestResolutionsResponse>(
      `/api/v1/guest/events/${eventId}/resolutions`,
      { headers: { "X-Guest-Token": guestToken, "Content-Type": "application/json" } },
    );
    return response.data;
  },

  guestGetView: async (eventId: string, guestToken: string) => {
    const response = await apiClient.get<ApiResponse<EventDetail>>(
      `/api/v1/guest/events/${eventId}/view`,
      { headers: { "X-Guest-Token": guestToken, "Content-Type": "application/json" } },
    );
    return response.data;
  },

  guestGetQuestions: async (eventId: string, guestToken: string) => {
    const response = await apiClient.get<QuestionsResponse>(
      `/api/v1/guest/events/${eventId}/questions`,
      { headers: { "X-Guest-Token": guestToken, "Content-Type": "application/json" } },
    );
    return response.data;
  },

  guestSubmitQuestion: async (eventId: string, guestToken: string, data: SubmitQuestionRequest) => {
    const response = await apiClient.post<ApiResponse>(
      `/api/v1/guest/events/${eventId}/questions`,
      data,
      { headers: { "X-Guest-Token": guestToken, "Content-Type": "application/json" } },
    );
    return response.data;
  },

  guestUpvoteQuestion: async (eventId: string, guestToken: string, questionId: string) => {
    const response = await apiClient.post<ApiResponse<Record<string, unknown>>>(
      `/api/v1/guest/events/${eventId}/questions/${questionId}/upvote`,
      {},
      { headers: { "X-Guest-Token": guestToken, "Content-Type": "application/json" } },
    );
    return response.data;
  },
};
