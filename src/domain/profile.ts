import type { AdminProfile, PlatformKey } from "@adminhub/shared"
import { platformLabel } from "../components/packages/platformSpecs"
import { TOMAN_PER_MILLION } from "../lib/constants"

export { platformLabel }

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
    return `${(admin.monthlyToman / TOMAN_PER_MILLION).toFixed(1)}M تومان`
  }
  return `$${admin.monthlyUSD}`
}

export function formatRating(rating: number): string {
  return `${rating} / 5`
}
