import { z } from "zod"

export const createEventSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).optional(),
  startAt: z.string().trim().max(120),
  endAt: z.string().trim().max(120),
  allDay: z.boolean().default(false),
  color: z.string().trim().max(20).default("#3b82f6"),
})

export const updateEventSchema = createEventSchema.partial()

export const listEventsQuerySchema = z.object({
  from: z.string().trim().max(120).optional(),
  to: z.string().trim().max(120).optional(),
})

export type CreateEventInput = z.infer<typeof createEventSchema>
export type UpdateEventInput = z.infer<typeof updateEventSchema>
export type ListEventsQuery = z.infer<typeof listEventsQuerySchema>
