"use client"

import Tag from "@/components/ui/Tag"
import type {
  PayoutSettlementStatus,
  WalletDirection,
  WalletTransactionStatus,
} from "@/@types/wallet"

export const directionOptions = [
  { value: "all", label: "همه نوع‌ها" },
  { value: "deposit", label: "واریز" },
  { value: "withdrawal", label: "برداشت" },
] as const

export const statusOptions = [
  { value: "all", label: "همه وضعیت‌ها" },
  { value: "pending", label: "در انتظار" },
  { value: "processing", label: "در حال پردازش" },
  { value: "completed", label: "تکمیل‌شده" },
  { value: "failed", label: "ناموفق" },
  { value: "cancelled", label: "لغوشده" },
  { value: "reversed", label: "برگشت‌خورده" },
] as const

export const moneyFormatter = new Intl.NumberFormat("fa-IR")

export const formatMoney = (value: number) =>
  `${moneyFormatter.format(value)} تومان`

export const formatMoneyNoneLabel = (value: number) =>
  `${moneyFormatter.format(value)}`

export const formatPersianDate = (value?: string | null) => {
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

const directionTone: Record<WalletDirection, string> = {
  deposit:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-100",
  withdrawal: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-100",
}

const statusTone: Record<WalletTransactionStatus, string> = {
  pending:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-100",
  processing:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-100",
  completed:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-100",
  failed: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-100",
  cancelled: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-100",
  reversed:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-100",
}

export function WalletDirectionTag({
  direction,
  label,
}: {
  direction: WalletDirection
  label: string
}) {
  return <Tag className={directionTone[direction]}>{label}</Tag>
}

export function WalletStatusTag({
  status,
  label,
}: {
  status: WalletTransactionStatus | PayoutSettlementStatus
  label: string
}) {
  return (
    <Tag
      className={
        statusTone[(status as WalletTransactionStatus)] ?? statusTone.pending
      }
    >
      {label}
    </Tag>
  )
}
