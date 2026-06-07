import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { kycClient } from "./client";
import { KycSubmitRequest } from "@/types";

export const kycKeys = {
  status: ["kyc", "status"] as const,
};

export const useGetKycStatus = (enabled = true) => {
  return useQuery({
    queryKey: kycKeys.status,
    queryFn: kycClient.getStatus,
    enabled,
    retry: false,
  });
};

export const useSubmitKyc = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: KycSubmitRequest) => kycClient.submit(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: kycKeys.status });
    },
  });
};
