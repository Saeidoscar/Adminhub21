/**
 * Resolve an admin/coder/editor photo value into a usable image URL.
 *
 * Data sources are inconsistent: some rows carry an absolute URL
 * (`https://i.pravatar.cc/150?u=...`) while older rows store only the
 * Unsplash photo id (`photo-1494790108377-be9c29b29330`). Components used to
 * blindly prefix every value with the Unsplash host, which produced URLs like
 * `https://images.unsplash.com/https://i.pravatar.cc/...` and broke the avatar.
 */
const UNSPLASH_HOST = "https://images.unsplash.com"

export function photoUrl(
  photo: string | null | undefined,
  width = 80,
  height = width,
): string | undefined {
  if (!photo) return undefined
  const value = photo.trim()
  if (!value) return undefined
  if (
    /^(https?:)?\/\//i.test(value) ||
    value.startsWith("data:") ||
    value.startsWith("/")
  ) {
    return value
  }
  return `${UNSPLASH_HOST}/${value.replace(/^\/+/, "")}?w=${width}&h=${height}&fit=crop&auto=format`
}
