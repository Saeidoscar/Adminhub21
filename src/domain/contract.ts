export const CONTRACT_STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  completed: "bg-blue-100 text-blue-700",
  disputed: "bg-red-100 text-red-700",
}

export const CONTRACT_STATUS_LABELS_EN: Record<string, string> = {
  active: "Active",
  pending: "Pending",
  completed: "Completed",
  disputed: "Disputed",
}

export const CONTRACT_STATUS_LABELS_FA: Record<string, string> = {
  active: "فعال",
  pending: "در انتظار",
  completed: "تکمیل شده",
  disputed: "در حال رسیدگی",
}

export function contractStatusLabel(status: string, lang: "en" | "fa"): string {
  if (lang === "fa") {
    return CONTRACT_STATUS_LABELS_FA[status] || status
  }
  return CONTRACT_STATUS_LABELS_EN[status] || status
}

export function contractStatusColor(status: string): string {
  return CONTRACT_STATUS_COLORS[status] || "bg-gray-100 text-gray-700"
}


