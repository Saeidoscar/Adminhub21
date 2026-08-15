"use server"

import type { ProviderType } from "@/@types/vendors"
import { apiGet } from "@/lib/apiClient"
import {
  subscriptionProvidersResponseSchema,
  type SubscriptionProvider,
  type SubscriptionProvidersPagination,
} from "./subscriptionProviders.schemas"

export type SubscriptionProvidersParams = {
  search?: string
  type?: ProviderType
  category?: string
  province?: string
  city?: string
  online?: boolean
  page?: number
  perPage?: number
}

type SubscriptionProvidersResult = {
  providers: SubscriptionProvider[]
  pagination: SubscriptionProvidersPagination
  error: string | null
}

const emptyPagination: SubscriptionProvidersPagination = {
  current_page: 1,
  last_page: 1,
  total: 0,
  per_page: 12,
}

export async function getSubscriptionProviders(
  params: SubscriptionProvidersParams = {},
): Promise<SubscriptionProvidersResult> {
  const query = new URLSearchParams({ service: "subscription" })
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
      tags: ["subscription-providers"],
    },
  )

  if (!response.ok || !response.data) {
    return {
      providers: [],
      pagination: emptyPagination,
      error:
        response.error ??
        "دریافت فهرست ارائه‌دهندگان اشتراک وکیل با خطا مواجه شد.",
    }
  }

  const parsed = subscriptionProvidersResponseSchema.safeParse(response.data)

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
