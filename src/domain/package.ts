import type { ContractPackage, PlatformKey, PlatformConfig, AdminProfile } from "@adminhub/shared"

export function filterPackagesForAdmin(
  packages: ContractPackage[],
  adminId: string,
): ContractPackage[] {
  return packages.filter((p) => p.adminId === adminId && p.active !== false)
}

export function filterPackagesForPlatform(
  packages: ContractPackage[],
  platform: PlatformKey,
): ContractPackage[] {
  return packages.filter((p) => p.platforms.includes(platform) && p.active !== false)
}

export function filterPackagesByType(
  packages: ContractPackage[],
  type: "platform" | "bundle",
): ContractPackage[] {
  return packages.filter((p) => p.type === type && p.active !== false)
}

export function searchPackages(
  packages: ContractPackage[],
  query: string,
  lang: "en" | "fa" = "en",
): ContractPackage[] {
  const q = query.toLowerCase().trim()
  if (!q) return packages
  return packages.filter((p) => {
    const name = p.name.toLowerCase()
    const description = p.description.toLowerCase()
    return name.includes(q) || description.includes(q)
  })
}

export function formatPrice(pkg: ContractPackage, lang: "en" | "fa"): string {
  if (lang === "fa") {
    return `${(pkg.priceToman / 1000000).toFixed(1)}M تومان`
  }
  return `$${pkg.priceUSD}`
}

export function getPackageAdmin(
  packages: ContractPackage[],
  admins: AdminProfile[],
  adminId: string,
): AdminProfile | undefined {
  return admins.find((a) => String(a.id) === String(adminId))
}

export { getPackageAdmin as findAdmin }

export function findPackage(
  packages: ContractPackage[],
  id: string,
): ContractPackage | undefined {
  return packages.find((p) => p.id === id)
}

export { filterPackagesForAdmin as packagesByAdmin }
export { filterPackagesForPlatform as packagesByPlatform }

export function getPlatformConfig(
  configs: PlatformConfig[],
  platform: PlatformKey,
): PlatformConfig | undefined {
  return configs.find((c) => c.platform === platform)
}

export function isPackageInComparison(selected: Set<string>, packageId: string): boolean {
  return selected.has(packageId)
}



export function computeContractAmounts(
  amount: string,
  currency: "toman" | "usd",
): { amountToman: number; amountUSD: number } {
  const amountVal = Number(amount)
  if (isNaN(amountVal) || amountVal < 0) {
    return { amountToman: 0, amountUSD: 0 }
  }
  return {
    amountToman: currency === "toman" ? amountVal : 0,
    amountUSD: currency === "usd" ? amountVal : 0,
  }
}

export function computeDeliveryTime(durationMonths: string, lang: "en" | "fa"): string {
  return `${durationMonths} ${lang === "fa" ? "ماه" : "months"}`
}
