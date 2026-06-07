import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { hackathonClient } from "./client";
import { CreateTeamRequest, SubmitProjectRequest } from "@/types";

export const hackathonKeys = {
  challenges: (params?: object) => ["hackathon", "challenges", params] as const,
  myTeam: (challengeId: string) => ["hackathon", "team", challengeId] as const,
};

export const useGetChallenges = (params?: { search?: string; page?: number; size?: number }) => {
  return useQuery({
    queryKey: hackathonKeys.challenges(params),
    queryFn: () => hackathonClient.getChallenges(params),
  });
};

export const useGetMyTeam = (challengeId: string) => {
  return useQuery({
    queryKey: hackathonKeys.myTeam(challengeId),
    queryFn: () => hackathonClient.getMyTeam(challengeId),
    enabled: !!challengeId,
    retry: false,
  });
};

export const useCreateTeam = (challengeId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTeamRequest) =>
      hackathonClient.createTeam(challengeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hackathonKeys.myTeam(challengeId) });
    },
  });
};

export const useSubmitProject = () => {
  return useMutation({
    mutationFn: ({ teamId, data }: { teamId: string; data: SubmitProjectRequest }) =>
      hackathonClient.submitProject(teamId, data),
  });
};
