import { z } from "zod"

export const createTicketSchema = z.object({
  subject: z.string().trim().min(1).max(200),
  category: z.enum(["billing", "technical", "account", "other"]),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
})

export const updateTicketSchema = z.object({
  status: z.enum(["open", "in_progress", "resolved", "closed"]).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
})

export const createTicketMessageSchema = z.object({
  body: z.string().trim().min(1).max(5000),
})

export type CreateTicketInput = z.infer<typeof createTicketSchema>
export type UpdateTicketInput = z.infer<typeof updateTicketSchema>
export type CreateTicketMessageInput = z.infer<typeof createTicketMessageSchema>
