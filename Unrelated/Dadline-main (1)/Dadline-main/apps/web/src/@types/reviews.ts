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

export type ReviewServiceRating = {
  type: string
  count: number
  average: number
}

export type ReviewsStats = {
  total: number
  average: number
  breakdown: ReviewServiceRating[]
}

export type ReviewsPagination = {
  currentPage: number
  lastPage: number
  perPage: number
  total: number
}
