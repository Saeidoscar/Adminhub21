import { z } from "zod"

export const listAdminTicketsQuerySchema = z.object({
  status: z.enum(["open", "in_progress", "resolved", "closed"]).optional(),
  category: z.enum(["billing", "technical", "account", "other"]).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
})

export const updateAdminTicketSchema = z.object({
  status: z.enum(["open", "in_progress", "resolved", "closed"]).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
})

export type ListAdminTicketsQuery = z.infer<typeof listAdminTicketsQuerySchema>
export type UpdateAdminTicketInput = z.infer<typeof updateAdminTicketSchema>
