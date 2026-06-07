import { apiClient } from "@/lib/api-client";
import {
  ChallengesListResponse,
  TeamResponse,
  CreateTeamRequest,
  SubmitProjectRequest,
  ApiResponse,
} from "@/types";

export const hackathonClient = {
  getChallenges: async (params?: { search?: string; page?: number; size?: number }) => {
    const response = await apiClient.get<ChallengesListResponse>(
      "/api/v1/participant/challenges",
      { params },
    );
    return response.data;
  },

  getMyTeam: async (challengeId: string) => {
    const response = await apiClient.get<TeamResponse>(
      `/api/v1/participant/challenges/${challengeId}/teams/mine`,
    );
    return response.data;
  },

  createTeam: async (challengeId: string, data: CreateTeamRequest) => {
    const response = await apiClient.post<TeamResponse>(
      `/api/v1/participant/challenges/${challengeId}/teams`,
      data,
    );
    return response.data;
  },

  submitProject: async (teamId: string, data: SubmitProjectRequest) => {
    const response = await apiClient.post<ApiResponse>(
      `/api/v1/participant/teams/${teamId}/submit`,
      data,
    );
    return response.data;
  },
};
