import type { Lang, Tr } from "../../i18n"

export type { Lang, Tr }
export type TabKey = "cases" | "tasks" | "events" | "timeLogs"

export const CASE_STATUS: Record<string, {
  en: string
  fa: string
  color: string
}> = {
  open: { en: "Open", fa: "باز", color: "bg-emerald-100 text-emerald-700" },
  in_progress: {
    en: "In Progress",
    fa: "در حال انجام",
    color: "bg-blue-100 text-blue-700",
  },
  review: { en: "Review", fa: "بررسی", color: "bg-amber-100 text-amber-700" },
  closed: { en: "Closed", fa: "بسته شده", color: "bg-gray-100 text-gray-700" },
}

export const TASK_STATUS: Record<string, {
  en: string
  fa: string
  color: string
}> = {
  todo: { en: "To Do", fa: "انجام نشده", color: "bg-gray-100 text-gray-700" },
  in_progress: {
    en: "In Progress",
    fa: "در حال انجام",
    color: "bg-blue-100 text-blue-700",
  },
  done: {
    en: "Done",
    fa: "انجام شده",
    color: "bg-emerald-100 text-emerald-700",
  },
  blocked: { en: "Blocked", fa: "مسدود", color: "bg-red-100 text-red-700" },
}

export const PRIORITY: Record<string, { en: string; fa: string; color: string }> =
  {
    low: { en: "Low", fa: "پایین", color: "bg-gray-100 text-gray-700" },
    medium: { en: "Medium", fa: "متوسط", color: "bg-blue-100 text-blue-700" },
    high: { en: "High", fa: "بالا", color: "bg-amber-100 text-amber-700" },
    urgent: { en: "Urgent", fa: "فوری", color: "bg-red-100 text-red-700" },
  }

export const EVENT_COLORS = [
  "#1e3a5f",
  "#0ea5e9",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
]

export function fmtDate(value: string) {
  try {
    return new Date(value).toLocaleDateString()
  } catch {
    return value
  }
}

export function fmtDateTime(value: string) {
  try {
    return new Date(value).toLocaleString()
  } catch {
    return value
  }
}

export function toLocalInput(value: string) {
  const d = new Date(value)
  if (isNaN(d.getTime())) return ""
  const off = d.getTimezoneOffset()
  const local = new Date(d.getTime() - off * 60000)
  return local.toISOString().slice(0, 16)
}

export function calcMinutes(startedAt: string, endedAt: string) {
  if (!startedAt || !endedAt) return null
  const diff = new Date(endedAt).getTime() - new Date(startedAt).getTime()
  if (isNaN(diff) || diff < 0) return null
  return Math.round(diff / 60000)
}
