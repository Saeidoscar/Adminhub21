"use server"

import type { PaginatedResponse } from "@/@types/pagination"
import type { Provider, ProviderType } from "@/@types/vendors"
import { apiGet } from "@/lib/apiClient"

export interface GetProvidersParams {
  search?: string
  city?: string
  province?: string
  category?: string
  online?: boolean
  page?: number
  per_page?: number
}

export type GetProvidersResult = {
  providers: Provider[]
  pagination: PaginatedResponse<Provider>["meta"]
  links: PaginatedResponse<Provider>["links"]
  error: string | null
}

export type GetLawyersResult = Omit<GetProvidersResult, "providers"> & {
  lawyers: Provider[]
}

export type GetExpertsResult = Omit<GetProvidersResult, "providers"> & {
  experts: Provider[]
}

const EMPTY_META: PaginatedResponse<Provider>["meta"] = {
  current_page: 1,
  last_page: 1,
  total: 0,
  per_page: 0,
}

const EMPTY_LINKS: PaginatedResponse<Provider>["links"] = {
  first: null,
  last: null,
  prev: null,
  next: null,
}

export async function getProviders(
  type: ProviderType,
  params?: GetProvidersParams,
): Promise<GetProvidersResult> {
  const query = new URLSearchParams()

  query.set("type", type)

  if (params?.search) query.set("search", params.search)
  if (params?.city) query.set("city", params.city)
  if (params?.province) query.set("province", params.province)
  if (params?.category) query.set("category", params.category)
  if (params?.online) query.set("online", "true")
  if (params?.page) query.set("page", String(params.page))
  if (params?.per_page) query.set("per_page", String(params.per_page))

  const response = await apiGet<PaginatedResponse<Provider>>(
    `/legal-providers?${query.toString()}`,
  )

  if (!response.ok || !response.data) {
    return {
      providers: [],
      pagination: EMPTY_META,
      links: EMPTY_LINKS,
      error:
        response.error ??
        `دریافت لیست ${
          type === "expert" ? "کارشناسان" : "وکلا"
        } با خطا مواجه شد.`,
    }
  }

  return {
    providers: response.data.data,
    pagination: response.data.meta,
    links: response.data.links,
    error: null,
  }
}

export async function getLawyers(
  params?: GetProvidersParams,
): Promise<GetLawyersResult> {
  const result = await getProviders("lawyer", params)

  return {
    lawyers: result.providers,
    pagination: result.pagination,
    links: result.links,
    error: result.error,
  }
}

export async function getExperts(
  params?: GetProvidersParams,
): Promise<GetExpertsResult> {
  const result = await getProviders("expert", params)

  return {
    experts: result.providers,
    pagination: result.pagination,
    links: result.links,
    error: result.error,
  }
}
