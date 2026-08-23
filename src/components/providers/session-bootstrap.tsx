"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { authKeys } from "@/api/auth/hooks";
import { refreshAccessToken } from "@/lib/api-client";

// Mirror of proxy.ts publicRoutes — pages that never carry an access token, so there is
// nothing to refresh and a failed refresh must not bounce the user (they're already here
// legitimately). Kept in sync with the middleware list by hand; both are short and stable.
const PUBLIC_PREFIXES = [
  "/login",
  "/register",
  "/verify",
  "/forgot-password",
  "/reset-password",
  "/guest",
  "/join",
];

/**
 * Silently restores a session on app boot.
 *
 * Middleware now lets a request through when the access token is gone but the HttpOnly
 * refresh token is still present (see proxy.ts). That alone would render a protected page
 * with no access token — useGetMe is gated on the cookie existing, and the axios refresh
 * flow only fires reactively on a 401, which may never come if the page makes no calls.
 * This component closes that gap: on a protected route with no access token, it calls the
 * refresh route once to mint one, then invalidates the user query so the shell populates.
 *
 * On failure the refresh route has already cleared the (dead) refresh-token cookie, so a
 * redirect to /login is terminal — no loop.
 */
export function SessionBootstrap() {
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const attempted = useRef(false);

  useEffect(() => {
    if (attempted.current) return;

    const isPublic = PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));
    if (isPublic) return;
    // Access token already here → normal flow, the interceptor handles expiry from now on.
    if (Cookies.get("accessToken")) return;
    // Guests authenticate with X-Guest-Token, never the account refresh flow.
    if (Cookies.get("isGuest") === "true") return;

    attempted.current = true;

    refreshAccessToken()
      .then(() => {
        // Token minted and the accessToken cookie is set by refreshAccessToken; nudge the
        // user query so the shell (name, avatar, KYC state) populates without a manual reload.
        queryClient.invalidateQueries({ queryKey: authKeys.me() });
      })
      .catch(() => {
        // Refresh token missing or expired — genuinely signed out.
        window.location.href = "/login";
      });
  }, [pathname, queryClient]);

  return null;
}
