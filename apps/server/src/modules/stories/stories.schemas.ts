import { z } from "zod"

export const createStorySchema = z.object({
  title: z.string().trim().min(1).max(200),
  content: z.string().trim().min(1).max(10000),
  coverUrl: z.string().url().max(500).optional(),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
})

export const updateStorySchema = createStorySchema.partial()

export const listStoriesQuerySchema = z.object({
  status: z.enum(["draft", "published", "archived"]).optional(),
  search: z.string().trim().max(120).optional(),
})

export type CreateStoryInput = z.infer<typeof createStorySchema>
export type UpdateStoryInput = z.infer<typeof updateStorySchema>
export type ListStoriesQuery = z.infer<typeof listStoriesQuerySchema>
