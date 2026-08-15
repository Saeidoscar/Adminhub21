"use server"

import { apiPost } from "@/lib/apiClient"

export type SendOtpResult = {
  success: boolean
  error?: string
}

export async function sendOtp(
  mobile: string,
  channel: "sms" | "call" = "sms",
): Promise<SendOtpResult> {
  const res = await apiPost("/auth/otp/send", { mobile, channel })

  if (!res.ok) {
    return { success: false, error: res.error || "ارسال کد ناموفق بود." }
  }

  return { success: true }
}
