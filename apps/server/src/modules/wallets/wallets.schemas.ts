import { z } from "zod"

export const createTransactionSchema = z.object({
  type: z.enum(["deposit", "withdraw", "transfer", "payout", "payment"]),
  amountToman: z.number().int().nonnegative().optional(),
  amountUSD: z.number().int().nonnegative().optional(),
  currency: z.string().trim().max(10),
  note: z.string().trim().max(500).optional(),
})

export const listTransactionsQuerySchema = z.object({
  walletId: z.string().uuid().optional(),
  type: z
    .enum(["deposit", "withdraw", "transfer", "payout", "payment"])
    .optional(),
  status: z.enum(["pending", "completed", "failed", "cancelled"]).optional(),
})

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>
export type ListTransactionsQuery = z.infer<typeof listTransactionsQuerySchema>
