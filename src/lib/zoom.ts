// Zoom Meeting SDK (Component View) — loaded from Zoom's CDN so the bundler never
// has to process its UMD/peer deps. The embedded 6.x bundle is NOT self-contained:
// it needs React/ReactDOM/Redux/lodash as globals loaded first.
/* eslint-disable @typescript-eslint/no-explicit-any */

export const ZOOM_VERSION = "6.2.0";
const CDN = `https://source.zoom.us/${ZOOM_VERSION}`;
const ZOOM_VENDOR = [
  `${CDN}/lib/vendor/react.min.js`,
  `${CDN}/lib/vendor/react-dom.min.js`,
  `${CDN}/lib/vendor/redux.min.js`,
  `${CDN}/lib/vendor/lodash.min.js`,
];
const ZOOM_SDK_URL = `${CDN}/zoom-meeting-embedded-${ZOOM_VERSION}.min.js`;

function getEmbedded(): any | null {
  const g = (window as any).ZoomMtgEmbedded;
  const api = g?.default ?? g;
  return api && typeof api.createClient === "function" ? api : null;
}

function waitForEmbedded(timeoutMs = 8000): Promise<any> {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const tick = () => {
      const api = getEmbedded();
      if (api) return resolve(api);
      if (Date.now() - start > timeoutMs) {
        return reject(new Error("Zoom SDK global (ZoomMtgEmbedded) not found after load"));
      }
      setTimeout(tick, 100);
    };
    tick();
  });
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[data-zoom="${src}"]`)) return resolve();
    const s = document.createElement("script");
    s.src = src;
    s.setAttribute("data-zoom", src);
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load " + src));
    document.body.appendChild(s);
  });
}

// Loads the vendor globals + the embedded SDK and returns the ZoomMtgEmbedded API.
export async function loadZoomEmbeddedSdk(): Promise<any> {
  if (getEmbedded()) return getEmbedded();

  const w = window as any;
  // Hide module/exports/define so each UMD bundle attaches to window globals
  // instead of a leaked module system (from extensions / the dev bundler).
  const saved = { define: w.define, exports: w.exports, module: w.module };
  w.define = undefined;
  w.exports = undefined;
  w.module = undefined;
  try {
    for (const src of ZOOM_VENDOR) await loadScript(src);
    await loadScript(ZOOM_SDK_URL);
    return await waitForEmbedded();
  } finally {
    w.define = saved.define;
    w.exports = saved.exports;
    w.module = saved.module;
  }
}

// Detect a Zoom join link and pull out the meeting number (+ pwd if present).
// Returns null for non-Zoom URLs so callers fall back to the iframe embed.
// NOTE: the URL's `pwd` is Zoom's encoded token, not always the plain passcode the
// SDK's join() wants — the backend should ideally supply the plain passcode.
export function parseZoomUrl(
  url: string | undefined | null,
): { meetingNumber: string; passcode: string } | null {
  if (!url) return null;
  try {
    const u = new URL(url.trim());
    if (!/(^|\.)zoom\.us$/i.test(u.hostname)) return null;
    const m = u.pathname.match(/\/j\/(\d+)/);
    if (!m) return null;
    return { meetingNumber: m[1], passcode: u.searchParams.get("pwd") || "" };
  } catch {
    return null;
  }
}
