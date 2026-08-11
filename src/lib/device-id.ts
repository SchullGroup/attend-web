const DEVICE_ID_KEY = "attendDeviceId";

/**
 * A stable per-install identifier sent with every login.
 *
 * The backend uses it to enforce single-device sessions: logging in with a different
 * `deviceId` immediately invalidates the previous device's access token. Omitting the
 * field skips the feature entirely, so this must be sent on every login to work at all.
 *
 * localStorage, not sessionStorage — sessionStorage dies with the tab, so every new tab
 * would look like a new device and log the user out of the one they were using.
 *
 * Clearing site data, a different browser, or incognito all read as a new device. That's
 * the accepted trade-off for a client-generated id; there is no stable browser identifier
 * that isn't also a fingerprinting vector.
 */
export function getDeviceId(): string {
  if (typeof window === "undefined") return "";

  try {
    const existing = localStorage.getItem(DEVICE_ID_KEY);
    if (existing) return existing;

    // randomUUID needs a secure context — it's absent on plain http:// origins, which
    // includes some LAN testing setups. Fall back rather than throw: a weaker id still
    // identifies the device, and losing the session feature beats breaking login.
    const id =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `dev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

    localStorage.setItem(DEVICE_ID_KEY, id);
    return id;
  } catch {
    // Storage can throw outright when cookies/storage are blocked. Login still has to
    // work, so give up on the device id rather than propagate.
    return "";
  }
}
