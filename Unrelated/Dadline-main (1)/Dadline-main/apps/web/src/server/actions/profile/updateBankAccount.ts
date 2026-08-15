"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { bankAccountFormSchema } from "./profile.schemas"
import type { ProfileActionState } from "./profile.schemas"

const API_INTERNAL_URL = process.env.API_INTERNAL_URL || "http://api:8080"

export async function updateBankAccount(
  _previousState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const session = await auth()

  if (!session?.accessToken) {
    return {
      status: "error",
      message: "برای ثبت شماره شبا وارد شوید.",
    }
  }

  const parsed = bankAccountFormSchema.safeParse({
    iban: String(formData.get("iban") ?? ""),
  })

  if (!parsed.success) {
    return {
      status: "error",
      message: "شماره شبا را اصلاح کنید.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  try {
    const response = await fetch(
      `${API_INTERNAL_URL}/v1/users/me/bank-account`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({
          iban: parsed.data.iban,
          gateway: "smart",
          return_url: String(formData.get("returnUrl") ?? "") || undefined,
          return_context: "user_bank_account_verification",
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
          "استعلام شماره شبا با مشکل مواجه شد؛ بعداً تلاش کنید.",
      }
    }

    revalidatePath("/pishkhan/profile")

    return {
      status: "success",
      message: body?.message || "شماره شبا ثبت شد.",
      requiresGateway: Boolean(body?.data?.payment?.requiresGateway),
      paymentUrl: body?.data?.payment?.paymentUrl ?? null,
    }
  } catch {
    return {
      status: "error",
      message: "استعلام شماره شبا با مشکل مواجه شد؛ بعداً تلاش کنید.",
    }
  }
}
