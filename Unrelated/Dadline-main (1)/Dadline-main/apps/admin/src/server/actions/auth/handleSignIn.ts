"use server"

import { signIn } from "@/auth"
import appConfig from "@/configs/app.config"
import { AuthError } from "next-auth"
import type { SignInCredential } from "@/@types/auth"

export const onSignInWithCredentials = async (
  { identifier, password }: SignInCredential,
  callbackUrl?: string,
) => {
  try {
    const requestedCallbackUrl = callbackUrl ?? ""
    const safeCallbackUrl =
      requestedCallbackUrl.startsWith("/") &&
      !requestedCallbackUrl.startsWith("//")
        ? requestedCallbackUrl
        : appConfig.authenticatedEntryPath

    await signIn("credentials", {
      identifier,
      password,
      redirectTo: safeCallbackUrl,
    })
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") {
        return {
          error:
            "اطلاعات ورود مدیر صحیح نیست یا حساب شما دسترسی مدیریتی ندارد.",
        }
      }
      return { error: "ارتباط امن با سرور برقرار نشد؛ دوباره تلاش کنید." }
    }
    throw error
  }
}
