import type { ReviewRow } from "@adminhub/shared"
import { apiFetch, unwrapList, unwrapItem } from "./core"

export type { ReviewRow }

export async function createReview(
  input: {
    adminId: string
    contractId?: string
    rating: number
    comment?: string
  },
): Promise<ReviewRow> {
  const payload = await apiFetch<Record<string, unknown>>("/api/reviews", {
    method: "POST",
    body: JSON.stringify(input),
  })

  const review = unwrapItem<ReviewRow>(payload, "review")

  if (!review) {
    throw new Error("Create review response was empty")
  }

  return review
}

export interface ListReviewsQuery {
  adminId?: string
  employerId?: string
}

export async function listReviews(
  query: ListReviewsQuery = {},
): Promise<ReviewRow[]> {
  const params = new URLSearchParams()

  if (query.adminId) {
    params.set("targetId", query.adminId)
  }

  if (query.employerId) {
    params.set("targetId", query.employerId)
  }

  const queryString = params.toString()
  const payload = await apiFetch<Record<string, unknown>>(
    `/api/reviews${queryString ? `?${queryString}` : ""}`,
  )

  return unwrapList<ReviewRow>(payload, "reviews")
}
