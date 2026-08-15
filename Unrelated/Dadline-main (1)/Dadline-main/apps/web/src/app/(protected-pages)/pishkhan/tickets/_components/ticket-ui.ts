import type { TicketPriority, TicketStatus } from "@/@types/tickets"

export const statusClasses: Record<TicketStatus, string> = {
  open: "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-950/40 dark:text-blue-200 dark:ring-blue-800",
  pending:
    "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:ring-amber-800",
  answered:
    "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:ring-emerald-800",
  referred:
    "bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-950/40 dark:text-violet-200 dark:ring-violet-800",
  closed:
    "bg-gray-100 text-gray-600 ring-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700",
}

export const priorityClasses: Record<TicketPriority, string> = {
  low: "text-gray-500",
  normal: "text-blue-600 dark:text-blue-300",
  high: "text-orange-600 dark:text-orange-300",
  urgent: "text-red-600 dark:text-red-300",
}

export const formatTicketDate = (value: string | null, withTime = true) => {
  if (!value) return "—"

  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(new Date(value))
}

export const formatFileSize = (value: number | null) => {
  if (!value) return ""
  if (value < 1024) return `${value.toLocaleString("fa-IR")} بایت`
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} کیلوبایت`

  return `${(value / (1024 * 1024)).toFixed(1)} مگابایت`
}

export const ticketListQuery = (params: {
  q?: string
  status?: string
  priority?: string
  department?: string
  page?: number
}) => {
  const query = new URLSearchParams()
  if (params.q) query.set("q", params.q)
  if (params.status && params.status !== "all")
    query.set("status", params.status)
  if (params.priority && params.priority !== "all")
    query.set("priority", params.priority)
  if (params.department && params.department !== "all")
    query.set("department", params.department)
  if (params.page && params.page > 1) query.set("page", String(params.page))

  return query.toString()
}
