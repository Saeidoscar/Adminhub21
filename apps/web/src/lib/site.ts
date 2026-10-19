export const SITE = {
  name: "AdminHub21",
  tagline: "بازار متخصصان محتوا، ابزار و قرارداد",
  description:
    "AdminHub21 بازار دوطرفه‌ی متخصصان محتوا، ادیتورها، تولیدکنندگان ابزار و توسعه‌دهندگان است؛ با پروفایل تأییدشده، بسته‌های قیمت‌گذاری‌شده، قرارداد الکترونیکی و کیف پول.",
  locale: "fa_IR",
  lang: "fa",
  dir: "rtl",
} as const

export function siteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  return (raw || "http://localhost:3000").replace(/\/+$/, "")
}

/**
 * Absolute URL helper for metadata, sitemap and canonical links.
 */
export function absolute(path: string): string {
  return `${siteUrl()}${path.startsWith("/") ? path : `/${path}`}`
}
