import type { ContentSort } from "@/@types/content"
import type { LegalCategory } from "@/server/actions/legal/getLegalCategories"

export const validContentSorts: ContentSort[] = [
  "recent",
  "views",
  "likes",
  "comments",
]

export function normalizePage(value?: string) {
  const page = Number.parseInt(value ?? "1", 10)
  return Number.isFinite(page) && page > 0 ? page : 1
}

export function normalizeSort(value?: string): ContentSort {
  return validContentSorts.includes(value as ContentSort)
    ? value as ContentSort
    : "recent"
}

export function normalizeRouteSegment(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

export function flattenCategories(
  categories: LegalCategory[],
): LegalCategory[] {
  return categories.flatMap((category) => [
    category,
    ...flattenCategories(category.children ?? []),
  ])
}

export function formatContentDate(value: string | null) {
  if (!value) return "تاریخ نامشخص"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "تاریخ نامشخص"

  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date)
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("fa-IR").format(value)
}
