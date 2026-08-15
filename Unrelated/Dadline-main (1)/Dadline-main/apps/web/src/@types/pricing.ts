export interface PricingItem {
  key: string
  title: string
  description: string
  price: number
  unit: string
  href: string
  featured: boolean
}

export interface PricingGroup {
  key: string
  title: string
  description: string
  items: PricingItem[]
}

export interface PricingData {
  currency: "IRT"
  currencyLabel: string
  updatedAt: string | null
  groups: PricingGroup[]
}
