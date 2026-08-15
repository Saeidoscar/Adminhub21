"use server"

import type { Provider } from "@/@types/vendors"
import type { PaginatedResponse } from "@/@types/pagination"
import { apiGet } from "@/lib/apiClient"

export type GetOnlineVendorsResult = {
  vendors: Provider[]
  error: string | null
}

export async function getLivePanelVendors(): Promise<GetOnlineVendorsResult> {
  const response = await apiGet<PaginatedResponse<Provider>>(
    "/legal-providers?per_page=30",
    undefined,
    { revalidate: 300, tags: ["live-panel"] },
  )
  if (!response.ok || !response.data) {
    return {
      vendors: [],
      error: response.error ?? "دریافت فهرست وکلای آنلاین با خطا مواجه شد.",
    }
  }
  return {
    vendors: response.data.data,
    error: null,
  }
}
