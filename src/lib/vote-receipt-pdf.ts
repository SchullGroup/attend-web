import { jsPDF } from "jspdf";
import { formatDate } from "@/lib/utils";
import { registerNotoSans } from "@/lib/pdf-fonts";

// Shared vote-receipt PDF builder. Both the receipt page and proxy history download the
// SAME document via this function, so the two can never drift apart visually.
//
// Colors below are the exact hex values behind the Tailwind classes the on-screen receipt
// uses (Badge.tsx, agm/receipt/page.tsx) — kept as one match so the PDF reads as the same
// document as the page it was downloaded from, not a plainer stand-in for it.
const COLOR = {
  headerFill: "#059669", // emerald-600 — solid stand-in for the on-screen emerald-500→700 gradient
  emeraldBg: "#d1fae5", emeraldText: "#047857", // For
  redBg: "#fee2e2", redText: "#b91c1c", // Against
  slateBg: "#f1f5f9", slateText: "#334155", // Abstain
  purpleBg: "#f3e8ff", purpleText: "#7e22ce", // "Cast by proxy" / proxy accents
  purpleBorder: "#e9d5ff", purpleDeep: "#581c87",
  cardBorder: "#e2e8f0", // slate-200
  footerBg: "#f1f5f9", // slate-100
};

export interface ReceiptResolutionLine {
  num: number;
  title: string;
  /** Display label already normalised to "For" / "Against" / "Abstain". */
  vote: string;
  isPre?: boolean;
  castByProxy?: boolean;
  proxyName?: string;
}

export interface ReceiptProxyDetails {
  proxyName?: string;
  proxyEmail?: string;
  proxyPhone?: string;
  proxyCode?: string;
  assignedAt?: string;
}

export interface VoteReceiptPdfInput {
  meeting: string;
  /** When the votes were cast, pre-formatted for display. */
  date: string;
  reference: string;
  resolutions: ReceiptResolutionLine[];
  proxy?: ReceiptProxyDetails | null;
}

function voteTone(vote: string): { bg: string; text: string } {
  const v = (vote || "").toLowerCase();
  if (v === "for") return { bg: COLOR.emeraldBg, text: COLOR.emeraldText };
  if (v === "against") return { bg: COLOR.redBg, text: COLOR.redText };
  return { bg: COLOR.slateBg, text: COLOR.slateText };
}

/** Right-aligned rounded pill. Returns its height so the caller can lay out around it. */
function pill(
  doc: jsPDF,
  text: string,
  rightX: number,
  topY: number,
  fill: string,
  textColor: string,
  fontSize = 9.5,
): number {
  doc.setFont("NotoSans", "bold");
  doc.setFontSize(fontSize);
  const padX = 8;
  const h = fontSize + 8;
  const w = doc.getTextWidth(text) + padX * 2;
  const x = rightX - w;
  doc.setFillColor(fill);
  doc.roundedRect(x, topY, w, h, h / 2, h / 2, "F");
  doc.setTextColor(textColor);
  doc.text(text, x + padX, topY + h / 2 + fontSize * 0.33);
  doc.setTextColor(20);
  return h;
}

