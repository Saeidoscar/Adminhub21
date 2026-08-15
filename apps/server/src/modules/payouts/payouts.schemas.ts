import { z } from "zod"

export const requestPayoutSchema = z.object({
  amountToman: z.number().int().positive().optional(),
  amountUSD: z.number().int().positive().optional(),
  currency: z.enum(["IRR", "USD"]),
  method: z.string().trim().max(60),
  accountDetails: z.record(z.unknown()),
})

export const updatePayoutStatusSchema = z.object({
  status: z.enum(["approved", "rejected", "completed"]),
  note: z.string().trim().max(500).optional(),
})

export type RequestPayoutInput = z.infer<typeof requestPayoutSchema>
export type UpdatePayoutStatusInput = z.infer<typeof updatePayoutStatusSchema>
