import { z } from "zod"

export const listUsersQuerySchema = z.object({
  role: z.enum(["employer", "admin", "super_admin"]).optional(),
  search: z.string().trim().max(120).optional(),
})

export const updateUserSchema = z.object({
  role: z.enum(["employer", "admin", "super_admin"]).optional(),
  nameEn: z.string().trim().max(120).optional(),
  nameFa: z.string().trim().max(120).optional(),
  phone: z.string().trim().max(32).optional().nullable(),
  phoneVerified: z.boolean().optional(),
})

export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
