import type { MetadataRoute } from "next"

import { absolute } from "@/lib/site"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Private surfaces must never be crawled.
        disallow: ["/app", "/sign-in", "/api/"],
      },
    ],
    sitemap: absolute("/sitemap.xml"),
    host: absolute("/"),
  }
}
