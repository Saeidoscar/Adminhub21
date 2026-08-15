const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://dadline.net"
).replace(/\/$/, "")

const sitemapNames = [
  "pages",
  "posts",
  "stories",
  "taxonomies",
  "lawyers",
  "experts",
  "products",
  "questions",
] as const

export const revalidate = 3600

export function GET() {
  const sitemaps = sitemapNames
    .map(
      (name) =>
        `<sitemap><loc>${escapeXml(`${SITE_URL}/sitemaps/${name}.xml`)}</loc></sitemap>`,
    )
    .join("")

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${sitemaps}</sitemapindex>`,
    {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    },
  )
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;")
}
