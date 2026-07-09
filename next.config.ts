import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow the dev server to be opened from another device on the LAN.
  // Add this machine's LAN IP(s) here — update if it changes (run `ipconfig`).
  allowedDevOrigins: ["192.168.1.123"],
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    return [
      {
        source: "/api/v1/:path*",
        destination: `${apiUrl}/api/v1/:path*`,
      },
    ];
  },
  // Cross-origin isolation → enables SharedArrayBuffer, which the Zoom Web SDK
  // needs for gallery view / multi-video (so you can see your own tile). The
  // `credentialless` COEP variant lets cross-origin subresources (Zoom CDN
  // scripts, backend/Cloudinary images) still load without requiring CORP headers.
  //
  // ⚠️ REVERT NOTE: COEP can block third-party <iframe> embeds — i.e. the
  // YouTube/Vimeo live-stream fallback for non-Zoom events. If those streams stop
  // loading, delete this entire headers() block to restore previous behavior.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "credentialless" },
        ],
      },
    ];
  },
};

export default nextConfig;
