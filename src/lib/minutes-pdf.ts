import { jsPDF } from "jspdf";
import { registerNotoSans } from "@/lib/pdf-fonts";

// ── Colour palette ────────────────────────────────────────────────────────────
// Exact hex values behind the Tailwind classes used on the minutes view and
// vote-receipt page — kept in sync so both PDFs feel like the same family.
const COLOR = {
  headerFill: "#059669",   // emerald-600 (solid stand-in for the on-screen gradient)
  headerIcon: "#34d399",   // emerald-400 (icon tile fill, simulates white/20 overlay)
  passedBg: "#d1fae5",  passedFg: "#047857",   // emerald
  failedBg: "#fee2e2",  failedFg: "#b91c1c",   // red
  neutralBg: "#f1f5f9", neutralFg: "#334155",   // slate (Not concluded / pending)
  border: "#e2e8f0",    // slate-200
  footerBg: "#f8fafc",  // slate-50
};

// ── Types ─────────────────────────────────────────────────────────────────────
interface ParsedResolution {
  num: number;
  title: string;
  forCount: number;
  againstCount: number;
  abstainCount: number;
  result: string;
}

export interface MinutesPdfInput {
  /** Display name for the header — usually the company / register name. */
  title: string;
  /** Pre-formatted date string (e.g. "27 Aug 2026"). */
  finalisedDate: string;
  /** Raw `minutes.content` (mixed plain-text body + HTML resolutions). */
  content: string;
  /** Registrar / organiser name for the footer attribution. */
  organiser?: string;
  /** Passed through to the filename. */
  eventId?: string;
}

// ── Content parsing ───────────────────────────────────────────────────────────
/**
 * Split the raw content into a plain-text body and structured resolution data.
 * The backend appends resolutions as an HTML heading + ordered list after the
 * admin-written plain-text body.
 */
function parseContent(content: string): {
  bodyText: string;
  resolutions: ParsedResolution[];
} {
  if (!content) return { bodyText: "", resolutions: [] };

  // The resolutions block starts with an HTML heading tag.
  const headingIdx = content.search(/<h[1-6]\b/i);

  const bodyRaw = headingIdx > 0 ? content.substring(0, headingIdx) : content;
  const resHtml = headingIdx > 0 ? content.substring(headingIdx) : "";

  // Body → decode any stray HTML / entities, preserve newlines.
  const bodyText = bodyRaw
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div)>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#8358;/g, "₦")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/&nbsp;/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  // Resolutions → extract <li> items and parse vote / result data.
  const resolutions: ParsedResolution[] = [];
  if (resHtml) {
    const liRe = /<li[^>]*>([\s\S]*?)<\/li>/gi;
    let m: RegExpExecArray | null;
    let num = 1;
    while ((m = liRe.exec(resHtml)) !== null) {
      const raw = m[1]
        .replace(/<br\s*\/?>/gi, " ")
        .replace(/<\/(li|p|div|td|th)>/gi, " ")
        .replace(/<(ol|ul)[^>]*>/gi, " ")
        .replace(/<[^>]+>/g, "")
        .replace(/&amp;/g, "&")
        .replace(/&#8358;/g, "₦")
        .replace(/&mdash;/g, "—")
        .replace(/&ndash;/g, "–")
        .replace(/&nbsp;/g, " ")
        .replace(/\s{2,}/g, " ")
        .trim();

      // Expected shapes:
      // "Title — For: 0, Against: 1, Abstain: 0 — Result: FAILED (0.0% for)"
      // "Title — For: 0, Against: 0, Abstain: 0"   (no Result for candidate sub-items)
      const parts = raw.match(
        /^(.*?)\s*[—–\u2014\u2013-]{1,3}\s*For:\s*(\d+),?\s*Against:\s*(\d+),?\s*Abstain:\s*(\d+)(?:\s*[—–\u2014\u2013-]{1,3}\s*Result:\s*(.+))?$/i,
      );

      resolutions.push(
        parts
          ? {
              num,
              title: parts[1].trim(),
              forCount: +parts[2],
              againstCount: +parts[3],
              abstainCount: +parts[4],
              result: parts[5]?.trim() || "—",
            }
          : { num, title: raw, forCount: 0, againstCount: 0, abstainCount: 0, result: "—" },
      );
      num++;
    }
  }

  return { bodyText, resolutions };
}

