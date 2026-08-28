/**
 * Turn a live DOM node into a downloaded PDF that looks *exactly* like what's on
 * screen — same colours, fonts and layout — because it's a high-resolution
 * snapshot of the real element, not a hand-drawn approximation.
 *
 * Every document that has an in-app counterpart (AGM minutes, vote receipt,
 * hackathon certificate) downloads through here so the file can never drift from
 * the page it came from.
 *
 * The PDF is a single page sized to the element, so there's no A4 pagination
 * cutting through a card — it reads as one continuous document, matching the
 * scrollable view.
 *
 * Returns `true` on success. On failure it shows the user an alert and returns
 * `false` rather than throwing — the caller just needs to clear its loading state.
 */

/**
 * Swap every cross-origin <img> in `node` for an inlined data: URI so html2canvas can
 * actually read its pixels (a plain cross-origin image taints the canvas and comes out
 * blank). Cross-origin fetches go through our same-origin /api/proxy-image. Returns a
 * function that puts the original `src` values back.
 */
async function inlineImages(node: HTMLElement): Promise<() => void> {
  const restores: Array<() => void> = [];

  await Promise.all(
    Array.from(node.querySelectorAll("img")).map(async (img) => {
      const src = img.getAttribute("src");
      if (!src || src.startsWith("data:")) return;

      try {
        const sameOrigin = new URL(src, location.href).origin === location.origin;
        const fetchUrl = sameOrigin
          ? src
          : `/api/proxy-image?url=${encodeURIComponent(src)}`;

        const res = await fetch(fetchUrl);
        if (!res.ok) return;
        const blob = await res.blob();
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const fr = new FileReader();
          fr.onload = () => resolve(fr.result as string);
          fr.onerror = () => reject(fr.error);
          fr.readAsDataURL(blob);
        });

        img.setAttribute("src", dataUrl);
        restores.push(() => img.setAttribute("src", src));
        if (typeof img.decode === "function") {
          try {
            await img.decode();
          } catch {
            /* a failed decode just means html2canvas skips it — no worse than before */
          }
        }
      } catch {
        /* leave this image as-is */
      }
    }),
  );

  return () => restores.forEach((restore) => restore());
}

export async function downloadNodeAsPdf(
  node: HTMLElement,
  filename: string,
): Promise<boolean> {
  // Elements marked data-pdf-hide (action buttons, "Back" links) are chrome, not
  // part of the document — drop them from the snapshot, then restore.
  const hidden = Array.from(
    node.querySelectorAll<HTMLElement>("[data-pdf-hide]"),
  );
  const prev = hidden.map((el) => el.style.display);
  hidden.forEach((el) => {
    el.style.display = "none";
  });

  // The card's rounded corners + shadow are there so it floats on the app page. In the
  // PDF the card *is* the page, so those leave transparent notches at the corners and a
  // ragged edge — flatten them for the capture, then restore.
  const rootStyle = node.style;
  const savedRoot = {
    borderRadius: rootStyle.borderRadius,
    boxShadow: rootStyle.boxShadow,
  };
  rootStyle.borderRadius = "0";
  rootStyle.boxShadow = "none";

  let restoreImages: () => void = () => {};

  try {
    // Browser-only libraries — load them lazily so they never run during SSR and stay
    // out of the initial page bundle.
    const [{ jsPDF }, { default: html2canvas }] = await Promise.all([
      import("jspdf"),
      import("html2canvas-pro"),
    ]);

    restoreImages = await inlineImages(node);

    const scale = Math.min(3, window.devicePixelRatio > 1 ? 3 : 2);
    const canvas = await html2canvas(node, {
      scale,
      backgroundColor: "#ffffff",
      useCORS: true,
      logging: false,
    });

    const w = canvas.width / scale;
    const h = canvas.height / scale;
    const doc = new jsPDF({
      unit: "px",
      format: [w, h],
      orientation: w > h ? "landscape" : "portrait",
      hotfixes: ["px_scaling"],
    });
    doc.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, w, h, undefined, "FAST");
    doc.save(filename.endsWith(".pdf") ? filename : `${filename}.pdf`);
    return true;
  } catch (err) {
    console.error("PDF download failed", err);
    if (typeof window !== "undefined") {
      window.alert(
        "Sorry — the document couldn't be downloaded. Please try again, or take a screenshot if it keeps failing.",
      );
    }
    return false;
  } finally {
    restoreImages();
    hidden.forEach((el, i) => {
      el.style.display = prev[i];
    });
    rootStyle.borderRadius = savedRoot.borderRadius;
    rootStyle.boxShadow = savedRoot.boxShadow;
  }
}
