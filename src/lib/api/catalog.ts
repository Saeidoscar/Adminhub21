import { apiFetch, unwrapList } from "./core"

export interface Tool {
  id: string
  name: string
  descEn: string
  descFa: string
  category: string
  icon: string
  rating: number
  reviews: number
  popular: boolean
  priceToman: number
  priceUSD: number
  createdAt: string
}

export interface Editor {
  id: string
  nameEn: string
  nameFa: string
  photo: string
  specialty: string
  rating: number
  reviews: number
  projects: number
  delivery: string
  rateToman: number
  rateUSD: number
  bioEn: string
  bioFa: string
  createdAt: string
}

export interface VibeCoder {
  id: string
  nameEn: string
  nameFa: string
  photo: string
  stack: string
  rating: number
  reviews: number
  projects: number
  rateToman: number
  rateUSD: number
  delivery: string
  bioEn: string
  bioFa: string
  createdAt: string
}

export interface ListToolsQuery {
  category?: string
  popular?: boolean
  minRating?: number
  search?: string
}

export async function listTools(query: ListToolsQuery = {}): Promise<Tool[]> {
  const params = new URLSearchParams()
  if (query.category) params.set("category", query.category)
  if (typeof query.popular === "boolean")
    params.set("popular", String(query.popular))
  if (typeof query.minRating === "number")
    params.set("minRating", String(query.minRating))
  if (query.search) params.set("search", query.search)
  const qs = params.toString()
  const payload = await apiFetch<Record<string, unknown>>(
    `/api/tools${qs ? `?${qs}` : ""}`,
  )
  return unwrapList<Tool>(payload, "tools")
}

export interface ListEditorsQuery {
  specialty?: string
  minRating?: number
  search?: string
}

export async function listEditors(
  query: ListEditorsQuery = {},
): Promise<Editor[]> {
  const params = new URLSearchParams()
  if (query.specialty) params.set("specialty", query.specialty)
  if (typeof query.minRating === "number")
    params.set("minRating", String(query.minRating))
  if (query.search) params.set("search", query.search)
  const qs = params.toString()
  const payload = await apiFetch<Record<string, unknown>>(
    `/api/editors${qs ? `?${qs}` : ""}`,
  )
  return unwrapList<Editor>(payload, "editors")
}

export interface ListVibeCodersQuery {
  stack?: string
  minRating?: number
  search?: string
}

export async function listVibeCoders(
  query: ListVibeCodersQuery = {},
): Promise<VibeCoder[]> {
  const params = new URLSearchParams()
  if (query.stack) params.set("stack", query.stack)
  if (typeof query.minRating === "number")
    params.set("minRating", String(query.minRating))
  if (query.search) params.set("search", query.search)
  const qs = params.toString()
  const payload = await apiFetch<Record<string, unknown>>(
    `/api/vibe-coders${qs ? `?${qs}` : ""}`,
  )
  return unwrapList<VibeCoder>(payload, "vibe-coders")
}
