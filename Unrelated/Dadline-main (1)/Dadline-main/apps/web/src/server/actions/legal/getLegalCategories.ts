"use server"

import { apiGet } from "@/lib/apiClient"

export interface LegalCategory {
  id: number
  name: string
  slug: string
  parent_id: number | null
  children: LegalCategory[]
}

export type GetLegalCategoriesResult = {
  categories: LegalCategory[]
  error: string | null
}

export async function getLegalCategories(): Promise<GetLegalCategoriesResult> {
  const response = await apiGet<{ data: LegalCategory[] }>(
    "/legal-categories",
    undefined,
    {
      revalidate: 86400,
      tags: ["Categories"],
    },
  )
  if (!response.ok || !response.data) {
    return {
      categories: [],
      error: response.error ?? "دریافت حوزه‌های تخصصی با خطا مواجه شد.",
    }
  }

  return {
    categories: response.data.data,
    error: null,
  }
}
