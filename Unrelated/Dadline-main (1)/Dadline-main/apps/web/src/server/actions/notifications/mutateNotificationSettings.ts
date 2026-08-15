"use server"

import { apiPatch, apiPost } from "@/lib/apiClient"
import getServerSession from "@/server/actions/auth/getServerSession"
import { revalidatePath } from "next/cache"
import {
  notificationMutationResponseSchema,
  type NotificationMutationState,
} from "./notificationSettings.schemas"

const successState = (message: string): NotificationMutationState => ({
  status: "success",
  message,
})

const errorState = (
  message: string | null,
  fieldErrors?: NotificationMutationState["fieldErrors"],
): NotificationMutationState => ({
  status: "error",
  message: message ?? "خطایی رخ داد، دوباره تلاش کنید.",
  fieldErrors,
})

const boolFromForm = (formData: FormData, key: string) =>
  String(formData.get(key) ?? "false") === "true"

const timeFromForm = (formData: FormData, key: string) => {
  const value = String(formData.get(key) ?? "").trim()
  return value.length > 0 ? value : null
}

export async function updateNotificationSettings(
  _prevState: NotificationMutationState,
  formData: FormData,
): Promise<NotificationMutationState> {
  const session = await getServerSession()
  if (!session?.accessToken) {
    return errorState("برای ذخیره تنظیمات اعلان وارد شوید.")
  }

  const quietHoursEnabled = boolFromForm(formData, "quietHoursEnabled")
  const response = await apiPatch<unknown>(
    "/users/me/notification-settings",
    {
      sms_enabled: boolFromForm(formData, "smsEnabled"),
      bot_enabled: boolFromForm(formData, "botEnabled"),
      push_enabled: boolFromForm(formData, "pushEnabled"),
      email_enabled: boolFromForm(formData, "emailEnabled"),
      eitaa_enabled: boolFromForm(formData, "eitaaEnabled"),
      bale_enabled: boolFromForm(formData, "baleEnabled"),
      quiet_hours_start: quietHoursEnabled
        ? timeFromForm(formData, "quietHoursStart")
        : null,
      quiet_hours_end: quietHoursEnabled
        ? timeFromForm(formData, "quietHoursEnd")
        : null,
      timezone: "Asia/Tehran",
    },
    session.accessToken,
  )

  if (!response.ok || !response.data) return errorState(response.error)

  const parsed = notificationMutationResponseSchema.safeParse(response.data)
  if (!parsed.success) return errorState("پاسخ سرور معتبر نیست.")

  revalidatePath("/pishkhan/settings/notifications")
  revalidatePath("/pishkhan/profile")

  return successState(parsed.data.message)
}

export async function buySmsPackage(
  _prevState: NotificationMutationState,
  formData: FormData,
): Promise<NotificationMutationState> {
  const session = await getServerSession()
  if (!session?.accessToken)
    return errorState("برای خرید بسته پیامکی وارد شوید.")

  const units = Number(String(formData.get("units") ?? "").replace(/\D/g, ""))
  if (!Number.isInteger(units) || units < 50) {
    return errorState("بسته پیامکی معتبر نیست.", {
      units: ["یک بسته پیامکی را انتخاب کنید."],
    })
  }

  const response = await apiPost<unknown>(
    "/users/me/notification-settings/sms-packages",
    { units },
    session.accessToken,
  )

  if (!response.ok || !response.data) {
    const fieldErrors: NotificationMutationState["fieldErrors"] = {}
    if (response.error?.includes("کیف پول") === true) {
      fieldErrors.wallet = [response.error]
    }

    return errorState(
      response.error,
      Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined,
    )
  }

  const parsed = notificationMutationResponseSchema.safeParse(response.data)
  if (!parsed.success) return errorState("پاسخ سرور معتبر نیست.")

  revalidatePath("/pishkhan/settings/notifications")
  revalidatePath("/pishkhan/wallet")
  revalidatePath("/pishkhan/profile")

  return successState(parsed.data.message)
}
