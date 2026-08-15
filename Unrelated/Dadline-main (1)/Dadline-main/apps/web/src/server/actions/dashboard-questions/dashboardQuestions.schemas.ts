import { z } from "zod"

const categorySchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  slug: z.string(),
})

const reviewSchema = z.object({
  id: z.number().int().positive(),
  rating: z.number().int().min(1).max(5),
  review: z.string().nullable(),
})

const answerSchema = z.object({
  id: z.number().int().positive(),
  body: z.string(),
  createdAt: z.string().nullable(),
  vendor: z
    .object({
      id: z.number().int().positive().nullable(),
      name: z.string().nullable(),
      role: z.string().nullable(),
      slug: z.string().nullable(),
      type: z.string().nullable(),
      profilePath: z.string().nullable(),
      avatar: z.string().nullable(),
    })
    .nullable(),
  review: reviewSchema.nullable(),
})

export const dashboardQuestionSchema = z.object({
  uuid: z.string().uuid(),
  title: z.string(),
  slug: z.string().nullable(),
  body: z.string(),
  excerpt: z.string(),
  isPrivate: z.boolean(),
  status: z.enum(["pending", "approved", "publish"]),
  statusLabel: z.string(),
  answersCount: z.number().int().nonnegative(),
  createdAt: z.string().nullable(),
  category: categorySchema.nullable(),
  answers: z.array(answerSchema).default([]),
})

export const dashboardQuestionItemResponseSchema = z.object({
  data: dashboardQuestionSchema,
})

export const dashboardQuestionListResponseSchema = z.object({
  data: z.array(dashboardQuestionSchema),
  meta: z.object({
    current_page: z.number().int().positive(),
    last_page: z.number().int().positive(),
    per_page: z.number().int().nonnegative(),
    total: z.number().int().nonnegative(),
  }),
})

export const dashboardQuestionMetaResponseSchema = z.object({
  data: z.object({
    categories: z.array(categorySchema),
    pricing: z.object({
      publicPrice: z.number().int().positive(),
      privatePrice: z.number().int().positive(),
      privateSurchargePercent: z.number().int().nonnegative(),
    }),
    walletBalance: z.number().int().nonnegative(),
  }),
})

export const dashboardQuestionReviewResponseSchema = z.object({
  data: z.object({
    id: z.number().int().positive(),
    rating: z.number().int().min(1).max(5),
    review: z.string().nullable(),
  }),
})
