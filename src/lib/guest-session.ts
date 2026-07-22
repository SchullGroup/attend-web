import Cookies from "js-cookie";

// Guest sessions are per-event and deliberately short-lived: the token lives in
// sessionStorage (not a cookie) so closing the tab ends the session and it never
// collides with a real signed-in account in another tab.
export const GUEST_TOKEN_KEY = "guestToken";
export const GUEST_EVENT_KEY = "guestEventId";
export const GUEST_NAME_KEY = "guestName";
// Flag only — never the token. proxy.ts runs on the server and can't see sessionStorage,
// so without a cookie it treats every guest as logged-out and bounces them to /login.
export const GUEST_FLAG_COOKIE = "isGuest";

export function storeGuestSession(token: string, eventId: string, name?: string) {
  sessionStorage.setItem(GUEST_TOKEN_KEY, token);
  sessionStorage.setItem(GUEST_EVENT_KEY, eventId);
  const trimmed = name?.trim();
  if (trimmed && trimmed.toLowerCase() !== "anonymous" && trimmed.toLowerCase() !== "guest") {
    sessionStorage.setItem(GUEST_NAME_KEY, trimmed);
  } else if (!sessionStorage.getItem(GUEST_NAME_KEY)) {
    sessionStorage.setItem(GUEST_NAME_KEY, trimmed || "Guest");
  }
  // Session cookie (no `expires`) so it dies with the browser, like the token it flags.
  Cookies.set(GUEST_FLAG_COOKIE, "true", { sameSite: "strict" });
}

export function clearGuestSession() {
  sessionStorage.removeItem(GUEST_TOKEN_KEY);
  sessionStorage.removeItem(GUEST_EVENT_KEY);
  sessionStorage.removeItem(GUEST_NAME_KEY);
  Cookies.remove(GUEST_FLAG_COOKIE);
}

/** Read the guest's display name (set at join time). Falls back to "Guest". */
export function getGuestName(): string {
  return sessionStorage.getItem(GUEST_NAME_KEY) || "Guest";
}

// AGMs live under /agm/live; everything else under /events/live. The backend's value is
// AGM_EGM (not "AGM"), and both spellings are accepted here so a change on either side
// can't silently route an AGM into the launches section.
export function guestLiveHref(eventId: string, eventType?: unknown) {
  const t = typeof eventType === "string" ? eventType.toUpperCase() : "";
  const isAgm = t === "AGM_EGM" || t === "AGM";
  return `${isAgm ? "/agm/live" : "/events/live"}?eventId=${eventId}&guest=true`;
}

// The public browse list and the join response both omit the event type, so guessing it
// put AGMs in the launches section. The guest view *does* carry it and we already hold a
// token by this point, so resolve it properly before routing — one request, once, at join.
export async function resolveGuestLiveHref(
  eventId: string,
  token: string,
  eventTypeHint?: unknown,
) {
  if (typeof eventTypeHint === "string" && eventTypeHint) {
    return guestLiveHref(eventId, eventTypeHint);
  }
  try {
    const { eventsClient } = await import("@/api/events/client");
    const view = await eventsClient.guestGetView(eventId, token);
    const data = view?.data as { eventType?: string; module?: string } | undefined;
    return guestLiveHref(eventId, data?.eventType ?? data?.module);
  } catch {
    // Never block entry on this — the generic live room still renders the stream.
    return guestLiveHref(eventId);
  }
}

// The join response shape isn't typed by the backend (it's a bare string map), so read
// the token and module defensively rather than assuming one key.
export function readJoinResult(res: any): { token?: string; eventType?: unknown; guestName?: string } {
  const data = res?.data ?? {};
  return {
    token: data.guestToken ?? data.token,
    eventType: data.eventType ?? data.module ?? data.event?.eventType,
    guestName: data.guestName ?? data.name,
  };
}
