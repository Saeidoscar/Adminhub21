"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import type { VerificationActionState } from "./verification.schemas"

const API_INTERNAL_URL = process.env.API_INTERNAL_URL || "http://api:8080"

export async function verifyLevelThree(
  _previousState: VerificationActionState,
  formData: FormData,
): Promise<VerificationActionState> {
  const session = await auth()

  if (!session?.accessToken) {
    return {
      status: "error",
      message: "برای احراز هویت بانکی وارد شوید.",
    }
  }

  try {
    const response = await fetch(
      `${API_INTERNAL_URL}/v1/users/me/verification/level-three`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({
          gateway: "smart",
          return_url: String(formData.get("returnUrl") ?? "") || undefined,
          return_context: "user_verification_level_three",
        }),
        cache: "no-store",
      },
    )

    const body = await response.json().catch(() => null)

    if (!response.ok) {
      const firstError = Object.values(body?.errors ?? {})
        .flat()
        .find(Boolean)

      return {
        status: "error",
        message:
          String(firstError || body?.message || "") ||
          "شروع احراز هویت بانکی انجام نشد.",
        fieldErrors: firstError
          ? { bankVerification: [String(firstError)] }
          : undefined,
      }
    }

    revalidatePath("/pishkhan/profile/verification")
    revalidatePath("/pishkhan/profile")
    revalidatePath("/pishkhan/wallet")

    return {
      status: "success",
      message:
        body?.message || "برای تکمیل احراز هویت بانکی، پرداخت را انجام دهید.",
      requiresGateway: Boolean(body?.data?.payment?.requiresGateway),
      paymentUrl: body?.data?.payment?.paymentUrl ?? null,
    }
  } catch {
    return {
      status: "error",
      message: "اتصال به درگاه احراز هویت بانکی برقرار نشد.",
    }
  }
}
