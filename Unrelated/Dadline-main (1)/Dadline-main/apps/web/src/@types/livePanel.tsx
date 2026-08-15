export interface Vendor {
  name: string
  role: string
  avatar: string | null
  tagline: string | null
  slug: string
  type: string
  isOnline: boolean
  isRecommended?: boolean
  specialty: string
}

export interface Review {
  id: string
  rating: number
  serviceType: string
  comment: string
  vendorName: string
  vendorAvatar: string | null
  vendorSlug: string | null
  vendorType: string
  timeAgo: string
}

export type PublicReview = {
  id: number
  rating: number
  review: string | null
  type: string
  vendorAvatar: string | null
  vendorSlug: string | null
  vendorName: string | null
  vendorType: string | null
  createdAgo: string | null
}
