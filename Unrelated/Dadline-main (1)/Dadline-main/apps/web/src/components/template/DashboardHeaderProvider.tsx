"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { z } from "zod"

const taskSchema = z.object({
  id: z.number(),
  title: z.string(),
  link: z.string().nullable(),
  priority: z.enum(["low", "medium", "high"]),
  isViewed: z.boolean(),
  updatedAt: z.string().nullable(),
})

const notificationSchema = z.object({
  id: z.number(),
  message: z.string(),
  type: z.string(),
  buttonText: z.string().nullable(),
  link: z.string().nullable(),
  createdAt: z.string().nullable(),
})

const dashboardHeaderSchema = z.object({
  success: z.boolean(),
  data: z.object({
    user: z.object({
      firstName: z.string().nullable().optional(),
      lastName: z.string().nullable().optional(),
      mobile: z.string(),
      email: z.string().nullable(),
      avatar: z.string().nullable(),
    }),
    header: z.object({
      balance: z.number().nonnegative(),
      unreadTasksCount: z.number().nonnegative(),
      tasks: z.array(taskSchema),
      notificationsCount: z.number().nonnegative(),
      personalNotificationsCount: z.number().nonnegative().optional(),
      systemNotificationsCount: z.number().nonnegative().optional(),
      personalNotifications: z.array(notificationSchema).optional(),
      systemNotifications: z.array(notificationSchema).optional(),
      notifications: z.array(notificationSchema),
    }),
  }),
})

export type DashboardHeaderData = z.infer<typeof dashboardHeaderSchema>["data"]
export type DashboardTask = z.infer<typeof taskSchema>
export type DashboardNotification = z.infer<typeof notificationSchema>

type DashboardHeaderContextValue = {
  data: DashboardHeaderData | null
  loading: boolean
  refresh: () => Promise<void>
}

const DashboardHeaderContext =
  createContext<DashboardHeaderContextValue | null>(null)

export function DashboardHeaderProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<DashboardHeaderData | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/dashboard/header", {
        cache: "no-store",
      })

      if (!response.ok) return

      const payload = dashboardHeaderSchema.safeParse(await response.json())

      if (payload.success) {
        setData(payload.data.data)
      }
    } catch {
      return
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const value = useMemo(
    () => ({
      data,
      loading,
      refresh,
    }),
    [data, loading, refresh],
  )

  return (
    <DashboardHeaderContext.Provider value={value}>
      {children}
    </DashboardHeaderContext.Provider>
  )
}

export function useDashboardHeader() {
  const context = useContext(DashboardHeaderContext)

  if (!context) {
    throw new Error(
      "useDashboardHeader must be used inside DashboardHeaderProvider.",
    )
  }

  return context
}
