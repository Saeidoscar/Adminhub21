import type {
  AdminProfile,
  AiConversationRow,
  AiMessageRow,
  AiModelRow,
  ContractPackage,
  ContractRow,
  CustomOffer,
  DashboardStats,
  FavoriteRow,
  PlatformKey,
  ReviewRow,
  WalletRow,
  WalletTransactionRow,
} from "@adminhub/shared"

export type {
  AdminProfile,
  AiConversationRow,
  AiMessageRow,
  AiModelRow,
  ContractPackage,
  ContractRow,
  CustomOffer,
  DashboardStats,
  FavoriteRow,
  PlatformKey,
  ReviewRow,
  WalletRow,
  WalletTransactionRow,
}

export const TOKEN_STORAGE_KEY = "adminhub_token"

export const DEFAULT_API_BASE_URL = "http://localhost:8787"

export function getApiBaseUrl() {
  return (
    import.meta.env.VITE_API_BASE_URL?.trim() || DEFAULT_API_BASE_URL
  ).replace(/\/+$/, "")
}

export function getApiBaseUrlLaravel() {
  return (
    import.meta.env.VITE_API_BASE_URL_LARAVEL?.trim() || getApiBaseUrl()
  ).replace(/\/+$/, "")
}

export function getAuthToken() {
  if (typeof window !== "undefined") {
    const stored = window.localStorage.getItem(TOKEN_STORAGE_KEY)
    if (stored) return stored
  }

  // The env token is a development-only fallback: a stored token always wins,
  // otherwise signing out could never clear the session.
  return import.meta.env.VITE_AUTH_TOKEN?.trim() || ""
}

export function setAuthToken(token: string) {
  if (typeof window !== "undefined") {
    const trimmed = token.trim()
    if (trimmed) {
      window.localStorage.setItem(TOKEN_STORAGE_KEY, trimmed)
    } else {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY)
    }
  }
}

type ApiError = Error & { status?: number; payload?: unknown }

async function readBody(response: Response): Promise<string> {
  const type = response.headers.get("content-type") ?? ""
  if (type.includes("application/json")) {
    try {
      const parsed = (await response.json()) as Record<string, unknown>
      if (typeof parsed?.message === "string") return parsed.message
      if (typeof parsed?.error === "string") return parsed.error
      return JSON.stringify(parsed)
    } catch {
      return ""
    }
  }
  try {
    return await response.text()
  } catch {
    return ""
  }
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const token = getAuthToken()

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers ?? {}),
    },
  })

  if (!response.ok) {
    const message = await readBody(response)
    const error: ApiError = new Error(
      message || `Request failed with status ${response.status}`,
    )
    error.status = response.status
    if (response.status === 401) {
      // Session is gone: drop the stale token so guards redirect to /auth.
      setAuthToken("")
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("adminhub:unauthorized"))
      }
    }
    throw error
  }

  if (response.status === 204 || response.status === 205) {
    return undefined as T
  }

  const type = response.headers.get("content-type") ?? ""
  if (!type.includes("application/json")) {
    const text = await readBody(response)
    return (text ? text : undefined) as unknown as T
  }

  const text = await response.text()
  if (!text.trim()) return undefined as T

  return JSON.parse(text) as T
}

export function unwrapList<T>(payload: unknown, key?: string): T[] {
  if (Array.isArray(payload)) return payload as T[]
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>
    const candidates = [
      key,
      "data",
      "items",
      "results",
      "rows",
      "profiles",
      "packages",
      "contracts",
      "tickets",
      "users",
      "stories",
      "blogs",
      "comments",
      "reviews",
      "favorites",
      "transactions",
      "cases",
      "tasks",
      "events",
      "timeLogs",
      "portfolio",
    ].filter(Boolean) as string[]
    for (const k of candidates) {
      const maybe = record[k]
      if (Array.isArray(maybe)) return maybe as T[]
    }
  }
  return []
}

export function unwrapItem<T>(payload: unknown, key?: string): T | null {
  if (payload === null || payload === undefined) return null
  if (Array.isArray(payload)) return payload[0] as T ?? null
  if (typeof payload !== "object") return null
  const record = payload as Record<string, unknown>
  const candidates = [
    key,
    "data",
    "item",
    "profile",
    "package",
    "contract",
  ].filter(Boolean) as string[]
  for (const k of candidates) {
    const maybe = record[k]
    if (maybe && typeof maybe === "object" && !Array.isArray(maybe)) {
      return maybe as T
    }
    if (key && k === key && maybe === null) return null
  }
  // Single-key wrapper objects (e.g. { wallet: {...} }) or the raw record.
  if (key && record[key] && typeof record[key] === "object") {
    return record[key] as T
  }
  return payload as T
}
