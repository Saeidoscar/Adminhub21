import type {
  AdminProfile,
  AiConversationRow,
  AiMessageRow,
  AiModelRow,
  ContractPackage,
  CustomOffer,
  PlatformKey,
} from "@adminhub/shared"

const DEFAULT_API_BASE_URL = "http://localhost:8787"

function getApiBaseUrl() {
  return (import.meta.env.VITE_API_BASE_URL?.trim() || DEFAULT_API_BASE_URL)

    .replace(/\/+$/, "")
}

export function getAuthToken() {
  const envToken = import.meta.env.VITE_AUTH_TOKEN?.trim()

  if (envToken) return envToken

  if (typeof window !== "undefined") {
    return window.localStorage.getItem("adminhub_token") ?? ""
  }

  return ""
}

export function setAuthToken(token: string) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem("adminhub_token", token.trim())
  }
}

async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getAuthToken()

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,

    headers: {
      "Content-Type": "application/json",

      ...(token ? { Authorization: `Bearer ${token}` } : {}),

      ...(init.headers ?? {}),
    },
  })

  if (!response.ok) {
    const message = await response.text()

    throw new Error(message || `Request failed with status ${response.status}`)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

function unwrapList<T>(
  payload: Record<string, unknown> | null | undefined,
  key: string,
) {
  const maybe = payload?.[key]

  return Array.isArray(maybe) ? maybe as T[] : []
}

function unwrapItem<T>(
  payload: Record<string, unknown> | null | undefined,
  key: string,
) {
  return payload?.[key] as T | undefined ?? null
}

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

  return unwrapItem<AdminProfile>(payload, "profile")
}

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

export interface CreateConversationInput {
  title?: string

  modelId: string
}

export async function listModels(): Promise<AiModelRow[]> {
  const payload = await apiFetch<Record<string, unknown>>("/ai/models")

  return unwrapList<AiModelRow>(payload, "models")
}

export async function listConversations(): Promise<AiConversationRow[]> {
  const payload = await apiFetch<Record<string, unknown>>("/ai/conversations")

  return unwrapList<AiConversationRow>(payload, "conversations")
}

export async function getConversation(
  id: string,
): Promise<AiConversationRow | null> {
  const payload = await apiFetch<Record<string, unknown>>(
    `/ai/conversations/${id}`,
  )

  return unwrapItem<AiConversationRow>(payload, "conversation")
}

export async function createConversation(
  input: CreateConversationInput,
): Promise<AiConversationRow> {
  const payload = await apiFetch<Record<string, unknown>>("/ai/conversations", {
    method: "POST",

    body: JSON.stringify(input),
  })

  const conversation = unwrapItem<AiConversationRow>(payload, "conversation")

  if (!conversation) {
    throw new Error("Conversation creation response was empty")
  }

  return conversation
}

export async function listMessages(
  conversationId: string,
): Promise<AiMessageRow[]> {
  const payload = await apiFetch<Record<string, unknown>>(
    `/ai/conversations/${conversationId}/messages`,
  )

  return unwrapList<AiMessageRow>(payload, "messages")
}

export async function sendMessage(
  conversationId: string,
  content: string,
): Promise<AiMessageRow> {
  const payload = await apiFetch<Record<string, unknown>>(
    `/ai/conversations/${conversationId}/messages`,
    {
      method: "POST",

      body: JSON.stringify({ content }),
    },
  )

  const message = unwrapItem<AiMessageRow>(payload, "message")

  if (!message) {
    throw new Error("Send message response was empty")
  }

  return message
}

export async function switchModel(
  conversationId: string,
  modelId: string,
): Promise<AiConversationRow> {
  const payload = await apiFetch<Record<string, unknown>>(
    `/ai/conversations/${conversationId}/model`,
    {
      method: "PATCH",

      body: JSON.stringify({ modelId }),
    },
  )

  const conversation = unwrapItem<AiConversationRow>(payload, "conversation")

  if (!conversation) {
    throw new Error("Switch model response was empty")
  }

  return conversation
}

export async function renameConversation(
  id: string,
  title: string,
): Promise<AiConversationRow> {
  const payload = await apiFetch<Record<string, unknown>>(
    `/ai/conversations/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify({ title }),
    },
  )

  const conversation = unwrapItem<AiConversationRow>(payload, "conversation")

  if (!conversation) {
    throw new Error("Rename conversation response was empty")
  }

  return conversation
}

export async function deleteConversation(id: string): Promise<void> {
  await apiFetch<Record<string, unknown>>(`/ai/conversations/${id}`, {
    method: "DELETE",
  })
}
