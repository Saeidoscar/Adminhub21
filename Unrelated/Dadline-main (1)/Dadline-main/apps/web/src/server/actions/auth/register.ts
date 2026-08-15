"use server"

// بعد از ثبت‌نام موفق، بلافاصله با همان رمز عبور وارد می‌کنیم
// تا session ساخته شود (بدون این‌که کاربر دوباره فرم لاگین را ببیند).

import { apiPost } from "@/lib/apiClient"
import { signIn } from "@/auth"
import appConfig from "@/configs/app.config"

export type RegisterPayload = {
  firstName: string
  lastName: string
  mobile: string
  password: string
  passwordConfirmation: string
  otpCode: string
  referralCode?: string
}

export type RegisterResult = {
  success: boolean
  error?: string
}

export async function registerUser(
  payload: RegisterPayload,
  callbackUrl?: string,
): Promise<RegisterResult> {
  const res = await apiPost("/auth/register", {
    first_name: payload.firstName,
    last_name: payload.lastName,
    mobile: payload.mobile,
    password: payload.password,
    password_confirmation: payload.passwordConfirmation,
    otp_code: payload.otpCode,
    referral_code:
      payload.referralCode ||
      undefined,
  })

  if (!res.ok) {
    return {
      success: false,
      error:
        res.error ||
        "ثبت‌نام ناموفق بود.",
    }
  }
  await signIn("credentials", {
    mobile: payload.mobile,
    password: payload.password,
    redirectTo: callbackUrl || appConfig.authenticatedEntryPath,
  })

  return { success: true }
}
