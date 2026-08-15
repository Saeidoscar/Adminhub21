"use server"

import { randomUUID } from "node:crypto"
import { cookies } from "next/headers"
import { apiPost } from "@/lib/apiClient"

export type PublicViewResource = "products" | "stories" | "blogs"

const VIEWER_COOKIE_NAME = "dadline_viewer_id"
const VIEWER_COOKIE_MAX_AGE = 60 * 60 * 24 * 365
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function trackPublicView(
  resource: PublicViewResource,
  slug: string,
): Promise<void> {
  const normalizedSlug = normalizeSlug(slug)
  if (!normalizedSlug) return

  const cookieStore = await cookies()
  let viewerKey = cookieStore.get(VIEWER_COOKIE_NAME)?.value

  if (!viewerKey || !UUID_PATTERN.test(viewerKey)) {
    viewerKey = randomUUID()
    cookieStore.set(VIEWER_COOKIE_NAME, viewerKey, {
      httpOnly: true,
      maxAge: VIEWER_COOKIE_MAX_AGE,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    })
  }

  const resourcePath = resource === "products" ? "public/products" : resource

  await apiPost(`/${resourcePath}/${encodeURIComponent(normalizedSlug)}/view`, {
    viewer_key: viewerKey,
  })
}

function normalizeSlug(slug: string): string {
  try {
    return decodeURIComponent(slug).trim()
  } catch {
    return slug.trim()
  }
}
