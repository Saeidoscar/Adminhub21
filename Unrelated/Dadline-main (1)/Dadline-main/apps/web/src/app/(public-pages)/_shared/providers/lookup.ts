import type { LegalCategory, Province } from "./types"

export const findCategoryBySlug = (
  categories: LegalCategory[],
  slug: string,
): LegalCategory | undefined => categories.find((c) => c.slug === slug)

export const findCityBySlug = (provinces: Province[], slug: string) => {
  for (const province of provinces) {
    const city = province.cities.find((c) => c.slug === slug)
    if (city) return { city, province }
  }
  return undefined
}
