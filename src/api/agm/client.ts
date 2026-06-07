import { apiClient } from "@/lib/api-client";
import {
  ResolutionsResponse,
  ProxyResponse,
  AssignProxyRequest,
  CastVoteRequest,
  ApiResponse,
} from "@/types";

export const agmClient = {
  getResolutions: async (eventId: string) => {
    const response = await apiClient.get<ResolutionsResponse>(
      `/api/v1/participant/events/${eventId}/resolutions`,
    );
    return response.data;
  },

  castVote: async (eventId: string, resolutionId: string, data: CastVoteRequest) => {
    const response = await apiClient.post<ApiResponse>(
      `/api/v1/participant/events/${eventId}/resolutions/${resolutionId}/vote`,
      data,
    );
    return response.data;
  },

  getProxy: async (eventId: string) => {
    const response = await apiClient.get<ProxyResponse>(
      `/api/v1/participant/events/${eventId}/proxy`,
    );
    return response.data;
  },

  assignProxy: async (eventId: string, data: AssignProxyRequest) => {
    const response = await apiClient.post<ProxyResponse>(
      `/api/v1/participant/events/${eventId}/proxy`,
      data,
    );
    return response.data;
  },
};
