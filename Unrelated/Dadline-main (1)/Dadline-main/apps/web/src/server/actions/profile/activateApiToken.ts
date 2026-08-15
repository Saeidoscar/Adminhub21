"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import type { UserVerificationPayload } from "./verification.schemas"
import type { VerificationActionState } from "./verification.schemas"

const API_INTERNAL_URL = process.env.API_INTERNAL_URL || "http://api:8080"

type ApiTokenResponse = {
  message?: string
  data?: UserVerificationPayload
  errors?: Record<string, string[]>
}

export async function activateApiToken(
  _previousState: VerificationActionState,
  _formData: FormData,
): Promise<VerificationActionState> {
  const session = await auth()

  if (!session?.accessToken) {
    return {
      status: "error",
      message: "برای فعال‌سازی توکن وارد شوید.",
    }
  }

  try {
    const response = await fetch(`${API_INTERNAL_URL}/v1/users/me/api-token`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${session.accessToken}`,
      },
      cache: "no-store",
    })

    const body = (await response
      .json()
      .catch(() => null)) as ApiTokenResponse | null

    if (!response.ok) {
      const firstError = Object.values(body?.errors ?? {})
        .flat()
        .find(Boolean)

      return {
        status: "error",
        message:
          String(firstError || body?.message || "") ||
          "فعال‌سازی توکن API انجام نشد.",
      }
    }

    revalidatePath("/pishkhan/profile/verification")

    return {
      status: "success",
      message: body?.message || "توکن دسترسی API فعال شد.",
      token: body?.data?.apiToken.plainTextToken ?? null,
    }
  } catch {
    return {
      status: "error",
      message: "اتصال به سرور برقرار نشد.",
    }
  }
}
