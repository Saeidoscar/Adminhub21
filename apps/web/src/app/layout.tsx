import type { Metadata, Viewport } from "next"

import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { SITE, absolute, siteUrl } from "@/lib/site"

import "./globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: `${SITE.name} · ${SITE.tagline}`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  authors: [{ name: SITE.name, url: absolute("/about") }],
  creator: SITE.name,
  publisher: SITE.name,
  category: "business",
  keywords: [
    "بازار متخصصان",
    "ادیت ویدیو",
    "تولید محتوا",
    "قرارداد الکترونیکی",
    "کیف پول",
    "فریلنسری",
    "AdminHub21",
  ],
  alternates: { canonical: "/" },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180" }],
  },
  formatDetection: { telephone: false, email: false, address: false },
  openGraph: {
    type: "website",
    locale: SITE.locale,
    url: absolute("/"),
    siteName: SITE.name,
    title: `${SITE.name} · ${SITE.tagline}`,
    description: SITE.description,
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: `${SITE.name} — ${SITE.tagline}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} · ${SITE.tagline}`,
    description: SITE.description,
    images: ["/og.png"],
  },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  themeColor: "#1e3a5f",
  width: "device-width",
  initialScale: 1,
}

/**
 * Organization + WebSite structured data. Static, so search engines and link
 * previews get the same identity the pages describe.
 */
const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl()}/#organization`,
      name: SITE.name,
      url: siteUrl(),
      description: SITE.description,
      email: "hello@adminhub21.com",
      logo: `${siteUrl()}/icon.png`,
      sameAs: ["https://github.com/Saeidoscar/Adminhub21"],
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl()}/#website`,
      url: siteUrl(),
      name: SITE.name,
      inLanguage: "fa-IR",
      publisher: { "@id": `${siteUrl()}/#organization` },
    },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={SITE.lang} dir={SITE.dir}>
      <body className="flex min-h-dvh flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <script
          type="application/ld+json"
          // Static object defined above; no user input reaches this string.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
      </body>
    </html>
  )
}
