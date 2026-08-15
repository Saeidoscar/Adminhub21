import type { DashboardQuestion } from "@/@types/dashboardQuestions"

export const formatQuestionDate = (value: string | null) => {
  if (!value) return "—"

  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Tehran",
  }).format(new Date(value))
}

export const formatQuestionPrice = (value: number) =>
  `${value.toLocaleString("fa-IR")} تومان`

export const questionStatusClasses: Record<DashboardQuestion["status"], string> =
  {
    pending:
      "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:ring-amber-800",
    approved:
      "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-950/40 dark:text-blue-200 dark:ring-blue-800",
    publish:
      "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:ring-emerald-800",
  }
