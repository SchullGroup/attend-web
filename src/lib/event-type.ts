/**
 * Display labels for the backend's `eventType` enum.
 *
 * The API enum is `AGM_EGM | PRODUCT_LAUNCH | INNOVATION_CHALLENGE | HACKATHON | GENERAL_EVENT`
 * (confirmed against the OpenAPI spec, 2026-08-11). Rendering those raw puts "AGM_EGM" on a card,
 * so every surface that shows a type badge goes through here.
 *
 * The short aliases are included because some payloads and older UI code use them
 * interchangeably with the full enum values.
 */
const TYPE_LABELS: Record<string, string> = {
  AGM_EGM: "AGM",
  AGM: "AGM",
  PRODUCT_LAUNCH: "Launch",
  LAUNCH: "Launch",
  INNOVATION_CHALLENGE: "Innovation",
  HACKATHON: "Hackathon",
  GENERAL_EVENT: "General",
  GENERAL: "General",
};

/**
 * The badge text for an event type, or `null` when the type is unknown.
 *
 * Returning null rather than defaulting to "General" is deliberate: a missing `eventType` means we
 * do not know what the event is, and an AGM mislabelled as a General event is worse than no badge
 * at all. Callers should render nothing when this is null.
 */
export function eventTypeLabel(eventType?: string | null): string | null {
  const key = (eventType || "").trim().toUpperCase();
  if (!key) return null;
  return TYPE_LABELS[key] ?? null;
}

/**
 * Last-resort type guess from an event's title, for payloads that omit `eventType` entirely —
 * `GET /api/v1/guest/events` returns only id, title, date, startTime and branding.
 *
 * Only ever returns a type on a positive keyword match. There is no "everything else is General"
 * branch, because that is what put a GENERAL badge on an AGM called "Guest Access Testing".
 */
export function guessEventTypeFromTitle(title?: string): string | null {
  const t = (title || "").toUpperCase();
  if (/\bAGM\b|\bEGM\b|ANNUAL GENERAL|GENERAL MEETING|SHAREHOLDER/.test(t)) return "AGM";
  if (/LAUNCH|UNVEIL/.test(t)) return "Launch";
  if (/HACKATHON/.test(t)) return "Hackathon";
  if (/CHALLENGE|INNOVATION/.test(t)) return "Innovation";
  return null;
}
