"use server"

import type {
  CallProvider,
  CallProvidersPagination,
  CallProviderType,
} from "@/@types/calls"
import { apiGet } from "@/lib/apiClient"
import { callProvidersResponseSchema } from "./callProviders.schemas"

export type CallProvidersParams = {
  search?: string
  type?: CallProviderType
  category?: string
  province?: string
  city?: string
  online?: boolean
  page?: number
  perPage?: number
}

type CallProvidersResult = {
  providers: CallProvider[]
  pagination: CallProvidersPagination
  error: string | null
}

const emptyPagination: CallProvidersPagination = {
  current_page: 1,
  last_page: 1,
  total: 0,
  per_page: 12,
}

export async function getCallProviders(
  params: CallProvidersParams = {},
): Promise<CallProvidersResult> {
  const query = new URLSearchParams({ service: "call" })
  query.set("per_page", String(params.perPage ?? 12))

  if (params.search) query.set("search", params.search)
  if (params.type) query.set("type", params.type)
  if (params.category) query.set("category", params.category)
  if (params.province) query.set("province", params.province)
  if (params.city) query.set("city", params.city)
  if (params.online) query.set("online", "true")
  if (params.page && params.page > 1) query.set("page", String(params.page))

  const response = await apiGet<unknown>(
    `/legal-providers?${query.toString()}`,
    undefined,
    {
      revalidate: 60,
      tags: ["call-providers"],
    },
  )

  if (!response.ok || !response.data) {
    return {
      providers: [],
      pagination: emptyPagination,
      error:
        response.error ??
        "دریافت فهرست ارائه‌دهندگان مشاوره تلفنی با خطا مواجه شد.",
    }
  }

  const parsed = callProvidersResponseSchema.safeParse(response.data)

  if (!parsed.success) {
    return {
      providers: [],
      pagination: emptyPagination,
      error: "پاسخ دریافتی از سرور معتبر نیست.",
    }
  }

  return {
    providers: parsed.data.data,
    pagination: parsed.data.meta,
    error: null,
  }
}
