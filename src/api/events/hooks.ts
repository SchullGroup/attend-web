import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { eventsClient } from "./client";
import { EventsQueryParams } from "@/types";

export const eventKeys = {
  all: ["events"] as const,
  list: (params?: EventsQueryParams) =>
    [...eventKeys.all, "list", params] as const,
  detail: (id: string) => [...eventKeys.all, "detail", id] as const,
};

export const useGetEvents = (params?: EventsQueryParams) => {
  return useQuery({
    queryKey: eventKeys.list(params),
    queryFn: () => eventsClient.getEvents(params),
  });
};

export const useGetEvent = (id: string) => {
  return useQuery({
    queryKey: eventKeys.detail(id),
    queryFn: () => eventsClient.getEvent(id),
    enabled: !!id,
  });
};

export const useRsvp = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => eventsClient.rsvp(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
    },
  });
};

export const useCancelRsvp = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => eventsClient.cancelRsvp(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
    },
  });
};
