import { z } from "zod"

export const listPackagesQuerySchema = z.object({
  platforms: z
    .string()
    .optional()
    .transform((v) => (v ? v.split(",") : undefined)),
  type: z.enum(["platform", "bundle"]).optional(),
  featured: z.enum(["true", "false"]).optional(),
  billingCycle: z.enum(["monthly", "project", "hourly"]).optional(),
  search: z.string().trim().max(120).optional(),
})

export const createPackageSchema = z.object({
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1).max(2000),
  type: z.enum(["platform", "bundle"]),
  platforms: z.array(z.enum(["instagram", "telegram", "whatsapp", "torob", "digikala", "linkedin"])).min(1).max(20),
  platformConfigs: z.array(z.object({
    platform: z.enum(["instagram", "telegram", "whatsapp", "torob", "digikala", "linkedin"]),
    settings: z.record(z.unknown()),
  })).min(1),
  priceToman: z.number().int().nonnegative().max(2_147_483_647),
  priceUSD: z.number().int().nonnegative().max(2_147_483_647),
  billingCycle: z.enum(["monthly", "project", "hourly"]),
  deliveryTime: z.string().trim().min(1).max(120),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
})

export const updatePackageSchema = createPackageSchema.partial().omit({ type: true, platforms: true })

export type ListPackagesQuery = z.infer<typeof listPackagesQuerySchema>
export type CreatePackageInput = z.infer<typeof createPackageSchema>
export type UpdatePackageInput = z.infer<typeof updatePackageSchema>
