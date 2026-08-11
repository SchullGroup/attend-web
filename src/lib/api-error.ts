/**
 * Pull the best user-facing sentence out of a failed API response.
 *
 * The backend is not consistent about which field carries the human-readable reason:
 * most endpoints use `message`, but the OTP endpoints documented on 2026-08-11 specify
 * `error` ("OTP expired", "Too many attempts"). Reading only `message` meant those fell
 * through to a generic fallback that actively misleads — "check your code and try again"
 * is wrong advice for someone who has been locked out after five wrong guesses.
 *
 * Backend prose always wins over the table below. The backend knows things we don't —
 * with the new 5-attempt cap its INVALID_OTP text may carry the remaining count, and
 * overriding that with our own wording would discard the most useful part. CODE_MESSAGES
 * is only a safety net for a recognised `code` that arrives with no prose at all.
 */
const CODE_MESSAGES: Record<string, string> = {
  OTP_NOT_FOUND: "That code is no longer valid. Please request a new one.",
  OTP_EXPIRED: "That code has expired. Please request a new one.",
  INVALID_OTP: "That code is incorrect. Please check and try again.",
  TOO_MANY_ATTEMPTS:
    "Too many incorrect attempts. Please request a new code to continue.",
  SESSION_REVOKED: "Your session was ended because your account was used on another device.",
};

/** Only a plain string is safe to render — an object here would crash React. */
function text(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v : null;
}

export function apiErrorMessage(err: any, fallback: string): string {
  const body = err?.response?.data ?? {};

  const prose = text(body.message) ?? text(body.error);
  if (prose) return prose;

  const code = String(body.code ?? "").toUpperCase();
  if (CODE_MESSAGES[code]) return CODE_MESSAGES[code];

  return text(err?.message) ?? fallback;
}
