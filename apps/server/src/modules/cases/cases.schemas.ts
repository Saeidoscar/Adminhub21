import { z } from "zod"

export const createCaseSchema = z.object({
  employerId: z.string().uuid(),
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1).max(2000),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  tags: z.array(z.string().trim().max(40)).max(20).default([]),
})

export const updateCaseSchema = createCaseSchema
  .partial()
  .omit({ employerId: true })

export const listCasesQuerySchema = z.object({
  status: z.enum(["open", "in_progress", "review", "closed"]).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  search: z.string().trim().max(120).optional(),
})

export type CreateCaseInput = z.infer<typeof createCaseSchema>
export type UpdateCaseInput = z.infer<typeof updateCaseSchema>
export type ListCasesQuery = z.infer<typeof listCasesQuerySchema>
