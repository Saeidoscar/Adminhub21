import { z } from "zod"

export const listToolsQuerySchema = z.object({
  category: z.string().trim().max(60).optional(),

  popular: z.enum(["true", "false"]).optional(),

  minRating: z.coerce.number().min(0).max(5).optional(),

  search: z.string().trim().max(120).optional(),
})

export const listEditorsQuerySchema = z.object({
  specialty: z.string().trim().max(60).optional(),

  minRating: z.coerce.number().min(0).max(5).optional(),

  search: z.string().trim().max(120).optional(),
})

export const listVibeCodersQuerySchema = z.object({
  stack: z.string().trim().max(60).optional(),

  minRating: z.coerce.number().min(0).max(5).optional(),

  search: z.string().trim().max(120).optional(),
})

export type ListToolsQuery = z.infer<typeof listToolsQuerySchema>

export type ListEditorsQuery = z.infer<typeof listEditorsQuerySchema>

export type ListVibeCodersQuery = z.infer<typeof listVibeCodersQuerySchema>
