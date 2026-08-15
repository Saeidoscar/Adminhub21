import { z } from "zod"

export const createReviewSchema = z.object({
  adminId: z.string().uuid(),
  contractId: z.string().uuid().optional(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(2000).optional(),
})

export const listReviewsQuerySchema = z.object({
  adminId: z.string().uuid().optional(),
  employerId: z.string().uuid().optional(),
})

export type CreateReviewInput = z.infer<typeof createReviewSchema>
export type ListReviewsQuery = z.infer<typeof listReviewsQuerySchema>
