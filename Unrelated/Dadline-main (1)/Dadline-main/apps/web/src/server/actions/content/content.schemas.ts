import type { ContentComment } from "@/@types/content"
import { z } from "zod"

export const contentTagSchema = z.object({
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable().default(null),
  storiesCount: z.number().int().nonnegative().optional(),
  blogsCount: z.number().int().nonnegative().optional(),
})

export const contentItemSchema = z.object({
  title: z.string(),
  slug: z.string(),
  excerpt: z.string().nullable().default(null),
  content: z
    .string()
    .nullable()
    .optional()
    .transform((value) => value ?? null),
  viewsCount: z.number().int().nonnegative().default(0),
  likesCount: z.number().int().nonnegative().default(0),
  dislikesCount: z.number().int().nonnegative().default(0),
  commentsCount: z.number().int().nonnegative().default(0),
  publishedAt: z.string().nullable().default(null),
  createdAt: z.string().nullable().default(null),
  updatedAt: z.string().nullable().default(null),
  author: z
    .object({ name: z.string().nullable() })
    .nullable()
    .optional()
    .transform((value) => value ?? null),
  category: z
    .object({ name: z.string(), slug: z.string() })
    .nullable()
    .optional()
    .transform((value) => value ?? null),
  featuredImageUrl: z
    .string()
    .url()
    .nullable()
    .optional()
    .transform((value) => value ?? null),
  tags: z.array(contentTagSchema).default([]),
})

export const paginationMetaSchema = z.object({
  current_page: z.number().int().positive(),
  last_page: z.number().int().positive(),
  per_page: z.number().int().nonnegative(),
  total: z.number().int().nonnegative(),
})

export const contentListResponseSchema = z.object({
  data: z.array(contentItemSchema),
  meta: paginationMetaSchema,
})

export const contentItemResponseSchema = z.object({
  data: contentItemSchema,
})

export const contentTagsResponseSchema = z.object({
  data: z.array(contentTagSchema),
})

export const contentStatsResponseSchema = z.object({
  data: z.object({
    contentsCount: z.number().int().nonnegative(),
    viewsCount: z.number().int().nonnegative(),
    likesCount: z.number().int().nonnegative(),
    dislikesCount: z.number().int().nonnegative(),
    commentsCount: z.number().int().nonnegative(),
    tagsCount: z.number().int().nonnegative(),
  }),
})

export const contentCommentSchema: z.ZodType<ContentComment> = z.lazy(() =>
  z.object({
    publicId: z.string().uuid(),
    content: z.string(),
    likesCount: z.number().int().nonnegative().default(0),
    dislikesCount: z.number().int().nonnegative().default(0),
    createdAt: z.string().nullable().default(null),
    author: z
      .object({ name: z.string().nullable() })
      .nullable()
      .optional()
      .transform((value) => value ?? null),
    replies: z.array(contentCommentSchema).default([]),
  }),
)

export const contentCommentsResponseSchema = z.object({
  data: z.array(contentCommentSchema),
  meta: paginationMetaSchema,
})

export const contentReactionStateSchema = z.object({
  reaction: z.enum(["like", "dislike"]).nullable(),
  likesCount: z.number().int().nonnegative(),
  dislikesCount: z.number().int().nonnegative(),
})

export const contentReactionResponseSchema = z.object({
  data: contentReactionStateSchema,
})

export const submittedCommentResponseSchema = z.object({
  data: contentCommentSchema,
})
