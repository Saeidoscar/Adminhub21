import { z } from "zod"

export const questionCategorySchema = z
  .object({
    name: z.string(),
    slug: z.string(),
  })
  .nullable()
  .optional()
  .transform((value) => value ?? null)

export const questionAuthorSchema = z
  .object({
    name: z.string().nullable(),
  })
  .nullable()
  .optional()
  .transform((value) => value ?? null)

export const questionAnswerVendorSchema = z
  .object({
    name: z.string().nullable(),
    slug: z.string().nullable(),
    type: z.string().nullable(),
    profilePath: z.string().nullable(),
    role: z.string().nullable(),
    avatar: z.string().nullable(),
    rating: z.number().nonnegative().default(0),
    reviewCount: z.number().int().nonnegative().default(0),
  })
  .nullable()
  .optional()
  .transform((value) => value ?? null)

export const questionAnswerSchema = z.object({
  body: z.string(),
  createdAt: z.string().nullable().default(null),
  vendor: questionAnswerVendorSchema,
})

export const questionResponderSchema = z.object({
  name: z.string().nullable(),
  slug: z.string().nullable(),
  type: z.string().nullable(),
  profilePath: z.string().nullable(),
  avatar: z.string().nullable(),
})

export const questionSchema = z.object({
  title: z.string(),
  slug: z.string(),
  excerpt: z.string(),
  body: z
    .string()
    .nullable()
    .optional()
    .transform((value) => value ?? null),
  createdAt: z.string().nullable().default(null),
  answersCount: z.number().int().nonnegative().default(0),
  author: questionAuthorSchema,
  category: questionCategorySchema,
  latestResponders: z.array(questionResponderSchema).optional().default([]),
  answers: z.array(questionAnswerSchema).optional().default([]),
})

export const questionPaginationMetaSchema = z.object({
  current_page: z.number().int().positive(),
  last_page: z.number().int().positive(),
  per_page: z.number().int().nonnegative(),
  total: z.number().int().nonnegative(),
})

export const questionListResponseSchema = z.object({
  data: z.array(questionSchema),
  meta: questionPaginationMetaSchema,
})

export const questionItemResponseSchema = z.object({
  data: questionSchema,
})
