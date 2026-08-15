"use server"

import { apiPost } from "@/lib/apiClient"

export type VerifyOtpForRegistrationResult = {
  verified: boolean
  error?: string
}

export async function verifyOtpForRegistration(
  mobile: string,
  code: string,
): Promise<VerifyOtpForRegistrationResult> {
  const res = await apiPost<{ verified: boolean }>(
    "/auth/otp/verify-registration",
    { mobile, code },
  )

  if (!res.ok || !res.data) {
    return { verified: false, error: res.error || "کد وارد شده صحیح نیست." }
  }

  return { verified: true }
}
