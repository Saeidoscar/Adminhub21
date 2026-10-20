import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // The desktop build ships the server next to the Electron shell. Docker and
  // Vercel keep using the default (non-standalone) output.
  output: process.env.NEXT_STANDALONE === "1" ? "standalone" : undefined,
  experimental: {
    // The design tokens live in a workspace package and are plain CSS.
    externalDir: true,
  },
}

export default nextConfig
