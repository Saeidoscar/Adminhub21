export const TICKET_CATEGORY_LABELS: Record<string, { en: string; fa: string }> = {
  billing: { en: "Billing", fa: "مالی" },
  technical: { en: "Technical", fa: "فنی" },
  account: { en: "Account", fa: "حساب کاربری" },
  other: { en: "Other", fa: "سایر" },
}

export const TICKET_PRIORITY_COLORS: Record<string, string> = {
  low: "bg-gray-100 text-gray-700",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-amber-100 text-amber-700",
  urgent: "bg-red-100 text-red-700",
}

export const TICKET_PRIORITY_LABELS: Record<string, { en: string; fa: string }> = {
  low: { en: "Low", fa: "پایین" },
  medium: { en: "Medium", fa: "متوسط" },
  high: { en: "High", fa: "بالا" },
  urgent: { en: "Urgent", fa: "فوری" },
}

export const TICKET_STATUS_COLORS: Record<string, string> = {
  open: "bg-emerald-100 text-emerald-700",
  in_progress: "bg-blue-100 text-blue-700",
  resolved: "bg-purple-100 text-purple-700",
  closed: "bg-gray-100 text-gray-700",
}

export const TICKET_STATUS_LABELS: Record<string, { en: string; fa: string }> = {
  open: { en: "Open", fa: "باز" },
  in_progress: { en: "In Progress", fa: "در حال بررسی" },
  resolved: { en: "Resolved", fa: "حل شده" },
  closed: { en: "Closed", fa: "بسته شده" },
}

export function ticketCategoryLabel(key: string, lang: "en" | "fa"): string {
  return TICKET_CATEGORY_LABELS[key]?.[lang] || key
}

export function ticketPriorityLabel(key: string, lang: "en" | "fa"): string {
  return TICKET_PRIORITY_LABELS[key]?.[lang] || key
}

export function ticketStatusLabel(key: string, lang: "en" | "fa"): string {
  return TICKET_STATUS_LABELS[key]?.[lang] || key
}

export function ticketPriorityColor(priority: string): string {
  return TICKET_PRIORITY_COLORS[priority] || "bg-gray-100 text-gray-700"
}

export function ticketStatusColor(status: string): string {
  return TICKET_STATUS_COLORS[status] || "bg-gray-100 text-gray-700"
}
