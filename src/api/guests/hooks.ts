import { useQuery, useMutation } from "@tanstack/react-query";
import { guestsClient } from "./client";

export const guestKeys = {
  preview: (code: string) => ["guest", "preview", code] as const,
  session: () => ["guest", "session"] as const,
};

export const useGetGuestInvitePreview = (code: string, enabled = true) => {
  return useQuery({
    queryKey: guestKeys.preview(code),
    queryFn: () => guestsClient.getInvitePreview(code),
    enabled: !!code && enabled,
    retry: false,
  });
};

export const useRedeemGuestInvite = () => {
  return useMutation({
    mutationFn: guestsClient.redeemInvite,
  });
};

export const useGetGuestSession = (enabled = true) => {
  return useQuery({
    queryKey: guestKeys.session(),
    queryFn: () => guestsClient.getSession(),
    enabled,
    retry: false,
  });
};
