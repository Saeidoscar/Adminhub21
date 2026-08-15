"use server"
// eslint-disable-next-line @typescript-eslint/no-explicit-any

/**
 * ورود با موبایل + کد OTP، از طریق provider جدا (otp-credentials)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any

import { signIn } from "@/auth"
import appConfig from "@/configs/app.config"
import { AuthError } from "next-auth"
import type { SignInCredential } from "@/@types/auth"

export const onSignInWithCredentials = async (
  { mobile, password }: SignInCredential,
  callbackUrl?: string,
) => {
  try {
    await signIn("credentials", {
      mobile,
      password,
      redirectTo:
        callbackUrl ||
        appConfig.authenticatedEntryPath,
    })
  } catch (error) {
    if (
      error instanceof
      AuthError
    ) {
      switch (error.type) {
        case "CredentialsSignin":
          return {
            error:
              error.message ||
              "اطلاعات ورود اشتباه است!",
          }
        default:
          return {
            error:
              error.message ||
              "اتصال به سرور برقرار نشد، بعدا تلاش کنید",
          }
      }
    }
    throw error
  }
}
export const onSignInWithOtp = async (
  { mobile, code }: { mobile: string code: string },
  callbackUrl?: string,
) => {
  try {
    await signIn("otp-credentials", {
      mobile,
      code,
      redirectTo:
        callbackUrl ||
        appConfig.authenticatedEntryPath,
    })
  } catch (error) {
    if (
      error instanceof
      AuthError
    ) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: error.message || "کد وارد شده صحیح نیست!" }
        default:
          return {
            error: error.message || "اتصال به سرور برقرار نشد، بعدا تلاش کنید",
          }
      }
    }
    throw error
  }
}
