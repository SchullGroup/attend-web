import { NextRequest } from "next/server";

/**
 * Same-origin image proxy — used only by the PDF export (`src/lib/dom-to-pdf.ts`).
 *
 * Organiser logos / flyers are served from the private OBS bucket and Cloudinary.
 * A cross-origin `<img>` displays fine, but html2canvas can't read its pixels back
 * without CORS, so those images come out blank in the snapshot. Fetching them
 * server-side and re-serving from our own origin sidesteps that.
 *
 * Locked to the asset hosts we actually use so it can't be turned into an open proxy.
 */
const ALLOWED_HOST = /(^|\.)(myhuaweicloud\.com|cloudinary\.com)$/i;

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("url");
  if (!raw) return new Response("missing url", { status: 400 });

  let target: URL;
  try {
    target = new URL(raw);
  } catch {
    return new Response("bad url", { status: 400 });
  }

  if (target.protocol !== "https:" || !ALLOWED_HOST.test(target.hostname)) {
    return new Response("host not allowed", { status: 403 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(target, {
      headers: { Accept: "image/*" },
      // Signed URLs already carry their own auth; no cookies/credentials needed.
      cache: "no-store",
    });
  } catch {
    return new Response("upstream fetch failed", { status: 502 });
  }

  if (!upstream.ok) {
    return new Response(`upstream ${upstream.status}`, { status: 502 });
  }

  const contentType = upstream.headers.get("content-type") || "image/png";
  if (!contentType.startsWith("image/")) {
    return new Response("not an image", { status: 415 });
  }

  return new Response(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "private, max-age=300",
    },
  });
}
