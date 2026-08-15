"use client"

import Tag from "@/components/ui/Tag"
import type { ContractStatus } from "@/@types/contracts"

export const contractStatusOptions = [
  { value: "all", label: "همه وضعیت‌ها" },
  { value: "draft", label: "پیش‌نویس" },
  { value: "active", label: "آماده امضا" },
  { value: "completed", label: "منعقد شده" },
  { value: "expired", label: "منقضی شده" },
  { value: "cancelled", label: "لغو شده" },
] as const

export const statusTone: Record<ContractStatus, string> = {
  draft: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-100",
  active: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-100",
  completed:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-100",
  expired:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-100",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-100",
}

export function ContractStatusTag({
  status,
  label,
}: {
  status: ContractStatus
  label: string
}) {
  return <Tag className={statusTone[status]}>{label}</Tag>
}

export function formatPersianDate(value?: string | null) {
  if (!value) return "-"

  return new Intl.DateTimeFormat("fa-IR-u-ca-persian-nu-arabext", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Tehran",
  }).format(new Date(value))
}

export function formatPersianDateTime(value?: string | null) {
  if (!value) return "-"

  return new Intl.DateTimeFormat("fa-IR-u-ca-persian-nu-arabext", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Tehran",
  }).format(new Date(value))
}

export function currentStepForStatus(status: ContractStatus) {
  if (status === "draft") return 0
  if (status === "active") return 3
  if (status === "completed") return 4
  if (status === "cancelled" || status === "expired") return 1

  return 0
}
