import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    // The design tokens live in a workspace package and are plain CSS.
    externalDir: true,
  },
}

export default nextConfig
