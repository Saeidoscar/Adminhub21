/**
 * Server-side client for the public (unauthenticated) API surface.
 *
 * Every call degrades to an empty result instead of throwing: the public site
 * must render even when the API is down or not yet deployed, and `next build`
 * must not fail because a backend isn't reachable at build time.
 */

const DEFAULT_API = "http://localhost:8000"

export function apiBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || DEFAULT_API).replace(/\/+$/, "")
}

export type PackagePage = {
  data: MarketplacePackage[]
  current_page: number
  last_page: number
  total: number
  per_page: number
}

export type MarketplacePackage = {
  id: number
  user_id: number
  title: string
  slug: string | null
  description: string | null
  price: string | number
  currency: string
  features: string[] | null
  media: string[] | null
  status: string
  views?: number
  sales?: number
  user?: { id: number; name: string; avatar?: string | null } | null
  platform_configs?: { platform: string }[]
}

export type Category = {
  id: number
  name: string
  slug: string
}

async function request<T>(path: string, init?: RequestInit): Promise<T | null> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 4000)

  try {
    const response = await fetch(`${apiBaseUrl()}${path}`, {
      ...init,
      signal: controller.signal,
      headers: { Accept: "application/json", ...(init?.headers ?? {}) },
      next: init?.cache === "no-store" ? undefined : { revalidate: 60 },
    })

    if (!response.ok) return null
    return (await response.json()) as T
  } catch {
    return null
  } finally {
    clearTimeout(timeout)
  }
}

const EMPTY_PAGE: PackagePage = {
  data: [],
  current_page: 1,
  last_page: 1,
  total: 0,
  per_page: 24,
}

export type PackageQuery = {
  search?: string
  min_price?: string
  max_price?: string
  platform?: string
  sort?: string
  page?: string
}

export async function listPackages(query: PackageQuery = {}): Promise<PackagePage> {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value) params.set(key, value)
  }

  const suffix = params.toString()
  const result = await request<PackagePage>(
    `/api/v1/marketplace/search${suffix ? `?${suffix}` : ""}`,
  )

  return result ?? (EMPTY_PAGE as PackagePage)
}

export async function getPackage(ref: string): Promise<MarketplacePackage | null> {
  return request<MarketplacePackage>(`/api/v1/marketplace/packages/${encodeURIComponent(ref)}`)
}

export async function listCategories(): Promise<Category[]> {
  return (await request<Category[]>("/api/v1/marketplace/categories")) ?? []
}
