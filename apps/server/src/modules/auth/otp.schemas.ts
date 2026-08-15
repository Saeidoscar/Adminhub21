import { z } from "zod"

export const sendOtpSchema = z.object({
  phone: z.string().trim().min(1).max(32),
})

export const verifyOtpSchema = z.object({
  phone: z.string().trim().min(1).max(32),
  code: z.string().trim().length(6),
})

export type SendOtpInput = z.infer<typeof sendOtpSchema>
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>
