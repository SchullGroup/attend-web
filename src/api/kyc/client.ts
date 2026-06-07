import { apiClient } from "@/lib/api-client";
import { KycStatusResponse, KycSubmitRequest, ApiResponse } from "@/types";

export const kycClient = {
  getStatus: async () => {
    const response = await apiClient.get<KycStatusResponse>(
      "/api/v1/participant/kyc",
    );
    return response.data;
  },

  submit: async (data: KycSubmitRequest) => {
    const response = await apiClient.post<ApiResponse>(
      "/api/v1/participant/kyc",
      data,
    );
    return response.data;
  },
};
