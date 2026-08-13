import { z } from "zod"

export const listAdminProfilesQuerySchema = z.object({
  platforms: z
    .string()
    .optional()
    .transform((v) => (v ? v.split(",") : undefined)),
  verified: z.enum(["true", "false"]).optional(),
  search: z.string().trim().max(120).optional(),
})

export const updateAdminProfileSchema = z.object({
  photo: z.string().url().max(500).optional(),
  bioEn: z.string().trim().max(2000).optional(),
  bioFa: z.string().trim().max(2000).optional(),
  skillsEn: z.array(z.string().trim().max(60)).max(20).optional(),
  skillsFa: z.array(z.string().trim().max(60)).max(20).optional(),
  platforms: z.array(z.enum(["instagram", "telegram", "whatsapp", "torob", "digikala", "linkedin"])).max(20).optional(),
  monthlyToman: z.number().int().nonnegative().optional(),
  monthlyUSD: z.number().int().nonnegative().optional(),
})

export type ListAdminProfilesQuery = z.infer<typeof listAdminProfilesQuerySchema>
export type UpdateAdminProfileInput = z.infer<typeof updateAdminProfileSchema>
