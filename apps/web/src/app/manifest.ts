import type { MetadataRoute } from "next"

import { SITE } from "@/lib/site"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE.name} — ${SITE.tagline}`,
    short_name: SITE.name,
    description: SITE.description,
    lang: SITE.lang,
    dir: SITE.dir,
    start_url: "/",
    display: "standalone",
    background_color: "#f2f5fa",
    theme_color: "#1e3a5f",
    categories: ["business", "shopping"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  }
}
