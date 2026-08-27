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
 * Plain-text fallback for the PDF export, which just wraps and draws lines — it has no
 * HTML renderer. Turns block-level closes into newlines and `<li>` into a bullet before
 * stripping tags, so the result reads as a formatted document instead of one run-on line
 * (or, worse, literal "<h3>Resolutions</h3>" text).
 */
export function htmlToPlainText(html: string): string {
  const withBreaks = html
    // Newline before opening block tags so headings/paragraphs don't merge with preceding text
    .replace(/<(h[1-6])[\s>]/gi, "\n\n<$1 ")   // double break before headings
    .replace(/<(p|div|tr|hr)[\s>\/]/gi, "\n<$1 ") // single break before other blocks
    .replace(/<\/(p|div|h[1-6]|tr)>/gi, "\n")
    .replace(/<li[^>]*>/gi, "\n• ")
    .replace(/<\/li>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n");
  const sanitized = DOMPurify.sanitize(withBreaks, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
  // DOMPurify with an empty tag allowlist also decodes entities (&amp; → &), which a
  // regex-only strip wouldn't — reuse it here instead of a second bespoke decoder.
  return sanitized.replace(/\n{3,}/g, "\n\n").trim();
}

/**
 * The `minutes.content` field is a mix of **plain text** (admin-written body, newlines
 * as `\n`) and **HTML** (resolutions section appended by the backend). Rendering the raw
 * value via `dangerouslySetInnerHTML` collapses the plain-text newlines — this function
 * converts the plain-text portion into proper `<p>`/`<br>` HTML while leaving the
 * already-correct resolutions HTML untouched.
 */
export function normalizeMinutesContent(raw: string): string {
  if (!raw) return "";

  // If the content already opens with a block-level HTML element it's likely fully
  // HTML-formatted (e.g. future rich-text editor output) — return as-is.
  if (/^\s*<(p|div|h[1-6]|ul|ol|table)\b/i.test(raw)) return raw;

  // Find the boundary: the backend appends resolutions starting with a heading tag.
  const htmlMatch = raw.match(/<(h[1-6]|ol|ul|div|table)\b/i);

  if (!htmlMatch || htmlMatch.index === undefined) {
    // No HTML block elements → entire content is plain text.
    return plainTextToHtml(raw);
  }

  const plainPart = raw.substring(0, htmlMatch.index);
  const htmlPart = raw.substring(htmlMatch.index);

  return plainTextToHtml(plainPart) + htmlPart;
}

/** Convert plain text with `\n` newlines into simple HTML paragraphs. */
function plainTextToHtml(text: string): string {
  return text
    .split(/\n{2,}/)
    .filter((p) => p.trim())
    .map((para) => `<p>${para.replace(/\n/g, "<br>")}</p>`)
    .join("\n");
}