/** Build and save the receipt as a real PDF (drawn directly, so it's crisp and one page). */
export async function downloadVoteReceiptPdf(view: VoteReceiptPdfInput) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  await registerNotoSans(doc);
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 48;
  const contentW = pageW - margin * 2;
  let y = 0;

  // ── Header band ──────────────────────────────────────────────────────────
  const headerH = 96;
  doc.setFillColor(COLOR.headerFill);
  doc.rect(0, 0, pageW, headerH, "F");

  // Checkmark badge, mirroring the CheckCircle2 icon on-screen.
  const iconCx = margin + 15;
  const iconCy = headerH / 2;
  doc.setFillColor("#ffffff");
  doc.circle(iconCx, iconCy, 15, "F");
  doc.setDrawColor(COLOR.headerFill);
  doc.setLineWidth(2.4);
  doc.lines(
    [
      [4.5, 4],
      [7, -8],
    ],
    iconCx - 6.5,
    iconCy + 1,
  );

  const textX = margin + 42;
  doc.setTextColor("#ffffff");
  doc.setFont("NotoSans", "normal");
  doc.setFontSize(9);
  doc.setCharSpace(1.1);
  doc.text("VOTE RECEIPT", textX, iconCy - 5);
  doc.setCharSpace(0);
  doc.setFont("NotoSans", "bold");
  doc.setFontSize(15);
  doc.text("Your votes have been recorded", textX, iconCy + 15);
  doc.setTextColor(20);

  y = headerH + 34;

  // ── Meeting / cast at / reference ───────────────────────────────────────
  const halfW = contentW / 2 - 10;
  const miniField = (label: string, value: string, x: number, w: number) => {
    doc.setFont("NotoSans", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(130);
    doc.setCharSpace(0.6);
    doc.text(label.toUpperCase(), x, y);
    doc.setCharSpace(0);
    doc.setFont("NotoSans", "normal");
    doc.setFontSize(11.5);
    doc.setTextColor(20);
    const lines = doc.splitTextToSize(value || "—", w);
    doc.text(lines, x, y + 16);
    return lines.length * 14 + 16;
  };
  const meetingH = miniField("Meeting", view.meeting, margin, halfW);
  const castH = miniField("Cast at", view.date, margin + halfW + 20, halfW);
  y += Math.max(meetingH, castH) + 18;
  const refH = miniField("Reference", view.reference, margin, contentW);
  y += refH + 22;

  // ── Resolutions ──────────────────────────────────────────────────────────
  doc.setFont("NotoSans", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(130);
  doc.setCharSpace(0.6);
  doc.text("RESOLUTIONS", margin, y);
  doc.setCharSpace(0);
  doc.setTextColor(20);
  y += 14;

  if (view.resolutions.length === 0) {
    doc.setFont("NotoSans", "normal");
    doc.setFontSize(11);
    doc.setTextColor(110);
    doc.text("No votes recorded.", margin, y + 10);
    doc.setTextColor(20);
    y += 30;
  } else {
    const titleW = contentW - 24 - 130; // leave room for the pill column
    const rowPad = 14;

    // First pass: measure every row so the container border can be drawn as one piece.
    const rows = view.resolutions.map((r) => {
      doc.setFont("NotoSans", "bold");
      doc.setFontSize(11);
      const titleLines = doc.splitTextToSize(r.title, titleW);
      const textBlockH = 13 + titleLines.length * 14; // "Resolution N" line + wrapped title
      const pillsH = 17.5 + (r.castByProxy ? 4 + 15 : 0);
      const rowH = Math.max(textBlockH, pillsH) + rowPad * 2;
      return { r, titleLines, rowH };
    });
    const containerH = rows.reduce((sum, row) => sum + row.rowH, 0);

    doc.setDrawColor(COLOR.cardBorder);
    doc.setLineWidth(1);
    doc.roundedRect(margin, y, contentW, containerH, 10, 10, "S");

    let rowY = y;
    rows.forEach(({ r, titleLines, rowH }, i) => {
      const contentTop = rowY + rowPad;

      doc.setFont("NotoSans", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(130);
      doc.text(`Resolution ${r.num}`, margin + 14, contentTop + 8);

      doc.setFont("NotoSans", "bold");
      doc.setFontSize(11);
      doc.setTextColor(20);
      doc.text(titleLines, margin + 14, contentTop + 22);

      const toneColors = voteTone(r.vote);
      const label = r.isPre ? `${r.vote} (Pre-vote)` : r.vote;
      const pillH = pill(doc, label, pageW - margin - 14, contentTop, toneColors.bg, toneColors.text);
      if (r.castByProxy) {
        pill(
          doc,
          `Cast by ${r.proxyName || "Proxy"}`,
          pageW - margin - 14,
          contentTop + pillH + 4,
          COLOR.purpleBg,
          COLOR.purpleText,
          8,
        );
      }

      if (i < rows.length - 1) {
        doc.setDrawColor(COLOR.cardBorder);
        doc.setLineWidth(0.75);
        doc.line(margin, rowY + rowH, pageW - margin, rowY + rowH);
      }
      rowY += rowH;
    });

    y = rowY + 26;
  }

  // ── Appointed proxy ─────────────────────────────────────────────────────
  const proxy = view.proxy;
  if (proxy && proxy.proxyName) {
    doc.setFont("NotoSans", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(130);
    doc.setCharSpace(0.6);
    doc.text("APPOINTED PROXY", margin, y);
    doc.setCharSpace(0);
    doc.setTextColor(20);
    y += 14;

    const contact = [proxy.proxyEmail, proxy.proxyPhone].filter(Boolean).join("   ·   ");
    const cardPad = 14;
    const codeW = proxy.proxyCode ? 108 : 0;
    const nameBlockW = contentW - cardPad * 2 - (codeW ? codeW + 14 : 0) - 38;

    doc.setFont("NotoSans", "bold");
    doc.setFontSize(11);
    let cardH = cardPad * 2 + 18; // name line
    if (contact) cardH += 14;
    if (proxy.assignedAt) cardH += 13;

    doc.setFillColor("#f8fafc");
    doc.setDrawColor(COLOR.cardBorder);
    doc.setLineWidth(1);
    doc.roundedRect(margin, y, contentW, cardH, 10, 10, "FD");

    // Purple avatar swatch, mirroring the UserCheck icon tile on-screen.
    doc.setFillColor(COLOR.purpleBg);
    doc.roundedRect(margin + cardPad, y + cardPad, 26, 26, 7, 7, "F");
    doc.setDrawColor(COLOR.purpleText);
    doc.setLineWidth(1.6);
    doc.circle(margin + cardPad + 13, y + cardPad + 11, 4, "S");
    doc.line(margin + cardPad + 8, y + cardPad + 19, margin + cardPad + 18, y + cardPad + 19);

    const px = margin + cardPad + 38;
    let py = y + cardPad + 9;
    doc.setFont("NotoSans", "bold");
    doc.setFontSize(11);
    doc.setTextColor(20);
    doc.text(doc.splitTextToSize(proxy.proxyName, nameBlockW), px, py);
    py += 15;
    if (contact) {
      doc.setFont("NotoSans", "normal");
      doc.setFontSize(9);
      doc.setTextColor(110);
      doc.text(doc.splitTextToSize(contact, nameBlockW), px, py);
      py += 14;
    }
    if (proxy.assignedAt) {
      doc.setFontSize(8.5);
      doc.setTextColor(130);
      doc.text(`Appointed ${formatDate(proxy.assignedAt)}`, px, py);
    }
    doc.setTextColor(20);

    if (proxy.proxyCode) {
      const chipX = pageW - margin - cardPad - codeW;
      const chipY = y + (cardH - 34) / 2;
      doc.setFillColor(COLOR.purpleBg);
      doc.setDrawColor(COLOR.purpleBorder);
      doc.setLineWidth(1);
      doc.roundedRect(chipX, chipY, codeW, 34, 8, 8, "FD");
      doc.setFont("NotoSans", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(COLOR.purpleText);
      doc.setCharSpace(0.6);
      doc.text("PROXY CODE", chipX + codeW / 2, chipY + 12, { align: "center" });
      doc.setCharSpace(0);
      doc.setFontSize(12.5);
      doc.setTextColor(COLOR.purpleDeep);
      doc.text(proxy.proxyCode, chipX + codeW / 2, chipY + 26, { align: "center" });
      doc.setTextColor(20);
    }

    y += cardH + 24;
  }

  // ── Footer disclaimer ────────────────────────────────────────────────────
  doc.setFont("NotoSans", "normal");
  doc.setFontSize(9);
  const footer = doc.splitTextToSize(
    "This receipt is timestamped and serves as evidence of your participation and votes at the meeting.",
    contentW - 28,
  );
  const footerH = footer.length * 13 + 24;
  doc.setFillColor(COLOR.footerBg);
  doc.roundedRect(margin, y, contentW, footerH, 8, 8, "F");
  doc.setTextColor(110);
  doc.text(footer, margin + 14, y + 18);
  doc.setTextColor(20);

  doc.save(`vote-receipt-${view.reference}.pdf`);
}

/** Normalise an API choice value to the receipt's display label. */
export function voteLabel(c: string) {
  const u = (c || "").toUpperCase();
  return u === "FOR" ? "For" : u === "AGAINST" ? "Against" : "Abstain";
}
