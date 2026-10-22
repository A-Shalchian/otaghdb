import type { NextConfig } from "next";

// Phones reach the laptop through `tailscale serve`, at an address like
// laptop.tail1234.ts.net.
const TAILNET_HOSTS = ["**.ts.net"];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  allowedDevOrigins: TAILNET_HOSTS,
  experimental: {
    serverActions: {
      bodySizeLimit: "25mb",
      allowedOrigins: TAILNET_HOSTS,
    },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
