import { z } from "zod"

export const createContractSchema = z.object({
  offerId: z.string().uuid().optional(),
  adminId: z.string().uuid().optional(),
  platform: z.string().trim().min(1).max(60),
  amountToman: z.number().int().nonnegative().max(2_147_483_647),
  amountUSD: z.number().int().nonnegative().max(2_147_483_647),
  hasInsurance: z.boolean().default(false),
  hasSubstitute: z.boolean().default(false),
  termClause: z.string().trim().max(2000).optional(),
  substituteClause: z.string().trim().max(2000).optional(),
  startDate: z.string().trim().max(120).optional(),
  endDate: z.string().trim().max(120).optional(),
})

export const updateContractStatusSchema = z.object({
  status: z.enum(["active", "pending", "completed", "disputed"]),
})

export type CreateContractInput = z.infer<typeof createContractSchema>
export type UpdateContractStatusInput = z.infer<typeof updateContractStatusSchema>
