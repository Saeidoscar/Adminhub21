import { z } from "zod"

export const createBlogSchema = z.object({
  title: z.string().trim().min(1).max(200),
  content: z.string().trim().min(1).max(10000),
  coverUrl: z.string().url().max(500).optional(),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
})

export const updateBlogSchema = createBlogSchema.partial()

export const listBlogsQuerySchema = z.object({
  status: z.enum(["draft", "published", "archived"]).optional(),
  search: z.string().trim().max(120).optional(),
})

export type CreateBlogInput = z.infer<typeof createBlogSchema>
export type UpdateBlogInput = z.infer<typeof updateBlogSchema>
export type ListBlogsQuery = z.infer<typeof listBlogsQuerySchema>
