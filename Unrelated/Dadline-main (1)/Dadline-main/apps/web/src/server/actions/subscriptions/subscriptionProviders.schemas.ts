import { z } from "zod"

const locationSchema = z.object({
  id: z.number().int().nullable(),
  name: z.string().nullable(),
  slug: z.string().nullable(),
})

const subscriptionProviderSchema = z.object({
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
    type: z.literal("subscription"),
    name: z.string(),
    price: z.number().nonnegative().nullable(),
    startingPrice: z.number().nonnegative().nullable(),
  }),
})

export const subscriptionProvidersResponseSchema = z.object({
  data: z.array(subscriptionProviderSchema),
  meta: z.object({
    current_page: z.number().int().positive(),
    last_page: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    per_page: z.number().int().positive(),
  }),
})

export type SubscriptionProvider = z.infer<typeof subscriptionProviderSchema>
export type SubscriptionProvidersPagination = z.infer<typeof subscriptionProvidersResponseSchema>["meta"]
