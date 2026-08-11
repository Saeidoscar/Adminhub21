export type PlatformKey =
  | "instagram"
  | "telegram"
  | "whatsapp"
  | "torob"
  | "digikala"
  | "linkedin"

export type BillingCycle = "monthly" | "project" | "hourly"

export type PackageType = "platform" | "bundle"

export interface PlatformConfig {
  platform: PlatformKey
  settings: Record<string, unknown>
}

export interface ContractPackage {
  id: string
  adminId: string
  name: string
  description: string
  type: PackageType
  platforms: PlatformKey[]
  platformConfigs: PlatformConfig[]
  priceToman: number
  priceUSD: number
  billingCycle: BillingCycle
  deliveryTime: string
  featured: boolean
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface CustomOffer {
  id: string
  packageId?: string
  adminId: string
  employerId: string
  employerName: string
  name: string
  description: string
  platforms: PlatformKey[]
  platformConfigs: PlatformConfig[]
  proposedPriceToman?: number
  proposedPriceUSD?: number
  billingCycle: BillingCycle
  deliveryTime?: string
  startDate?: string
  endDate?: string
  message?: string
  createdAt: string
}

export interface AdminProfile {
  id: string
  nameEn: string
  nameFa: string
  photo: string
  platforms: PlatformKey[]
  rating: number
  reviews: number
  verified: boolean
  insured: boolean
  monthlyToman: number
  monthlyUSD: number
  bioEn: string
  bioFa: string
  skillsEn: string[]
  skillsFa: string[]
}
