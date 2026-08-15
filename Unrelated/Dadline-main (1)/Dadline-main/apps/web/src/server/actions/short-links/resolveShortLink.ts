import { apiPost } from "@/lib/apiClient"
import { shortLinkResponseSchema } from "./shortLinks.schemas"

export async function resolveShortLink(
  shortCode: string,
): Promise<string | null> {
  const response = await apiPost<unknown>(
    `/public/short-links/${encodeURIComponent(shortCode)}/resolve`,
    {},
  )

  if (!response.ok || !response.data) return null

  const parsed = shortLinkResponseSchema.safeParse(response.data)

  return parsed.success ? parsed.data.originalUrl : null
}