// ── Drawing helpers ───────────────────────────────────────────────────────────
function resultTone(result: string): { bg: string; fg: string } {
  const u = result.toUpperCase();
  if (u.startsWith("PASSED")) return { bg: COLOR.passedBg, fg: COLOR.passedFg };
  if (u.startsWith("FAILED")) return { bg: COLOR.failedBg, fg: COLOR.failedFg };
  return { bg: COLOR.neutralBg, fg: COLOR.neutralFg };
}

/** Right-aligned rounded pill. Returns the pill's height. */
function pill(
  doc: jsPDF,
  label: string,
  rightX: number,
  topY: number,
  fill: string,
  fg: string,
  fontSize = 8,
): number {
  doc.setFont("NotoSans", "bold");
  doc.setFontSize(fontSize);
  const padX = 7;
  const h = fontSize + 7;
  const w = doc.getTextWidth(label) + padX * 2;
  const x = rightX - w;
  doc.setFillColor(fill);
  doc.roundedRect(x, topY, w, h, h / 2, h / 2, "F");
  doc.setTextColor(fg);
  doc.text(label, x + padX, topY + h / 2 + fontSize * 0.33);
  doc.setTextColor(20);
  return h;
}

// ── Main export ───────────────────────────────────────────────────────────────
/**
 * Build and save the AGM minutes as a styled PDF that mirrors the in-app view.
 * Uses the same jsPDF direct-drawing approach as `vote-receipt-pdf.ts` — no new
 * dependencies, and the two PDFs share the same colour palette / visual language.
 */
