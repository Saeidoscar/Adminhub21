"use server"

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
      redirectTo: callbackUrl || appConfig.authenticatedEntryPath,
    })

    return {
      success: true,
    }
  } catch (error) {
    console.log("AUTH ERROR:", error)

    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") {
        return {
          error: "شماره موبایل یا رمز عبور اشتباه است.",
        }
      }

      return {
        error: "خطایی در ورود رخ داد.",
      }
    }

    return {
      error: "خطا در اتصال به سرور",
    }
  }
}
