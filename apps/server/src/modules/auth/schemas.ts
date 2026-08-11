import { z } from "zod"

export const registerSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(128),
  role: z.enum(["employer", "admin"]).default("employer"),
  nameEn: z.string().trim().min(1).max(120),
  nameFa: z.string().trim().min(1).max(120),
  phone: z.string().trim().max(32).optional(),
})

export const loginSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(128),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
