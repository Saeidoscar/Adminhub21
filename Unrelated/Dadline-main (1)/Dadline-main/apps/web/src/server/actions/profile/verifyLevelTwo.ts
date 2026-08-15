"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { verificationLevelTwoSchema } from "./verification.schemas"
import type { VerificationActionState } from "./verification.schemas"

const API_INTERNAL_URL = process.env.API_INTERNAL_URL || "http://api:8080"

const stringFromForm = (formData: FormData, key: string) =>
  String(formData.get(key) ?? "")

export async function verifyLevelTwo(
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

  const parsed = verificationLevelTwoSchema.safeParse({
    birthDate: [
      stringFromForm(formData, "birthYear"),
      stringFromForm(formData, "birthMonth"),
      stringFromForm(formData, "birthDay"),
    ].every(Boolean)
      ? `${stringFromForm(formData, "birthYear")}-${stringFromForm(formData, "birthMonth")}-${stringFromForm(formData, "birthDay")}`
      : "",
  })

  if (!parsed.success) {
    return {
      status: "error",
      message: "تاریخ تولد را اصلاح کنید.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  try {
    const response = await fetch(
      `${API_INTERNAL_URL}/v1/users/me/verification/level-two`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({
          birth_date: parsed.data.birthDate,
          gateway: "smart",
          return_url: String(formData.get("returnUrl") ?? "") || undefined,
          return_context: "user_verification_level_two",
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
          "استعلام احراز هویت سطح ۲ انجام نشد.",
      }
    }

    revalidatePath("/pishkhan/profile/verification")
    revalidatePath("/pishkhan/profile")

    return {
      status: "success",
      message: body?.message || "احراز هویت سطح ۲ تایید شد.",
      requiresGateway: Boolean(body?.data?.payment?.requiresGateway),
      paymentUrl: body?.data?.payment?.paymentUrl ?? null,
    }
  } catch {
    return {
      status: "error",
      message: "استعلام سطح ۲ با مشکل مواجه شد؛ بعداً تلاش کنید.",
    }
  }
}
