import type { MetadataRoute } from "next"

import { listPackages } from "@/lib/api"
import { absolute } from "@/lib/site"

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: absolute("/"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: absolute("/marketplace"),
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: absolute("/pricing"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: absolute("/changelog"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.5,
    },
    {
      url: absolute("/about"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: absolute("/roadmap"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: absolute("/terms"),
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: absolute("/privacy"),
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ]

  const { data: packages } = await listPackages({ per_page: "200" } as never)

  const packageRoutes: MetadataRoute.Sitemap = packages.map((pkg) => ({
    url: absolute(`/marketplace/${pkg.slug ?? pkg.id}`),
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }))

  return [...staticRoutes, ...packageRoutes]
}
