"use server"

import { apiGet } from "@/lib/apiClient"
import getServerSession from "@/server/actions/auth/getServerSession"
import { z } from "zod"

const notificationItemSchema = z.object({
  id: z.number(),
  title: z.string().nullable(),
  message: z.string(),
  source: z.enum(["personal", "system"]),
  type: z.string(),
  typeLabel: z.string(),
  channel: z.string().nullable(),
  channelLabel: z.string(),
  status: z.string().nullable(),
  statusLabel: z.string(),
  priority: z.string().nullable(),
  priorityLabel: z.string(),
  isCritical: z.boolean(),
  eventKey: z.string().nullable(),
  templateKey: z.string().nullable(),
  buttonText: z.string().nullable(),
  link: z.string().nullable(),
  createdAt: z.string().nullable(),
  expiresAt: z.string().nullable(),
})

const notificationsResponseSchema = z.object({
  data: z.object({
    personalNotifications: z.array(notificationItemSchema),
    systemNotifications: z.array(notificationItemSchema),
    personalNotificationsCount: z.number(),
    systemNotificationsCount: z.number(),
    notificationsCount: z.number(),
  }),
})

export type NotificationItem = z.infer<typeof notificationItemSchema>
export type NotificationsPageData = z.infer<typeof notificationsResponseSchema>["data"]

export async function getNotifications(): Promise<{
  data: NotificationsPageData | null
  error: string | null
  status: number
}> {
  const session = await getServerSession()
  if (!session?.accessToken) {
    return {
      data: null,
      error: "برای مشاهده اعلان‌ها وارد شوید.",
      status: 401,
    }
  }

  const response = await apiGet<unknown>(
    "/users/me/notifications",
    session.accessToken,
    {
      revalidate: false,
    },
  )

  if (!response.ok || !response.data) {
    return { data: null, error: response.error, status: response.status }
  }

  const parsed = notificationsResponseSchema.safeParse(response.data)
  if (!parsed.success) {
    return {
      data: null,
      error: "پاسخ اعلان‌ها از سرور معتبر نیست.",
      status: 422,
    }
  }

  return { data: parsed.data.data, error: null, status: response.status }
}
