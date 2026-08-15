import { z } from "zod"

export const generateCodeSchema = z.object({})

export const listCommissionsQuerySchema = z.object({
  status: z.enum(["pending", "paid", "cancelled"]).optional(),
})

export const verifyCommissionSchema = z.object({
  code: z.string().min(1),
})

export type GenerateCodeInput = z.infer<typeof generateCodeSchema>
export type ListCommissionsQuery = z.infer<typeof listCommissionsQuerySchema>
export type VerifyCommissionInput = z.infer<typeof verifyCommissionSchema>
