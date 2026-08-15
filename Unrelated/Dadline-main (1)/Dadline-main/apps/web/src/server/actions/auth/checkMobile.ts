"use server"

import { apiPost } from "@/lib/apiClient"

export type CheckMobileResult = {
  exists: boolean
  firstName: string | null
  error?: string
}

export async function checkMobile(mobile: string): Promise<CheckMobileResult> {
  const res = await apiPost<{ exists: boolean firstName: string | null }>(
    "/auth/check-mobile",
    { mobile },
  )

  if (!res.ok || !res.data) {
    return {
      exists: false,
      firstName: null,
      error: res.error || "خطا در بررسی شماره موبایل",
    }
  }

  return {
    exists: res.data.exists,
    firstName: res.data.firstName,
  }
}
