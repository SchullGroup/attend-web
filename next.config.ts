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
};

export default nextConfig;
