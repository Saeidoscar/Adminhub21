const API_INTERNAL_URL = process.env.API_INTERNAL_URL || "http://api:8080"

type ApiResponse<T,> = {
  ok: boolean
  status: number
  data: T | null
  error: string | null
}

export async function apiPost<T = unknown>(
  path: string,
  body: Record<string, unknown>,
  token?: string,
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${API_INTERNAL_URL}/v1${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    })

    const json = await res.json().catch(() => null)
    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        data: null,
        error:
          json?.message ||
          Object.values(json?.errors ?? {})?.flat()?.[0] ||
          "خطایی رخ داد، دوباره تلاش کنید.",
      }
    }

    return { ok: true, status: res.status, data: json as T, error: null }
  } catch {
    return {
      ok: false,
      status: 0,
      data: null,
      error: "اتصال به سرور برقرار نشد، بعداً تلاش کنید.",
    }
  }
}

export async function apiPatch<T = unknown>(
  path: string,
  body: Record<string, unknown>,
  token?: string,
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${API_INTERNAL_URL}/v1${path}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    })

    const json = await res.json().catch(() => null)
    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        data: null,
        error:
          json?.message ||
          Object.values(json?.errors ?? {})?.flat()?.[0] ||
          "خطایی رخ داد، دوباره تلاش کنید.",
      }
    }

    return { ok: true, status: res.status, data: json as T, error: null }
  } catch {
    return {
      ok: false,
      status: 0,
      data: null,
      error: "اتصال به سرور برقرار نشد، بعداً تلاش کنید.",
    }
  }
}

export async function apiFormData<T = unknown>(
  path: string,
  formData: FormData,
  token?: string,
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${API_INTERNAL_URL}/v1${path}`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    })

    const json = await res.json().catch(() => null)
    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        data: null,
        error:
          json?.message ||
          Object.values(json?.errors ?? {})?.flat()?.[0] ||
          "خطایی رخ داد، دوباره تلاش کنید.",
      }
    }

    return { ok: true, status: res.status, data: json as T, error: null }
  } catch {
    return {
      ok: false,
      status: 0,
      data: null,
      error: "اتصال به سرور برقرار نشد، بعداً تلاش کنید.",
    }
  }
}

export async function apiDelete<T = unknown>(
  path: string,
  token?: string,
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${API_INTERNAL_URL}/v1${path}`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })

    const json = await res.json().catch(() => null)
    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        data: null,
        error:
          json?.message ||
          Object.values(json?.errors ?? {})?.flat()?.[0] ||
          "خطایی رخ داد، دوباره تلاش کنید.",
      }
    }

    return { ok: true, status: res.status, data: json as T, error: null }
  } catch {
    return {
      ok: false,
      status: 0,
      data: null,
      error: "اتصال به سرور برقرار نشد، بعداً تلاش کنید.",
    }
  }
}

export async function apiGet<T = unknown>(
  path: string,
  token?: string,
  options?: {
    revalidate?: number | false
    tags?: string[]
    noStore?: boolean
  },
): Promise<ApiResponse<T>> {
  try {
    const shouldNoStore =
      options?.noStore || Boolean(token) || options?.revalidate === false
    const cacheOptions = shouldNoStore
      ? { cache: "no-store" as const }
      : {
          next: {
            revalidate: options?.revalidate ?? 300,
            tags: options?.tags,
          },
        }

    const res = await fetch(`${API_INTERNAL_URL}/v1${path}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...cacheOptions,
    })

    const json = await res.json().catch(() => null)

    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        data: null,
        error: json?.message || json?.code || "خطایی رخ داد، دوباره تلاش کنید.",
      }
    }

    return { ok: true, status: res.status, data: json as T, error: null }
  } catch {
    return {
      ok: false,
      status: 0,
      data: null,
      error: "اتصال به سرور برقرار نشد، بعداً تلاش کنید.",
    }
  }
}
