"use server"

import { apiGet } from "@/lib/apiClient"

export interface City {
  id: number
  name: string
  slug: string
}

export interface Province {
  id: number
  name: string
  slug: string
  cities: City[]
}

export interface GetLocationsParams {
  hasProviders?: boolean
  type?: "lawyer" | "expert"
  provinceId?: number
}

export async function getLocations(
  params?: GetLocationsParams,
): Promise<{
  ok: boolean
  status: number
  data: Province[] | null
  error: string | null
}> {
  const search = new URLSearchParams()

  if (params?.hasProviders) {
    search.set("has_providers", "1")
  }

  if (params?.type) {
    search.set("type", params.type)
  }

  if (params?.provinceId) {
    search.set("province_id", params.provinceId.toString())
  }

  const query = search.toString()

  const response = await apiGet<Array<Omit<Province, "cities"> & {
    cities?: City[]
    children?: City[]
  }>>(`/locations${query ? `?${query}` : ""}`, undefined, {
    revalidate: 86400,
    tags: ["locations"],
  })
  if (!response.ok || !response.data) {
    return {
      ok: response.ok,
      status: response.status,
      data: null,
      error: response.error,
    }
  }

  const normalized: Province[] = response.data.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    cities: p.cities ?? p.children ?? [],
  }))

  return { ok: true, status: response.status, data: normalized, error: null }
}
