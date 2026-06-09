import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { agmClient } from "./client";
import { AssignProxyRequest, CastVoteRequest, SubmitQuestionRequest } from "@/types";

export const agmKeys = {
  resolutions: (eventId: string) => ["agm", "resolutions", eventId] as const,
  proxy: (eventId: string) => ["agm", "proxy", eventId] as const,
  voteReceipt: (eventId: string) => ["agm", "vote-receipt", eventId] as const,
  questions: (eventId: string) => ["agm", "questions", eventId] as const,
};

export const useGetVoteReceipt = (eventId: string) => {
  return useQuery({
    queryKey: agmKeys.voteReceipt(eventId),
    queryFn: () => agmClient.getVoteReceipt(eventId),
    enabled: !!eventId,
    retry: false,
  });
};

export const useGetQuestions = (eventId: string) => {
  return useQuery({
    queryKey: agmKeys.questions(eventId),
    queryFn: () => agmClient.getQuestions(eventId),
    enabled: !!eventId,
  });
};

export const useSubmitQuestion = (eventId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SubmitQuestionRequest) => agmClient.submitQuestion(eventId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agmKeys.questions(eventId) });
    },
  });
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
