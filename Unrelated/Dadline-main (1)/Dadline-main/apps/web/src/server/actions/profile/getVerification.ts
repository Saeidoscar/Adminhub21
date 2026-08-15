"use server"

import { auth } from "@/auth"
import type { UserVerificationPayload } from "./verification.schemas"

const API_INTERNAL_URL = process.env.API_INTERNAL_URL || "http://api:8080"

type VerificationResponse = {
  data: UserVerificationPayload
}

export async function getVerification(): Promise<{
  ok: boolean
  data: UserVerificationPayload | null
  error: string | null
}> {
  const session = await auth()

  if (!session?.accessToken) {
    return {
      ok: false,
      data: null,
      error: "برای مشاهده احراز هویت وارد شوید.",
    }
  }

  try {
    const response = await fetch(
      `${API_INTERNAL_URL}/v1/users/me/verification`,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
        cache: "no-store",
      },
    )

    const body = (await response
      .json()
      .catch(() => null)) as VerificationResponse | { message?: string } | null

    if (!response.ok || !body || !("data" in body)) {
      return {
        ok: false,
        data: null,
        error:
          (body && "message" in body ? body.message : null) ||
          "دریافت وضعیت احراز هویت با خطا روبه‌رو شد.",
      }
    }

    return { ok: true, data: body.data, error: null }
  } catch {
    return {
      ok: false,
      data: null,
      error: "اتصال به سرور برقرار نشد.",
    }
  }
}
