import type { FavoriteRow } from "@adminhub/shared"
import { apiFetch, unwrapList, unwrapItem } from "./core"

export type { FavoriteRow }

export async function listFavorites(): Promise<FavoriteRow[]> {
  const payload = await apiFetch<Record<string, unknown>>("/api/favorites")

  return unwrapList<FavoriteRow>(payload, "favorites")
}

export async function addFavorite(adminId: string): Promise<FavoriteRow> {
  const payload = await apiFetch<Record<string, unknown>>(
    `/api/favorites/${adminId}`,
    {
      method: "POST",
    },
  )

  const favorite = unwrapItem<FavoriteRow>(payload, "favorite")

  if (!favorite) {
    throw new Error("Add favorite response was empty")
  }

  return favorite
}

export async function removeFavorite(adminId: string): Promise<void> {
  await apiFetch<Record<string, unknown>>(`/api/favorites/${adminId}`, {
    method: "DELETE",
  })
}
