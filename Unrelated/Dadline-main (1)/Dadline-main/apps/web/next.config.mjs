import createNextIntlPlugin from "next-intl/plugin"

const withNextIntl = createNextIntlPlugin()

/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/shop",
        destination: "/document",
        permanent: true,
      },
      {
        source: "/shop/:path*",
        destination: "/document/:path*",
        permanent: true,
      },
      {
        source: "/contract",
        has: [
          {
            type: "query",
            key: "code",
            value: "(?<contractCode>.+)",
          },
        ],
        destination: "/contract/:contractCode",
        permanent: true,
      },
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "dadline.s3.ir-thr-at1.arvanstorage.ir",
      },
      {
        protocol: "https",
        hostname: "s3.dadline.net",
      },
    ],
  },
}

export default withNextIntl(nextConfig)
