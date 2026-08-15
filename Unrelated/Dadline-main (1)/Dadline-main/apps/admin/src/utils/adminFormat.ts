export const formatMoney = (value: number) =>
  `${new Intl.NumberFormat("fa-IR").format(value)} تومان`

export const formatNumber = (value: number) =>
  new Intl.NumberFormat("fa-IR").format(value)

export const formatDateTime = (value?: string | null) => {
  if (!value) return "—"

  return new Intl.DateTimeFormat("fa-IR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Tehran",
  }).format(new Date(value))
}

export const formatDate = (value?: string | null) => {
  if (!value) return "—"

  return new Intl.DateTimeFormat("fa-IR", {
    month: "short",
    day: "numeric",
    timeZone: "Asia/Tehran",
  }).format(new Date(value))
}

export const toQueryString = (
  values: Record<string, string | string[] | undefined>,
) => {
  const query = new URLSearchParams()
  Object.entries(values).forEach(([key, value]) => {
    const normalized = Array.isArray(value) ? value[0] : value
    if (normalized) query.set(key, normalized)
  })
  return query.toString()
}
