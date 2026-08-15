"use client" /* <Tag className="bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-100">
                            {notification.channelLabel}
                        </Tag> */ /* <span>انقضا: {formatDate(notification.expiresAt)}</span> */

import Button from "@/components/ui/Button"
import Tag from "@/components/ui/Tag"
import type {
  NotificationItem,
  NotificationsPageData,
} from "@/server/actions/notifications/getNotifications"
import classNames from "@/utils/classNames"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { TbBell, TbExternalLink } from "react-icons/tb"

type Props = {
  data: NotificationsPageData
}

const dateFormatter = new Intl.DateTimeFormat("fa-IR", {
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Tehran",
})

const formatDate = (value: string | null) => {
  if (!value) return "بدون تاریخ"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "بدون تاریخ"

  return dateFormatter.format(date)
}

const statusTone = (status: string | null) => {
  switch (status) {
    case "sent":
    case "active":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-100"
    case "pending":
      return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-100"
    case "failed":
      return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-100"
    case "cancelled":
      return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-100"
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-100"
  }
}

const NotificationsClient = ({ data }: Props) => {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"personal" | "system">("personal")
  const activeNotifications =
    activeTab === "personal"
      ? data.personalNotifications
      : data.systemNotifications

  const renderNotification = (
    notification: NotificationItem,
    source: "personal" | "system",
  ) => (
    <div
      key={`${source}-${notification.id}`}
      className="flex min-w-0 flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 sm:flex-row sm:items-start sm:justify-between"
    >
      <div className="flex min-w-0 items-start gap-3">
        <span className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-lg text-primary">
          <TbBell />
        </span>
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Tag className={statusTone(notification.status)}>
              {notification.statusLabel}
            </Tag>
            <Tag className="bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-100">
              {notification.typeLabel}
            </Tag>
            {}
            {notification.isCritical && (
              <Tag className="bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-100">
                حیاتی
              </Tag>
            )}
          </div>
          {notification.title && (
            <h3 className="mb-1 text-sm font-bold text-gray-900 dark:text-gray-100">
              {notification.title}
            </h3>
          )}
          <p className="text-sm leading-7 text-gray-800 wrap-anywhere dark:text-gray-100">
            {notification.message}
          </p>
          <div className="mt-3 grid gap-2 text-xs text-gray-500 sm:grid-cols-2">
            <span>ثبت: {formatDate(notification.createdAt)}</span>
            {}
            <span>اولویت: {notification.priorityLabel}</span>
          </div>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {notification.link && (
          <Button
            size="xs"
            icon={<TbExternalLink />}
            onClick={() => router.push(notification.link!)}
          >
            مشاهده
          </Button>
        )}
      </div>
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="grid max-w-md flex-1 grid-cols-2 gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
          <button
            type="button"
            className={classNames(
              "flex h-10 items-center justify-center gap-2 rounded-lg px-3 text-sm font-bold transition",
              activeTab === "personal"
                ? "bg-white text-primary shadow-sm dark:bg-gray-700 dark:text-primary-mild"
                : "text-gray-500 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white",
            )}
            onClick={() => setActiveTab("personal")}
          >
            <span>شخصی</span>
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500 dark:bg-gray-800 dark:text-gray-300">
              {data.personalNotifications.length.toLocaleString("fa-IR")}
            </span>
          </button>
          <button
            type="button"
            className={classNames(
              "flex h-10 items-center justify-center gap-2 rounded-lg px-3 text-sm font-bold transition",
              activeTab === "system"
                ? "bg-white text-primary shadow-sm dark:bg-gray-700 dark:text-primary-mild"
                : "text-gray-500 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white",
            )}
            onClick={() => setActiveTab("system")}
          >
            <span>سیستم</span>
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500 dark:bg-gray-800 dark:text-gray-300">
              {data.systemNotifications.length.toLocaleString("fa-IR")}
            </span>
          </button>
        </div>
      </div>

      {activeNotifications.length > 0 ? (
        <div className="space-y-3">
          {activeNotifications.map((notification) =>
            renderNotification(notification, activeTab),
          )}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-gray-200 px-4 py-10 text-center text-sm text-gray-500 dark:border-gray-700">
          {activeTab === "personal"
            ? "اعلان شخصی جدیدی ندارید."
            : "اعلان سیستمی جدیدی وجود ندارد."}
        </div>
      )}
    </div>
  )
}

export default NotificationsClient
