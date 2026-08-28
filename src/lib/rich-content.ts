import DOMPurify from "isomorphic-dompurify";

/**
 * AGM minutes `content` used to be a plain string an admin typed by hand. As of the
 * 2026-08-18 backend change, finalising minutes now appends a "Resolutions" section
 * directly into that same field as HTML markup (title, tallies, PASSED/FAILED outcome
 * per resolution). Rendering it as plain text (the old behaviour) shows the raw tags as
 * visible text instead of formatting them — this sanitizes it for safe HTML rendering.
 *
 * Restricted to a narrow allowlist: this is a report-style document (headings, lists,
 * emphasis, tables), not a place that needs images, links, or scripts.
 */
export function sanitizeMinutesHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "p", "br", "div", "span",
      "h1", "h2", "h3", "h4", "h5", "h6",
      "ul", "ol", "li",
      "strong", "b", "em", "i", "u",
      "table", "thead", "tbody", "tr", "th", "td",
      "hr",
    ],
    ALLOWED_ATTR: [],
  });
}

/**
 * The `minutes.content` field is a mix of **plain text** (admin-written body) and
 * **HTML** (resolutions section appended by the backend). The plain-text body arrives
 * with inconsistent line breaks — sometimes `\n\n` between paragraphs, often the whole
 * thing as one run-on block with the agenda items ("1. Opening  2. Attendance  …")
 * flowing inline. Rendering that raw via `dangerouslySetInnerHTML` collapses whatever
 * breaks there are into a wall of text.
 *
 * This converts the plain-text portion into real `<p>` paragraphs — splitting on blank
 * lines, single newlines, and inline numbered agenda markers — while leaving the
 * already-correct resolutions HTML untouched.
 */
export function normalizeMinutesContent(raw: string): string {
  if (!raw) return "";

  // If the content already opens with a block-level HTML element it's likely fully
  // HTML-formatted (e.g. future rich-text editor output) — return as-is.
  if (/^\s*<(p|div|h[1-6]|ul|ol|table)\b/i.test(raw)) return raw;

  // Find the boundary: the backend appends resolutions starting with a block element.
  const htmlMatch = raw.match(/<(h[1-6]|ol|ul|div|table)\b/i);

  if (!htmlMatch || htmlMatch.index === undefined) {
    // No HTML block elements → entire content is plain text.
    return plainTextToHtml(raw);
  }

  const plainPart = raw.substring(0, htmlMatch.index);
  const htmlPart = raw.substring(htmlMatch.index);

  return plainTextToHtml(plainPart) + htmlPart;
}

/**
 * Convert an admin-typed plain-text body into simple HTML paragraphs. The output is
 * passed straight through `sanitizeMinutesHtml`, so any stray markup here is made safe
 * downstream — this step only has to get the *structure* right.
 */
function plainTextToHtml(text: string): string {
  const normalised = text
    .replace(/\r\n/g, "\n")
    // Strip any stray tags the admin may have pasted in the plain part.
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div)>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    // Decode the few entities the backend emits so glyphs like ₦ render.
    .replace(/&#8358;/g, "₦")
    .replace(/&(mdash|ndash);/g, (_, d) => (d === "mdash" ? "—" : "–"))
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    // Break before inline numbered agenda items — "… attendees. 1. Opening …" — so each
    // becomes its own paragraph. Requires "<n>. <Capital>" to avoid splitting on dates
    // or figures like "31 December 2025".
    .replace(/([^\n])\s+(\d{1,2}\.\s+[A-Z])/g, "$1\n\n$2")
    .trim();

  return normalised
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((para) => `<p>${para}</p>`)
    .join("\n");
}
