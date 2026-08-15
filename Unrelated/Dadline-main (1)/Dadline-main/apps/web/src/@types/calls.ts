export type CallProviderType = "lawyer" | "expert"

export interface CallProvider {
  id: number
  name: string
  type: CallProviderType
  role: string
  slug: string
  online: boolean
  lastActive: string | null
  city: {
    id: number | null
    name: string | null
    slug: string | null
  }
  province: {
    id: number | null
    name: string | null
    slug: string | null
  }
  expertise: Array<{
    id: number
    name: string
    slug: string
  }>
  avatar: string | null
  rating: number
  reviewCount: number
  service: {
    type: "call"
    name: string
    price: number | null
    startingPrice: number | null
  }
}

export interface CallProvidersPagination {
  current_page: number
  last_page: number
  total: number
  per_page: number
}
