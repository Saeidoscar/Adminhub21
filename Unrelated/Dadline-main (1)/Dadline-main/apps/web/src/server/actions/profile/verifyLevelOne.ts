"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { verificationLevelOneSchema } from "./verification.schemas"
import type { VerificationActionState } from "./verification.schemas"

const API_INTERNAL_URL = process.env.API_INTERNAL_URL || "http://api:8080"

export async function verifyLevelOne(
  _previousState: VerificationActionState,
  formData: FormData,
): Promise<VerificationActionState> {
  const session = await auth()

  if (!session?.accessToken) {
    return {
      status: "error",
      message: "برای احراز هویت وارد شوید.",
    }
  }

  const parsed = verificationLevelOneSchema.safeParse({
    nationalId: String(formData.get("nationalId") ?? ""),
  })

  if (!parsed.success) {
    return {
      status: "error",
      message: "کد ملی را اصلاح کنید.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  return submitVerificationRequest(
    "/v1/users/me/verification/level-one",
    {
      national_id: parsed.data.nationalId,
      gateway: "smart",
      return_url: String(formData.get("returnUrl") ?? "") || undefined,
      return_context: "user_verification_level_one",
    },
    session.accessToken,
  )
}

async function submitVerificationRequest(
  path: string,
  payload: Record<string, unknown>,
  accessToken: string,
): Promise<VerificationActionState> {
  try {
    const response = await fetch(`${API_INTERNAL_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    })

    const body = await response.json().catch(() => null)

    if (!response.ok) {
      const firstError = Object.values(body?.errors ?? {})
        .flat()
        .find(Boolean)

      return {
        status: "error",
        message:
          String(firstError || body?.message || "") ||
          "استعلام احراز هویت انجام نشد.",
      }
    }

    revalidatePath("/pishkhan/profile/verification")
    revalidatePath("/pishkhan/profile")

    return {
      status: "success",
      message: body?.message || "احراز هویت با موفقیت انجام شد.",
      requiresGateway: Boolean(body?.data?.payment?.requiresGateway),
      paymentUrl: body?.data?.payment?.paymentUrl ?? null,
    }
  } catch {
    return {
      status: "error",
      message: "استعلام احراز هویت با مشکل مواجه شد؛ بعداً تلاش کنید.",
    }
  }
}
