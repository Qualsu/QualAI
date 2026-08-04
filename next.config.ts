import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/proxy/:path*",
        destination: "http://kenyhost.duckdns.org:8006/:path*",
      },
    ];
  },
};

export default nextConfig;
