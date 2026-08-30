import type { AdminProfile, PlatformKey } from "@adminhub/shared"

export const PLATFORM_LABELS: Record<PlatformKey, { en: string; fa: string }> = {
  instagram: { en: "Instagram", fa: "اینستاگرام" },
  telegram: { en: "Telegram", fa: "تلگرام" },
  whatsapp: { en: "WhatsApp", fa: "واتساپ" },
  torob: { en: "Torob", fa: "ترب" },
  digikala: { en: "Digikala", fa: "دیجی‌کالا" },
  linkedin: { en: "LinkedIn", fa: "لینکدین" },
}

export function platformLabel(key: PlatformKey, lang: "en" | "fa"): string {
  return PLATFORM_LABELS[key]?.[lang] || key
}

export function adminName(admin: AdminProfile, lang: "en" | "fa"): string {
  return lang === "fa" ? admin.nameFa : admin.nameEn
}

export function adminBio(admin: AdminProfile, lang: "en" | "fa"): string {
  return lang === "fa" ? admin.bioFa : admin.bioEn
}

export function adminSkills(admin: AdminProfile, lang: "en" | "fa"): string[] {
  return lang === "fa" ? admin.skillsFa : admin.skillsEn
}

export function formatAdminPrice(admin: AdminProfile, lang: "en" | "fa"): string {
  if (lang === "fa") {
    return `${(admin.monthlyToman / 1000000).toFixed(1)}M تومان`
  }
  return `$${admin.monthlyUSD}`
}

export function formatRating(rating: number): string {
  return `${rating} / 5`
}
