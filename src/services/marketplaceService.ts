import type { AdminProfile, FavoriteRow, ContractPackage } from "@adminhub/shared"
import {
  listAdminProfiles,
  listFavorites,
  addFavorite,
  removeFavorite,
} from "../lib/api"
import { filterPackagesForAdmin, filterPackagesForPlatform, searchPackages } from "../domain/package"
import { formatAdminPrice } from "../domain/profile"

export interface MarketplaceFilters {
  search: string
  platform: string
  sortBy: "rating" | "price"
  verifiedOnly: boolean
  lang: "en" | "fa"
}

export function filterAndSortAdmins(
  admins: AdminProfile[],
  filters: MarketplaceFilters,
): AdminProfile[] {
  const { search, platform, sortBy, verifiedOnly, lang } = filters
  const query = search.toLowerCase().trim()

  const filtered = admins.filter((a) => {
    const name = lang === "fa" ? a.nameFa : a.nameEn
    const bio = lang === "fa" ? a.bioFa : a.bioEn
    const matchSearch =
      !query ||
      name.toLowerCase().includes(query) ||
      bio.toLowerCase().includes(query)
    const matchPlatform = platform === "all" || a.platforms.includes(platform as any)
    const matchVerified = !verifiedOnly || a.verified
    return matchSearch && matchPlatform && matchVerified
  })

  filtered.sort((a, b) => {
    if (sortBy === "rating") {
      return b.rating - a.rating
    }
    return a.monthlyToman - b.monthlyToman
  })

  return filtered
}

export async function loadMarketplaceData(): Promise<{
  admins: AdminProfile[]
  favorites: FavoriteRow[]
}> {
  const [profiles, favs] = await Promise.all([
    listAdminProfiles(),
    listFavorites().catch(() => []),
  ])
  return { admins: profiles, favorites: favs }
}

export function isFavoriteAdmin(
  favorites: FavoriteRow[],
  adminId: string,
): boolean {
  return favorites.some((f) => f.adminId === adminId)
}

export function toggleFavoriteService(
  favorites: FavoriteRow[],
  adminId: string,
  isFav: boolean,
): FavoriteRow[] {
  if (isFav) {
    return favorites.filter((f) => f.adminId !== adminId)
  }
  return [...favorites, { id: `fav-${Date.now()}`, adminId, createdAt: new Date().toISOString() }]
}

export function searchAndFilterPackages(
  packages: ContractPackage[],
  query: string,
  platform?: string,
): ContractPackage[] {
  let result = packages
  if (query.trim()) {
    result = searchPackages(result, query)
  }
  if (platform && platform !== "all") {
    result = filterPackagesForPlatform(result, platform as any)
  }
  return result
}
