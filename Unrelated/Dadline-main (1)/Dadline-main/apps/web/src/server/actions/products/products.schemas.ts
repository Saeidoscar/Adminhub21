import { z } from "zod"
import { PRODUCT_TYPES } from "./products.types"

const productTypeSchema = z.enum(PRODUCT_TYPES)

const productListItemSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  type: productTypeSchema,
  description: z.string().nullable(),
  price: z.number().int().nonnegative(),
  salesCount: z.number().int().nonnegative(),
  viewsCount: z.number().int().nonnegative(),
  publishedAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
  vendor: z
    .object({
      name: z.string(),
      role: z.string(),
      slug: z.string().nullable(),
      type: z.enum(["lawyer", "expert", "judge"]).nullable(),
      avatarUrl: z.string().nullable(),
    })
    .nullable(),
  category: z
    .object({
      name: z.string(),
      slug: z.string(),
    })
    .nullable(),
})

export const productListResponseSchema = z.object({
  data: z.array(productListItemSchema),
  meta: z.object({
    current_page: z.number().int().positive(),
    last_page: z.number().int().positive(),
    per_page: z.number().int().positive(),
    total: z.number().int().nonnegative(),
  }),
  filters: z.object({
    total: z.number().int().nonnegative(),
    types: z.array(
      z.object({
        type: productTypeSchema,
        count: z.number().int().nonnegative(),
      }),
    ),
    categories: z.array(
      z.object({
        name: z.string(),
        slug: z.string(),
        count: z.number().int().nonnegative(),
      }),
    ),
  }),
})

export const productItemResponseSchema = z.object({
  data: productListItemSchema,
})
