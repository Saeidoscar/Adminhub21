import { z } from "zod"

export const createTimeLogSchema = z.object({
  caseId: z.string().uuid().optional(),
  taskId: z.string().uuid().optional(),
  description: z.string().trim().min(1).max(500),
  startedAt: z.string().trim().max(120),
  endedAt: z.string().trim().max(120),
})

export const listTimeLogsQuerySchema = z.object({
  caseId: z.string().uuid().optional(),
  taskId: z.string().uuid().optional(),
})

export type CreateTimeLogInput = z.infer<typeof createTimeLogSchema>
export type ListTimeLogsQuery = z.infer<typeof listTimeLogsQuerySchema>
