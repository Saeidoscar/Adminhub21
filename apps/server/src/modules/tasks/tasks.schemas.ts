import { z } from "zod"

export const createTaskSchema = z.object({
  caseId: z.string().uuid(),
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1).max(2000),
  assignedTo: z.string().uuid().optional(),
  status: z.enum(["todo", "in_progress", "done", "blocked"]).default("todo"),
  priority: z.string().trim().max(40).default("medium"),
  dueDate: z.string().trim().max(120).optional(),
})

export const updateTaskSchema = createTaskSchema
  .partial()
  .omit({ caseId: true })

export type CreateTaskInput = z.infer<typeof createTaskSchema>
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>
