"use server"

import { apiPost } from "@/lib/apiClient"
import {
  createShortLinkResponseSchema,
  shortLinkPathSchema,
} from "./shortLinks.schemas"

type CreateShortLinkResult = {
  shortCode: string | null
  error: string | null
}

export async function createShortLink(
  originalUrl: string,
): Promise<CreateShortLinkResult> {
  const path = shortLinkPathSchema.safeParse(originalUrl)

  if (!path.success) {
    return {
      shortCode: null,
      error: "آدرس این صفحه برای ساخت لینک کوتاه معتبر نیست.",
    }
  }

  const response = await apiPost<unknown>("/public/short-links", {
    original_url: path.data,
  })

  if (!response.ok || !response.data) {
    return {
      shortCode: null,
      error: response.error ?? "ساخت لینک کوتاه انجام نشد.",
    }
  }

  const parsed = createShortLinkResponseSchema.safeParse(response.data)

  if (!parsed.success) {
    return {
      shortCode: null,
      error: "پاسخ ساخت لینک کوتاه معتبر نیست.",
    }
  }

  return {
    shortCode: parsed.data.shortCode,
    error: null,
  }
}
