"use server"

import { apiGet } from "@/lib/apiClient"
import type { ProviderDetail, ProviderType } from "@/@types/vendors"

export type GetProviderResult = {
  provider: ProviderDetail | null
  notFound: boolean
  error: string | null
}

export async function getProvider(
  type: ProviderType,
  slug: string,
): Promise<GetProviderResult> {
  const response = await apiGet<ProviderDetail>(
    `/legal-providers/${type}/${slug}`,
  )

  if (!response.ok || !response.data) {
    return {
      provider: null,
      notFound: response.status === 404,
      error:
        response.status === 404
          ? null
          : (response.error ?? "دریافت اطلاعات این وکیل با خطا مواجه شد."),
    }
  }

  return {
    provider: response.data,
    notFound: false,
    error: null,
  }
}
