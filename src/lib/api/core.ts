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

export const DEFAULT_API_BASE_URL = "http://localhost:8000"

export function getApiBaseUrl() {
  return (import.meta.env.VITE_API_BASE_URL?.trim() || DEFAULT_API_BASE_URL)
    .replace(/\/+$/, "")
}

export function getApiBaseUrlLaravel() {
  return (import.meta.env.VITE_API_BASE_URL_LARAVEL?.trim() || getApiBaseUrl())
    .replace(/\/+$/, "")
}

export function getAuthToken() {
  const envToken = import.meta.env.VITE_AUTH_TOKEN?.trim()

  if (envToken) return envToken

  if (typeof window !== "undefined") {
    return window.localStorage.getItem("adminhub_token") ?? ""
  }

  return ""
}

export function setAuthToken(token: string) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem("adminhub_token", token.trim())
  }
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getAuthToken()

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,

    headers: {
      "Content-Type": "application/json",

      ...(token ? { Authorization: `Bearer ${token}` } : {}),

      ...(init.headers ?? {}),
    },
  })

  if (!response.ok) {
    const message = await response.text()

    const error = new Error(
      message || `Request failed with status ${response.status}`,
    )
    ;(error as Error & { status: number }).status = response.status
    throw error
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

export function unwrapList<T>(
  payload: Record<string, unknown> | null | undefined,
  key: string,
) {
  const maybe = payload?.[key]

  return Array.isArray(maybe) ? maybe as T[] : []
}

export function unwrapItem<T>(
  payload: Record<string, unknown> | null | undefined,
  key: string,
) {
  return payload?.[key] as T | undefined ?? null
}
