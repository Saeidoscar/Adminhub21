import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { apiBaseUrl } from "@/lib/api"

export const SESSION_COOKIE = "ah_token"

export async function getSessionToken(): Promise<string | null> {
  return (await cookies()).get(SESSION_COOKIE)?.value ?? null
}

/**
 * Server-side guard for the private surface. Every /app page calls this so the
 * redirect target is always the page the visitor actually wanted.
 */
export async function requireSessionToken(pathname: string): Promise<string> {
  const token = await getSessionToken()

  if (!token) {
    redirect(`/sign-in?redirectUrl=${encodeURIComponent(pathname)}`)
  }

  return token
}

export type ApiResult<T> = { ok: true; data: T } | { ok: false; status: number; message: string }

type ApiError = { message?: string; errors?: Record<string, string[]> }

async function parseError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as ApiError
    if (body.errors) {
      const first = Object.values(body.errors)[0]
      if (first?.length) return first[0]
    }
    if (body.message) return body.message
  } catch {
    // fall through to the status text
  }

  return response.statusText || `HTTP ${response.status}`
}

export async function apiRequest<T>(
  token: string,
  path: string,
  init: RequestInit = {},
): Promise<ApiResult<T>> {
  try {
    const response = await fetch(`${apiBaseUrl()}${path}`, {
      ...init,
      cache: "no-store",
      headers: {
        Accept: "application/json",
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        Authorization: `Bearer ${token}`,
        ...(init.headers ?? {}),
      },
    })

    if (!response.ok) {
      return { ok: false, status: response.status, message: await parseError(response) }
    }

    if (response.status === 204) {
      return { ok: true, data: undefined as T }
    }

    return { ok: true, data: (await response.json()) as T }
  } catch {
    return {
      ok: false,
      status: 0,
      message: "ارتباط با سرویس برقرار نشد. کمی بعد دوباره تلاش کنید.",
    }
  }
}
