import { apiClient } from "@/lib/api-client";
import { ApiResponse } from "@/types";

export interface GuestInvitePreview {
  eventId: string;
  eventTitle: string;
  capabilities: ("VIEW" | "QA" | "VOTE")[];
}

export interface GuestSession {
  id: string;
  eventId: string;
  fullName: string;
  email?: string | null;
  phone?: string | null;
  role: string;
  capabilities: ("VIEW" | "QA" | "VOTE")[];
}

export const guestsClient = {
  getInvitePreview: async (code: string) => {
    const response = await apiClient.get<ApiResponse<GuestInvitePreview>>(
      `/api/v1/guest/invites/${code}`
    );
    return response.data;
  },

  redeemInvite: async (data: {
    code: string;
    fullName: string;
    email?: string;
    phone?: string;
    role: string;
  }) => {
    const response = await apiClient.post<ApiResponse<{ guestToken: string; session: GuestSession }>>(
      "/api/v1/guest/redeem",
      data
    );
    return response.data;
  },

  getSession: async () => {
    const response = await apiClient.get<ApiResponse<GuestSession>>(
      "/api/v1/guest/session"
    );
    return response.data;
  },
};
