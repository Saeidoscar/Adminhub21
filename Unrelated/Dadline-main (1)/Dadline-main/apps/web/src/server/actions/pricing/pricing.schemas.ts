import { z } from "zod"

const pricingItemSchema = z.object({
  key: z.string().min(1),
  title: z.string().min(1),
  description: z.string(),
  price: z.number().int().nonnegative(),
  unit: z.string().min(1),
  href: z.string().startsWith("/"),
  featured: z.boolean(),
})

const pricingGroupSchema = z.object({
  key: z.string().min(1),
  title: z.string().min(1),
  description: z.string(),
  items: z.array(pricingItemSchema),
})

export const pricingResponseSchema = z
  .object({
    data: z.object({
      currency: z.literal("IRT"),
      currency_label: z.string().min(1),
      updated_at: z.string().nullable(),
      groups: z.array(pricingGroupSchema),
    }),
  })
  .transform(({ data }) => ({
    currency: data.currency,
    currencyLabel: data.currency_label,
    updatedAt: data.updated_at,
    groups: data.groups,
  }))
