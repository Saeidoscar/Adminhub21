import type { ContractPackage, CustomOffer } from "@adminhub/shared"
import type { PlatformKey } from "@adminhub/shared"
import { apiFetch, unwrapList, unwrapItem } from "./core"

export { type PlatformKey }

export interface ListPackagesQuery {
  platforms?: PlatformKey[]
  type?: "platform" | "bundle"
  featured?: boolean
  billingCycle?: "monthly" | "project" | "hourly"
  search?: string
}

export async function listPackages(
  query: ListPackagesQuery = {},
): Promise<ContractPackage[]> {
  const params = new URLSearchParams()

  if (query.platforms && query.platforms.length > 0) {
    params.set("platforms", query.platforms.join(","))
  }

  if (query.type) {
    params.set("type", query.type)
  }

  if (typeof query.featured === "boolean") {
    params.set("featured", String(query.featured))
  }

  if (query.billingCycle) {
    params.set("billingCycle", query.billingCycle)
  }

  if (query.search) {
    params.set("search", query.search)
  }

  const queryString = params.toString()

  const payload = await apiFetch<Record<string, unknown>>(
    `/api/packages${queryString ? `?${queryString}` : ""}`,
  )

  return unwrapList<ContractPackage>(payload, "packages")
}

export async function getPackage(id: string): Promise<ContractPackage | null> {
  const payload = await apiFetch<Record<string, unknown>>(`/api/packages/${id}`)

  return unwrapItem<ContractPackage>(payload, "package")
}

export async function createPackage(
  input: Omit<ContractPackage, "id" | "createdAt" | "updatedAt">,
): Promise<ContractPackage> {
  const payload = await apiFetch<Record<string, unknown>>("/api/packages", {
    method: "POST",

    body: JSON.stringify({
      ...input,

      adminId: undefined,
    }),
  })

  const pkg = unwrapItem<ContractPackage>(payload, "package")

  if (!pkg) {
    throw new Error("Package creation response was empty")
  }

  return pkg
}

export async function updatePackage(
  id: string,

  input: Partial<Omit<ContractPackage, "id" | "createdAt" | "updatedAt">>,
): Promise<ContractPackage> {
  const payload = await apiFetch<Record<string, unknown>>(
    `/api/packages/${id}`,
    {
      method: "PUT",

      body: JSON.stringify({
        ...input,

        adminId: undefined,
      }),
    },
  )

  const pkg = unwrapItem<ContractPackage>(payload, "package")

  if (!pkg) {
    throw new Error("Package update response was empty")
  }

  return pkg
}

export async function deletePackage(id: string): Promise<void> {
  await apiFetch<void>(`/api/packages/${id}`, { method: "DELETE" })
}

export async function listOffers(): Promise<CustomOffer[]> {
  const payload = await apiFetch<Record<string, unknown>>("/api/offers")

  return unwrapList<CustomOffer>(payload, "offers")
}

export async function createOffer(
  input: Omit<CustomOffer, "id" | "createdAt">,
): Promise<CustomOffer> {
  const payload = await apiFetch<Record<string, unknown>>("/api/offers", {
    method: "POST",

    body: JSON.stringify(input),
  })

  const offer = unwrapItem<CustomOffer>(payload, "offer")

  if (!offer) {
    throw new Error("Offer creation response was empty")
  }

  return offer
}
