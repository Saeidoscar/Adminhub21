import { z } from "zod"

const locationSchema = z.object({
  id: z.number().int().nullable(),
  name: z.string().nullable(),
  slug: z.string().nullable(),
})

const callProviderSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  type: z.enum(["lawyer", "expert"]),
  role: z.string(),
  slug: z.string().min(1),
  online: z.boolean(),
  lastActive: z.string().nullable(),
  city: locationSchema,
  province: locationSchema,
  expertise: z.array(
    z.object({
      id: z.number().int(),
      name: z.string(),
      slug: z.string(),
    }),
  ),
  avatar: z.string().nullable(),
  rating: z.number().nonnegative(),
  reviewCount: z.number().int().nonnegative(),
  service: z.object({
    type: z.literal("call"),
    name: z.string(),
    price: z.number().nullable(),
    startingPrice: z.number().int().nonnegative().nullable(),
  }),
})

export const callProvidersResponseSchema = z.object({
  data: z.array(callProviderSchema),
  meta: z.object({
    current_page: z.number().int().positive(),
    last_page: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    per_page: z.number().int().positive(),
  }),
})
