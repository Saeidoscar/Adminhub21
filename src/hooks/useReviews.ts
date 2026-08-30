import { useState, useEffect, useCallback } from "react"
import {
  listReviews,
  createReview,
  type ReviewRow,
} from "../lib/api"

export function useReviews(adminId?: string) {
  const [reviews, setReviews] = useState<ReviewRow[]>([])
  const [loading, setLoading] = useState(true)

  const loadReviews = useCallback(async () => {
    if (!adminId) return
    setLoading(true)
    try {
      const data = await listReviews({ adminId })
      setReviews(data)
    } catch {
      setReviews([])
    } finally {
      setLoading(false)
    }
  }, [adminId])

  useEffect(() => {
    void loadReviews()
  }, [loadReviews])

  const submitReview = useCallback(
    async (rating: number, comment: string) => {
      if (!adminId || !comment.trim()) return null
      const review = await createReview({
        adminId,
        rating,
        comment: comment.trim(),
      })
      setReviews((prev) => [review, ...prev])
      return review
    },
    [adminId],
  )

  return { reviews, loading, loadReviews, submitReview }
}
