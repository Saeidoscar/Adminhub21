const UNSPLASH_BASE = "https://images.unsplash.com"

export function resolvePhotoUrl(
  photo: string | null | undefined,
  opts: { width?: number; height?: number } = {},
): string {
  const { width = 80, height = 80 } = opts
  const query = `?w=${width}&h=${height}&fit=crop&auto=format`
  const raw = (photo ?? "").trim()
  if (!raw) return `${UNSPLASH_BASE}/photo-1519085360751-af8969f4c18b${query}`
  if (
    /^https?:\/\//i.test(raw) ||
    raw.startsWith("data:") ||
    raw.startsWith("blob:")
  ) {
    return raw
  }
  // Stored as a bare unsplash file id (e.g. "photo-1234?ixlib=rb-4.0.3").
  const [file, existingQuery] = raw.split("?")
  return `${UNSPLASH_BASE}/${file}${
    existingQuery ? `?${existingQuery}` : query
  }`
}
