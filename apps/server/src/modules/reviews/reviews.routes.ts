import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { requireAuth } from "../../middleware/auth"
import { ApiError } from "../../lib/errors"
import { createReview, listReviews, getReviewById } from "./reviews.service"
import { createReviewSchema, listReviewsQuerySchema } from "./reviews.schemas"

const reviewsRoutes = new Hono()

reviewsRoutes.post(
  "/",
  requireAuth,
  zValidator("json", createReviewSchema),
  async (c) => {
    const { id: employerId } = c.get("authUser")
    const body = c.req.valid("json")
    const review = await createReview(employerId, body)
    return c.json({ review }, 201)
  },
)

reviewsRoutes.get(
  "/",
  requireAuth,
  zValidator("query", listReviewsQuerySchema),
  async (c) => {
    const query = c.req.valid("query")
    const items = await listReviews(query)
    return c.json({ reviews: items })
  },
)

reviewsRoutes.get("/:id", requireAuth, async (c) => {
  const id = c.req.param("id")
  const review = await getReviewById(id)
  if (!review) {
    throw new ApiError(404, "Review not found", "NOT_FOUND")
  }
  return c.json({ review })
})

export { reviewsRoutes }
