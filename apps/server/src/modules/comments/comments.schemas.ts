import { z } from "zod"

export const createCommentSchema = z.object({
  postId: z.string().uuid(),
  postType: z.enum(["story", "blog"]),
  body: z.string().trim().min(1).max(2000),
  parentId: z.string().uuid().optional(),
})

export const listCommentsQuerySchema = z.object({
  postId: z.string().uuid(),
  postType: z.enum(["story", "blog"]),
})

export type CreateCommentInput = z.infer<typeof createCommentSchema>
export type ListCommentsQuery = z.infer<typeof listCommentsQuerySchema>
