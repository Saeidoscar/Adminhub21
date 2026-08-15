"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { profileFormSchema } from "./profile.schemas"
import type { ProfileActionState } from "./profile.schemas"

const API_INTERNAL_URL = process.env.API_INTERNAL_URL || "http://api:8080"

const stringFromForm = (formData: FormData, key: string) =>
  String(formData.get(key) ?? "")

export async function updateProfile(
  _previousState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const session = await auth()

  if (!session?.accessToken) {
    return {
      status: "error",
      message: "برای ذخیره پروفایل وارد شوید.",
    }
  }

  const parsed = profileFormSchema.safeParse({
    firstName: stringFromForm(formData, "firstName"),
    lastName: stringFromForm(formData, "lastName"),
    email: stringFromForm(formData, "email"),
    nationalId: stringFromForm(formData, "nationalId"),
    birthDate: [
      stringFromForm(formData, "birthYear"),
      stringFromForm(formData, "birthMonth"),
      stringFromForm(formData, "birthDay"),
    ].every(Boolean)
      ? `${stringFromForm(formData, "birthYear")}-${stringFromForm(formData, "birthMonth")}-${stringFromForm(formData, "birthDay")}`
      : "",
    cityId: stringFromForm(formData, "cityId"),
  })

  if (!parsed.success) {
    return {
      status: "error",
      message: "برخی اطلاعات واردشده نیاز به اصلاح دارد.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  const values = parsed.data

  try {
    const response = await fetch(`${API_INTERNAL_URL}/v1/users/me`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify({
        first_name: values.firstName,
        last_name: values.lastName,
        email: values.email,
        national_id: values.nationalId,
        birth_date: values.birthDate,
        city_id: values.cityId,
      }),
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
          "ذخیره پروفایل انجام نشد.",
      }
    }

    revalidatePath("/pishkhan/profile")
    revalidatePath("/pishkhan")

    return {
      status: "success",
      message: body?.message || "اطلاعات پروفایل ذخیره شد.",
    }
  } catch {
    return {
      status: "error",
      message: "اتصال به سرور برقرار نشد.",
    }
  }
}