export async function downloadMinutesPdf(input: MinutesPdfInput): Promise<void> {
  const { bodyText, resolutions } = parseContent(input.content);

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  await registerNotoSans(doc);

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 48;
  const contentW = pageW - margin * 2;
  let y = 0;

  /** Add a page when the next element won't fit. */
  const ensureSpace = (needed: number) => {
    if (y + needed > pageH - margin) {
      doc.addPage();
      y = margin;
    }
  };

  // ── Header band ───────────────────────────────────────────────────────────
  const headerH = 90;
  doc.setFillColor(COLOR.headerFill);
  doc.rect(0, 0, pageW, headerH, "F");

  // Icon tile (rounded square, lighter emerald — simulates the frosted glass icon bg)
  const iconCx = margin + 14;
  const iconCy = headerH / 2;
  doc.setFillColor(COLOR.headerIcon);
  doc.roundedRect(iconCx - 12, iconCy - 12, 24, 24, 7, 7, "F");
  // Draw three horizontal lines (document / FileText icon)
  doc.setDrawColor("#ffffff");
  doc.setLineWidth(1.6);
  doc.line(iconCx - 5, iconCy - 3, iconCx + 5, iconCy - 3);
  doc.line(iconCx - 5, iconCy + 2, iconCx + 5, iconCy + 2);
  doc.line(iconCx - 5, iconCy + 7, iconCx + 2, iconCy + 7);

  const tx = margin + 40;
  doc.setTextColor("#ffffff");
  doc.setFont("NotoSans", "normal");
  doc.setFontSize(8.5);
  doc.setCharSpace(1.1);
  doc.text("AGM MINUTES", tx, iconCy - 10);
  doc.setCharSpace(0);

  doc.setFont("NotoSans", "bold");
  doc.setFontSize(15);
  const maxTitleW = pageW - tx - margin;
  const headerTitle: string[] = doc.splitTextToSize(
    input.title || "Minutes",
    maxTitleW,
  );
  doc.text(headerTitle[0], tx, iconCy + 6);

  if (input.finalisedDate) {
    doc.setFont("NotoSans", "normal");
    doc.setFontSize(9);
    doc.text(`Finalised ${input.finalisedDate}`, tx, iconCy + 20);
  }

  doc.setTextColor(20);
  y = headerH + 30;

  // ── Body text ─────────────────────────────────────────────────────────────
  doc.setFont("NotoSans", "normal");
  doc.setFontSize(10.5);
  doc.setTextColor(40);

  const paragraphs = bodyText.split(/\n{2,}/).filter((p) => p.trim());
  for (const para of paragraphs) {
    const lines: string[] = doc.splitTextToSize(para.trim(), contentW);
    for (const line of lines) {
      ensureSpace(15);
      doc.text(line, margin, y);
      y += 14;
    }
    y += 6; // paragraph gap
  }

  // ── Resolutions ───────────────────────────────────────────────────────────
  if (resolutions.length > 0) {
    y += 8;
    ensureSpace(30);

    // Section label
    doc.setFont("NotoSans", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(130);
    doc.setCharSpace(0.6);
    doc.text("RESOLUTIONS", margin, y);
    doc.setCharSpace(0);
    doc.setTextColor(20);
    y += 16;

    // Measure every row so we can decide between one container vs per-card.
    const rowPad = 12;
    const pillReserve = 120;          // horizontal space reserved for the result pill
    const titleMaxW = contentW - 28 - pillReserve;

    const rows = resolutions.map((r) => {
      doc.setFont("NotoSans", "bold");
      doc.setFontSize(10.5);
      const titleLines: string[] = doc.splitTextToSize(r.title, titleMaxW);
      // label (18) + title block (titleLines * 14) + tallies line (16) + vertical padding
      const rowH = 18 + titleLines.length * 14 + 16 + rowPad * 2;
      return { r, titleLines, rowH };
    });

    const totalH = rows.reduce((s, row) => s + row.rowH, 0);

    if (y + totalH <= pageH - margin) {
      // ── All rows fit: single rounded container with dividers (vote-receipt style)
      doc.setDrawColor(COLOR.border);
      doc.setLineWidth(1);
      doc.roundedRect(margin, y, contentW, totalH, 10, 10, "S");

      let rowY = y;
      rows.forEach(({ r, titleLines, rowH }, i) => {
        drawResolutionRow(doc, r, titleLines, rowY, rowPad, margin, contentW, pageW);
        rowY += rowH;
        if (i < rows.length - 1) {
          doc.setDrawColor(COLOR.border);
          doc.setLineWidth(0.75);
          doc.line(margin, rowY, pageW - margin, rowY);
        }
      });
      y = rowY;
    } else {
      // ── Overflow: individual rounded cards so page breaks are clean.
      rows.forEach(({ r, titleLines, rowH }) => {
        ensureSpace(rowH);
        doc.setDrawColor(COLOR.border);
        doc.setLineWidth(1);
        doc.roundedRect(margin, y, contentW, rowH, 8, 8, "S");
        drawResolutionRow(doc, r, titleLines, y, rowPad, margin, contentW, pageW);
        y += rowH + 4;
      });
    }

    y += 20;
  }

  // ── Registrar footer ──────────────────────────────────────────────────────
  if (input.organiser) {
    ensureSpace(36);
    doc.setDrawColor(COLOR.border);
    doc.setLineWidth(0.75);
    doc.line(margin, y, pageW - margin, y);
    y += 16;
    doc.setFont("NotoSans", "normal");
    doc.setFontSize(9);
    doc.setTextColor(130);
    doc.text(`Registered by ${input.organiser}`, margin, y);
    doc.setTextColor(20);
  }

  doc.save(`agm-minutes-${input.eventId || "document"}.pdf`);
}

// ── Per-row drawing ─────────────────────────────────────────────────────────
function drawResolutionRow(
  doc: jsPDF,
  r: ParsedResolution,
  titleLines: string[],
  rowTop: number,
  pad: number,
  margin: number,
  _contentW: number,
  pageW: number,
) {
  let ry = rowTop + pad;

  // "Resolution N" small-caps label
  doc.setFont("NotoSans", "normal");
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text(`Resolution ${r.num}`, margin + 14, ry + 8);

  // Result pill — top-right corner of the row
  if (r.result && r.result !== "—") {
    const tone = resultTone(r.result);
    const label = r.result.replace(/\s*\(.*\)$/, "").toUpperCase();
    pill(doc, label, pageW - margin - 14, ry, tone.bg, tone.fg, 8);
  }

  ry += 18;

  // Bold title (wraps across multiple lines)
  doc.setFont("NotoSans", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(20);
  doc.text(titleLines, margin + 14, ry + 2);
  ry += titleLines.length * 14 + 2;

  // Vote tallies — muted, compact
  doc.setFont("NotoSans", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(130);
  doc.text(
    `For: ${r.forCount}    Against: ${r.againstCount}    Abstain: ${r.abstainCount}`,
    margin + 14,
    ry + 2,
  );
  doc.setTextColor(20);
}
