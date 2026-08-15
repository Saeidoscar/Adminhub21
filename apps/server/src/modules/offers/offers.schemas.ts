import { z } from "zod"

export const createOfferSchema = z.object({
  adminId: z.string().uuid().optional(),
  packageId: z.string().uuid().optional(),
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1).max(2000),
  platforms: z
    .array(
      z.enum([
        "instagram",
        "telegram",
        "whatsapp",
        "torob",
        "digikala",
        "linkedin",
      ]),
    )
    .min(1)
    .max(20),
  platformConfigs: z
    .array(
      z.object({
        platform: z.enum([
          "instagram",
          "telegram",
          "whatsapp",
          "torob",
          "digikala",
          "linkedin",
        ]),
        settings: z.record(z.unknown()),
      }),
    )
    .min(1),
  proposedPriceToman: z
    .number()
    .int()
    .nonnegative()
    .max(2_147_483_647)
    .optional(),
  proposedPriceUSD: z
    .number()
    .int()
    .nonnegative()
    .max(2_147_483_647)
    .optional(),
  billingCycle: z.enum(["monthly", "project", "hourly"]),
  deliveryTime: z.string().trim().max(120).optional(),
  startDate: z.string().trim().max(120).optional(),
  endDate: z.string().trim().max(120).optional(),
  message: z.string().trim().max(2000).optional(),
})

export type CreateOfferInput = z.infer<typeof createOfferSchema>
