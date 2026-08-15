import "server-only"

import { createHash, createHmac, randomBytes } from "node:crypto"

const API_INTERNAL_URL = process.env.API_INTERNAL_URL || "http://api:8080"
const ADMIN_PANEL_API_KEY = process.env.ADMIN_PANEL_API_KEY || ""

type AdminApiResponse<T,> = {
  ok: boolean
  status: number
  data: T | null
  error: string | null
}

const buildSignatureHeaders = (
  method: string,
  url: URL,
  body: string | Uint8Array,
) => {
  const timestamp = Math.floor(Date.now() / 1000).toString()
  const nonce = randomBytes(16).toString("hex")
  const bodyHash = createHash("sha256").update(body).digest("hex")
  const target = `${url.pathname}${url.search}`
  const payload = [
    method.toUpperCase(),
    target,
    bodyHash,
    timestamp,
    nonce,
  ].join("\n")
  const signature = createHmac("sha256", ADMIN_PANEL_API_KEY)
    .update(payload)
    .digest("hex")

  return {
    "X-Dadline-Admin-Timestamp": timestamp,
    "X-Dadline-Admin-Nonce": nonce,
    "X-Dadline-Admin-Signature": signature,
  }
}

const request = async <T,>(
  path: string,
  init: RequestInit,
  token?: string,
): Promise<AdminApiResponse<T>> => {
  if (ADMIN_PANEL_API_KEY.length < 32) {
    return {
      ok: false,
      status: 503,
      data: null,
      error: "کلید ارتباط امن پنل مدیریت تنظیم نشده است.",
    }
  }

  const method = (init.method || "GET").toUpperCase()
  const body =
    typeof init.body === "string" || init.body instanceof Uint8Array
      ? init.body
      : ""
  const url = new URL(`/v1${path}`, API_INTERNAL_URL)

  try {
    const response = await fetch(url, {
      ...init,
      cache: "no-store",
      headers: {
        Accept: "application/json",
        ...buildSignatureHeaders(method, url, body),
        ...(typeof init.body === "string" && init.body
          ? { "Content-Type": "application/json" }
          : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init.headers,
      },
    })

    const json = await response.json().catch(() => null)
    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        data: null,
        error:
          json?.message ||
          Object.values(json?.errors ?? {})
            .flat()[0]
            ?.toString() ||
          "در دریافت اطلاعات از سرور خطایی رخ داد.",
      }
    }

    return {
      ok: true,
      status: response.status,
      data: json as T,
      error: null,
    }
  } catch {
    return {
      ok: false,
      status: 0,
      data: null,
      error: "ارتباط پنل مدیریت با سرور برقرار نشد.",
    }
  }
}

export const adminApiGet = <T>(path: string, token: string) =>
  request<T>(path, { method: "GET" }, token)

export const adminApiPost = <T,>(
  path: string,
  body: Record<string, unknown>,
  token?: string,
) => {
  const jsonBody = JSON.stringify(body)

  return request<T>(path, { method: "POST", body: jsonBody }, token)
}

export const adminApiPatch = <T,>(
  path: string,
  body: Record<string, unknown>,
  token: string,
) => {
  const jsonBody = JSON.stringify(body)

  return request<T>(path, { method: "PATCH", body: jsonBody }, token)
}

export const adminApiFormData = async <T,>(
  path: string,
  formData: FormData,
  token: string,
) => {
  const serialized = new Request("http://admin-form.internal", {
    method: "POST",
    body: formData,
  })
  const body = new Uint8Array(await serialized.arrayBuffer())
  const contentType = serialized.headers.get("content-type")

  return request<T>(
    path,
    {
      method: "POST",
      body,
      headers: contentType ? { "Content-Type": contentType } : undefined,
    },
    token,
  )
}
