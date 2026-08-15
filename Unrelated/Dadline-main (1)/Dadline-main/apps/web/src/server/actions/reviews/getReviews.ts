"use server"

import type {
  PublicReview,
  ReviewsPagination,
  ReviewsStats,
} from "@/@types/reviews"
import { apiGet } from "@/lib/apiClient"

type ReviewsResponse = {
  data: PublicReview[]
  meta?: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
  stats?: ReviewsStats
}

export type GetReviewsResult = {
  reviews: PublicReview[]
  pagination: ReviewsPagination
  stats: ReviewsStats
  error: string | null
}

const EMPTY_PAGINATION: ReviewsPagination = {
  currentPage: 1,
  lastPage: 1,
  perPage: 0,
  total: 0,
}

const EMPTY_STATS: ReviewsStats = {
  total: 0,
  average: 0,
  breakdown: [],
}

export async function getReviews(
  vendorSlug?: string,
): Promise<GetReviewsResult> {
  const query = new URLSearchParams()
  if (vendorSlug) {
    query.set("vendor", vendorSlug)
    query.set("per_page", "9")
  }

  const response = await apiGet<ReviewsResponse>(
    `/reviews${query.size ? `?${query.toString()}` : ""}`,
    undefined,
    {
      revalidate: 3600,
      tags: vendorSlug ? [`provider-reviews:${vendorSlug}`] : ["live-panel"],
    },
  )

  if (!response.ok || !response.data) {
    return {
      reviews: [],
      pagination: EMPTY_PAGINATION,
      stats: EMPTY_STATS,
      error: response.error ?? "دریافت آخرین دیدگاه‌ها با خطا مواجه شد.",
    }
  }

  return {
    reviews: response.data.data,
    pagination: normalizePagination(response.data.meta),
    stats: response.data.stats ?? statsFromReviews(response.data.data),
    error: null,
  }
}

function normalizePagination(meta: ReviewsResponse["meta"]): ReviewsPagination {
  if (!meta) return EMPTY_PAGINATION

  return {
    currentPage: meta.current_page,
    lastPage: meta.last_page,
    perPage: meta.per_page,
    total: meta.total,
  }
}

function statsFromReviews(reviews: PublicReview[]): ReviewsStats {
  if (reviews.length === 0) return EMPTY_STATS

  const groups = new Map<string, { total: number count: number }>()
  let totalRating = 0

  for (const review of reviews) {
    totalRating += review.rating
    const type = review.type || "سایر خدمات"
    const current = groups.get(type) ?? { total: 0, count: 0 }
    groups.set(type, {
      total: current.total + review.rating,
      count: current.count + 1,
    })
  }

  return {
    total: reviews.length,
    average: totalRating / reviews.length,
    breakdown: Array.from(groups.entries()).map(([type, value]) => ({
      type,
      count: value.count,
      average: value.total / value.count,
    })),
  }
}
