import type { AdminProfile } from "@adminhub/shared"
import type { PlatformKey } from "@adminhub/shared"
import { apiFetch, unwrapList, unwrapItem } from "./core"

export { type PlatformKey }

export interface ListAdminProfilesQuery {
  platforms?: PlatformKey[]
  verified?: boolean
  search?: string
}

export async function listAdminProfiles(
  query: ListAdminProfilesQuery = {},
): Promise<AdminProfile[]> {
  const params = new URLSearchParams()

  if (query.platforms && query.platforms.length > 0) {
    params.set("platforms", query.platforms.join(","))
  }

  if (typeof query.verified === "boolean") {
    params.set("verified", String(query.verified))
  }

  if (query.search) {
    params.set("search", query.search)
  }

  const queryString = params.toString()

  const payload = await apiFetch<Record<string, unknown>>(
    `/api/admin-profiles${queryString ? `?${queryString}` : ""}`,
  )

  return unwrapList<AdminProfile>(payload, "profiles")
}

export async function getAdminProfile(
  id: string,
): Promise<AdminProfile | null> {
  const payload = await apiFetch<Record<string, unknown>>(
    `/api/admin-profiles/${id}`,
  )

  const profile = unwrapItem<AdminProfile>(payload, "profile")
  if (!profile) {
    throw new Error("Update profile response was empty")
  }
  return profile
}

export interface UpdateAdminProfileInput {
  photo?: string
  bioEn?: string
  bioFa?: string
  skillsEn?: string[]
  skillsFa?: string[]
  platforms?: PlatformKey[]
  monthlyToman?: number
  monthlyUSD?: number
}

export async function updateAdminProfile(
  data: UpdateAdminProfileInput,
): Promise<AdminProfile> {
  const payload = await apiFetch<Record<string, unknown>>(
    `/api/admin-profiles/me`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
  )

  const profile = unwrapItem<AdminProfile>(payload, "profile")
  if (!profile) {
    throw new Error("Update profile response was empty")
  }
  return profile
}
