import { jsPDF } from "jspdf";
import { formatDate } from "@/lib/utils";

// Shared vote-receipt PDF builder. Both the receipt page and proxy history download the
// SAME document via this function, so the two can never drift apart visually.

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

/** Build and save the receipt as a real PDF (drawn directly, so it's crisp and one page). */
export function downloadVoteReceiptPdf(view: VoteReceiptPdfInput) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 48;
  let y = 64;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Vote Receipt", margin, y);
  y += 20;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(90);
  doc.text("Your votes have been recorded", margin, y);
  doc.setTextColor(20);
  y += 30;

  const field = (label: string, value: string) => {
    doc.setFontSize(9);
    doc.setTextColor(130);
    doc.text(label.toUpperCase(), margin, y);
    y += 14;
    doc.setFontSize(12);
    doc.setTextColor(20);
    const lines = doc.splitTextToSize(value || "—", pageW - margin * 2);
    doc.text(lines, margin, y);
    y += lines.length * 15 + 12;
  };

  field("Meeting", view.meeting);
  field("Cast at", view.date);
  field("Reference", view.reference);

  doc.setFontSize(9);
  doc.setTextColor(130);
  doc.text("RESOLUTIONS", margin, y);
  y += 16;
  doc.setTextColor(20);
  if (view.resolutions.length === 0) {
    doc.setFontSize(11);
    doc.text("No votes recorded.", margin, y);
    y += 18;
  } else {
    view.resolutions.forEach((r) => {
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      const title = doc.splitTextToSize(`Resolution ${r.num}: ${r.title}`, pageW - margin * 2 - 140);
      doc.text(title, margin, y);
      doc.setFont("helvetica", "normal");
      const proxySuffix = r.castByProxy ? ` (via ${r.proxyName || "proxy"})` : "";
      const textLabel = r.isPre ? `${r.vote} (Pre-vote)${proxySuffix}` : `${r.vote}${proxySuffix}`;
      doc.text(textLabel, pageW - margin, y, { align: "right" });
      y += title.length * 15 + 8;
    });
  }
  y += 10;

  const proxy = view.proxy;
  if (proxy && proxy.proxyName) {
    doc.setFontSize(9);
    doc.setTextColor(130);
    doc.text("PROXY DETAILS", margin, y);
    y += 16;
    doc.setFontSize(12);
    doc.setTextColor(20);
    const codeStr = proxy.proxyCode ? `  ·  Code: ${proxy.proxyCode}` : "";
    doc.text(`${proxy.proxyName}${codeStr}`, margin, y);
    y += 16;
    const contact = [proxy.proxyEmail, proxy.proxyPhone].filter(Boolean).join("  ·  ");
    if (contact) {
      doc.setFontSize(10);
      doc.setTextColor(110);
      doc.text(contact, margin, y);
      y += 14;
    }
    if (proxy.assignedAt) {
      doc.setFontSize(9);
      doc.setTextColor(130);
      doc.text(`Appointed ${formatDate(proxy.assignedAt)}`, margin, y);
      y += 16;
    }
    doc.setTextColor(20);
  }

  y += 12;
  doc.setFontSize(9);
  doc.setTextColor(130);
  const footer = doc.splitTextToSize(
    "This receipt is timestamped and serves as evidence of your participation and votes at the meeting.",
    pageW - margin * 2,
  );
  doc.text(footer, margin, y);

  doc.save(`vote-receipt-${view.reference}.pdf`);
}

/** Normalise an API choice value to the receipt's display label. */
export function voteLabel(c: string) {
  const u = (c || "").toUpperCase();
  return u === "FOR" ? "For" : u === "AGAINST" ? "Against" : "Abstain";
}
