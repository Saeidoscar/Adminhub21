import { z } from "zod"

export const createPortfolioSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000),
  mediaUrl: z.string().url().max(500),
  mediaType: z.enum(["image", "video", "link"]),
  tags: z.array(z.string().trim().max(40)).max(20).default([]),
})

export const updatePortfolioSchema = createPortfolioSchema.partial()

export type CreatePortfolioInput = z.infer<typeof createPortfolioSchema>
export type UpdatePortfolioInput = z.infer<typeof updatePortfolioSchema>
