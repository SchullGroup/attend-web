import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { agmClient } from "./client";
import { AssignProxyRequest, CastVoteRequest } from "@/types";

export const agmKeys = {
  resolutions: (eventId: string) => ["agm", "resolutions", eventId] as const,
  proxy: (eventId: string) => ["agm", "proxy", eventId] as const,
};

export const useGetResolutions = (eventId: string) => {
  return useQuery({
    queryKey: agmKeys.resolutions(eventId),
    queryFn: () => agmClient.getResolutions(eventId),
    enabled: !!eventId,
  });
};

export const useCastVote = (eventId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ resolutionId, data }: { resolutionId: string; data: CastVoteRequest }) =>
      agmClient.castVote(eventId, resolutionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agmKeys.resolutions(eventId) });
    },
  });
};

export const useGetProxy = (eventId: string) => {
  return useQuery({
    queryKey: agmKeys.proxy(eventId),
    queryFn: () => agmClient.getProxy(eventId),
    enabled: !!eventId,
  });
};

export const useAssignProxy = (eventId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AssignProxyRequest) => agmClient.assignProxy(eventId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agmKeys.proxy(eventId) });
    },
  });
};
