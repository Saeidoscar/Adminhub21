"use server"

import { adminApiPatch } from "@/lib/adminApi"
import { getAdminAuthContext } from "@/lib/adminSession"
import { redirect } from "next/navigation"

const parseValue = (rawValue: string, valueType: string) => {
  if (valueType === "string") return rawValue
  if (valueType === "number") {
    const value = Number(rawValue)
    if (!Number.isFinite(value)) throw new Error("مقدار عددی معتبر نیست.")
    return value
  }
  if (valueType === "boolean") {
    if (!["true", "false"].includes(rawValue)) {
      throw new Error("مقدار بولی باید true یا false باشد.")
    }
    return rawValue === "true"
  }
  if (valueType === "null") return rawValue.trim() === "" ? null : rawValue

  return JSON.parse(rawValue)
}

export async function updateAdminOption(optionId: number, formData: FormData) {
  const context = await getAdminAuthContext()
  if (!context) redirect("/sign-in")

  const key = String(formData.get("key") ?? "")
  const rawValue = String(formData.get("value") ?? "")
  const valueType = String(formData.get("valueType") ?? "string")
  const isSensitive = formData.get("isSensitive") === "1"
  const group = String(formData.get("group") ?? "general")
  const autoload = formData.get("autoload") === "on"

  let value: unknown
  try {
    value =
      isSensitive && rawValue.trim() === ""
        ? ""
        : parseValue(rawValue, valueType)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "مقدار تنظیم معتبر نیست."
    redirect(`/settings?error=${encodeURIComponent(message)}&focus=${optionId}`)
  }

  const response = await adminApiPatch(
    `/admin/options/${optionId}`,
    { value, group, autoload },
    context.accessToken,
  )

  if (!response.ok) {
    redirect(
      `/settings?error=${encodeURIComponent(response.error ?? "ذخیره تنظیم انجام نشد.")}&focus=${optionId}`,
    )
  }

  redirect(`/settings?updated=${encodeURIComponent(key)}&focus=${optionId}`)
}
