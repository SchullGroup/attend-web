import type { KYCStatus } from "./user-store";

/**
 * Roles that describe an ordinary event-goer rather than staff.
 *
 * Only these are relabelled by KYC state. A CLIENT_ADMIN or JUDGE keeps its own title however
 * far through verification they happen to be. An empty role counts as a participant, since the
 * participant app is the only thing serving these screens.
 */
const PARTICIPANT_ROLES = new Set(["", "ATTENDEE", "PARTICIPANT", "MEMBER"]);

/** "CLIENT_ADMIN" → "Client Admin". Backend roles are SCREAMING_SNAKE_CASE. */
function titleCase(v: string): string {
  return v
    .toLowerCase()
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/**
 * What to call the signed-in user on their own screens.
 *
 * Full KYC reads as "Shareholder"; anything short of it stays "Attendee". `role` alone can't
 * express that — the backend sends a flat "ATTENDEE" whatever the verification state, so the
 * distinction has to be made here.
 *
 * This is a label about *verification*, not about the share register. The register lives on the
 * backend and is matched by email/phone/BVN, so someone fully verified who holds no shares still
 * reads as a shareholder on these screens. Nothing is entitled by this string: voting rights and
 * share weighting come from the register and quorum payloads, never from here.
 */
export function accountRoleLabel(role?: string, kycStatus?: KYCStatus): string {
  const raw = (role || "").trim().toUpperCase();
  if (!PARTICIPANT_ROLES.has(raw)) return titleCase(raw);
  return kycStatus === "full" ? "Shareholder" : "Attendee";
}
