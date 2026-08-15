"use server"

import { apiGet } from "@/lib/apiClient"
import getServerSession from "@/server/actions/auth/getServerSession"
import {
  notificationSettingsResponseSchema,
  type NotificationSettings,
} from "./notificationSettings.schemas"

export async function getNotificationSettings(): Promise<{
  data: NotificationSettings | null
  error: string | null
  status: number
}> {
  const session = await getServerSession()
  if (!session?.accessToken) {
    return {
      data: null,
      error: "برای مشاهده تنظیمات اعلان وارد شوید.",
      status: 401,
    }
  }

  const response = await apiGet<unknown>(
    "/users/me/notification-settings",
    session.accessToken,
    {
      revalidate: false,
      tags: ["notification-settings"],
    },
  )

  if (!response.ok || !response.data) {
    return { data: null, error: response.error, status: response.status }
  }

  const parsed = notificationSettingsResponseSchema.safeParse(response.data)
  if (!parsed.success) {
    return {
      data: null,
      error: "پاسخ تنظیمات اعلان از سرور معتبر نیست.",
      status: 422,
    }
  }

  return { data: parsed.data.data, error: null, status: response.status }
}
