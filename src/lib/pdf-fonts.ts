import type { jsPDF } from "jspdf";

/**
 * jsPDF's built-in "helvetica" is a standard PDF font restricted to WinAnsi/Latin-1 — it has
 * no glyph for ₦ (U+20A6) or most other non-Latin-1 characters. Resolution/minutes text is
 * admin-typed and routinely includes the Naira sign (dividend amounts), so that gap turned
 * real text into visibly broken output (letter-spaced garbage, overlapping the next column) —
 * it wasn't a layout bug, the font just had nothing to draw for that codepoint.
 *
 * Noto Sans is built for full Unicode coverage, so embedding it removes this whole class of
 * bug rather than special-casing ₦. The two TTFs (~560KB each) live in /public and are fetched
 * only when a PDF is actually generated — never part of the app's JS bundle.
 */

// Fetching + base64-encoding the TTFs is the expensive part and the bytes never change, so
// that's what's cached across calls. VFS/font registration itself is per-jsPDF-instance and
// has to be redone for every new `doc` — it's cheap (no I/O), so that's fine.
let base64Fonts: Promise<{ regular: string; bold: string }> | null = null;

async function fetchAsBase64(url: string): Promise<string> {
  const res = await fetch(url);
  const bytes = new Uint8Array(await res.arrayBuffer());
  // String.fromCharCode.apply on the whole array can blow the call stack past ~100k
  // bytes — these fonts are ~570KB, so build the string in chunks instead.
  const CHUNK = 8192;
  let binary = "";
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return btoa(binary);
}

/** Registers "NotoSans" (normal + bold) on `doc` so callers can `doc.setFont("NotoSans", ...)`. */
export async function registerNotoSans(doc: jsPDF): Promise<void> {
  if (!base64Fonts) {
    base64Fonts = Promise.all([
      fetchAsBase64("/fonts/NotoSans-Regular.ttf"),
      fetchAsBase64("/fonts/NotoSans-Bold.ttf"),
    ]).then(([regular, bold]) => ({ regular, bold }));
  }
  const { regular, bold } = await base64Fonts;
  doc.addFileToVFS("NotoSans-Regular.ttf", regular);
  doc.addFont("NotoSans-Regular.ttf", "NotoSans", "normal");
  doc.addFileToVFS("NotoSans-Bold.ttf", bold);
  doc.addFont("NotoSans-Bold.ttf", "NotoSans", "bold");
}
