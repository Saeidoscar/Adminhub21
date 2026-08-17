import type {
  AdminProfile,
  AiConversationRow,
  AiMessageRow,
  AiModelRow,
  ContractPackage,
  ContractRow,
  CustomOffer,
  DashboardStats,
  FavoriteRow,
  PlatformKey,
  ReviewRow,
  WalletRow,
  WalletTransactionRow,
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

export interface CreateContractInput {
  offerId?: string
  adminId?: string
  platform: string
  amountToman: number
  amountUSD: number
  hasInsurance: boolean
  hasSubstitute: boolean
  termClause?: string
  substituteClause?: string
  startDate?: string
  endDate?: string
}

export type Contract = ContractRow

export async function createContract(
  input: CreateContractInput,
): Promise<ContractRow> {
  const payload = await apiFetch<Record<string, unknown>>("/api/contracts", {
    method: "POST",
    body: JSON.stringify(input),
  })
  const contract = unwrapItem<ContractRow>(payload, "contract")
  if (!contract) {
    throw new Error("Contract creation response was empty")
  }
  return contract
}

export async function getContract(id: string): Promise<ContractRow | null> {
  const payload = await apiFetch<Record<string, unknown>>(`/api/contracts/${id}`)
  return unwrapItem<ContractRow>(payload, "contract")
}

export async function updateContractStatus(
  id: string,
  input: { status: ContractRow["status"] },
): Promise<ContractRow> {
  const payload = await apiFetch<Record<string, unknown>>(
    `/api/contracts/${id}/status`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    },
  )
  const contract = unwrapItem<ContractRow>(payload, "contract")
  if (!contract) {
    throw new Error("Contract update response was empty")
  }
  return contract
}

export interface Tool {
  id: string
  name: string
  descEn: string
  descFa: string
  category: string
  icon: string
  rating: number
  reviews: number
  popular: boolean
  priceToman: number
  priceUSD: number
  createdAt: string
}

export interface Editor {
  id: string
  nameEn: string
  nameFa: string
  photo: string
  specialty: string
  rating: number
  reviews: number
  projects: number
  delivery: string
  rateToman: number
  rateUSD: number
  bioEn: string
  bioFa: string
  createdAt: string
}

export interface VibeCoder {
  id: string
  nameEn: string
  nameFa: string
  photo: string
  stack: string
  rating: number
  reviews: number
  projects: number
  rateToman: number
  rateUSD: number
  delivery: string
  bioEn: string
  bioFa: string
  createdAt: string
}

export interface ListToolsQuery {
  category?: string
  popular?: boolean
  minRating?: number
  search?: string
}

export async function listTools(query: ListToolsQuery = {}): Promise<Tool[]> {
  const params = new URLSearchParams()
  if (query.category) params.set("category", query.category)
  if (typeof query.popular === "boolean") params.set("popular", String(query.popular))
  if (typeof query.minRating === "number") params.set("minRating", String(query.minRating))
  if (query.search) params.set("search", query.search)
  const qs = params.toString()
  const payload = await apiFetch<Record<string, unknown>>(
    `/api/catalog/tools${qs ? `?${qs}` : ""}`,
  )
  return unwrapList<Tool>(payload, "tools")
}

export interface ListEditorsQuery {
  specialty?: string
  minRating?: number
  search?: string
}

export async function listEditors(query: ListEditorsQuery = {}): Promise<Editor[]> {
  const params = new URLSearchParams()
  if (query.specialty) params.set("specialty", query.specialty)
  if (typeof query.minRating === "number") params.set("minRating", String(query.minRating))
  if (query.search) params.set("search", query.search)
  const qs = params.toString()
  const payload = await apiFetch<Record<string, unknown>>(
    `/api/catalog/editors${qs ? `?${qs}` : ""}`,
  )
  return unwrapList<Editor>(payload, "editors")
}

export interface ListVibeCodersQuery {
  stack?: string
  minRating?: number
  search?: string
}

export async function listVibeCoders(query: ListVibeCodersQuery = {}): Promise<VibeCoder[]> {
  const params = new URLSearchParams()
  if (query.stack) params.set("stack", query.stack)
  if (typeof query.minRating === "number") params.set("minRating", String(query.minRating))
  if (query.search) params.set("search", query.search)
  const qs = params.toString()
  const payload = await apiFetch<Record<string, unknown>>(
    `/api/catalog/vibe-coders${qs ? `?${qs}` : ""}`,
  )
  return unwrapList<VibeCoder>(payload, "vibe-coders")
}

export interface ListContractsQuery {
  status?: "active" | "pending" | "completed" | "disputed"
  platform?: string
}

export async function listContracts(
  query: ListContractsQuery = {},
): Promise<ContractRow[]> {
  const params = new URLSearchParams()

  if (query.status) {
    params.set("status", query.status)
  }

  if (query.platform) {
    params.set("platform", query.platform)
  }

  const queryString = params.toString()
  const payload = await apiFetch<Record<string, unknown>>(
    `/api/contracts${queryString ? `?${queryString}` : ""}`,
  )

  return unwrapList<ContractRow>(payload, "contracts")
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const payload = await apiFetch<Record<string, unknown>>(
    "/api/admin/dashboard/stats",
  )

  const stats = unwrapItem<DashboardStats>(payload, "stats")

  if (!stats) {
    throw new Error("Dashboard stats response was empty")
  }

  return stats
}

export async function getWallet(): Promise<WalletRow> {
  const payload = await apiFetch<Record<string, unknown>>("/api/wallets/me")

  const wallet = unwrapItem<WalletRow>(payload, "wallet")

  if (!wallet) {
    throw new Error("Wallet response was empty")
  }

  return wallet
}

export interface CreateTransactionInput {
  type: "deposit" | "withdraw" | "transfer" | "payout" | "payment"
  amountToman?: number
  amountUSD?: number
  currency: string
  note?: string
}

export async function createTransaction(
  input: CreateTransactionInput,
): Promise<WalletTransactionRow> {
  const payload = await apiFetch<Record<string, unknown>>(
    "/api/wallets/me/transactions",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  )

  const transaction = unwrapItem<WalletTransactionRow>(payload, "transaction")

  if (!transaction) {
    throw new Error("Transaction creation response was empty")
  }

  return transaction
}

export interface ListTransactionsQuery {
  walletId?: string
  type?: "deposit" | "withdraw" | "transfer" | "payout" | "payment"
  status?: "pending" | "completed" | "failed" | "cancelled"
}

export async function listTransactions(
  query: ListTransactionsQuery = {},
): Promise<WalletTransactionRow[]> {
  const params = new URLSearchParams()

  if (query.walletId) {
    params.set("walletId", query.walletId)
  }

  if (query.type) {
    params.set("type", query.type)
  }

  if (query.status) {
    params.set("status", query.status)
  }

  const queryString = params.toString()
  const payload = await apiFetch<Record<string, unknown>>(
    `/api/wallets/me/transactions${queryString ? `?${queryString}` : ""}`,
  )

  return unwrapList<WalletTransactionRow>(payload, "transactions")
}

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

export async function createReview(
  input: {
    adminId: string
    contractId?: string
    rating: number
    comment?: string
  },
): Promise<ReviewRow> {
  const payload = await apiFetch<Record<string, unknown>>("/api/reviews", {
    method: "POST",
    body: JSON.stringify(input),
  })

  const review = unwrapItem<ReviewRow>(payload, "review")

  if (!review) {
    throw new Error("Create review response was empty")
  }

  return review
}

export interface ListReviewsQuery {
  adminId?: string
  employerId?: string
}

export async function listReviews(
  query: ListReviewsQuery = {},
): Promise<ReviewRow[]> {
  const params = new URLSearchParams()

  if (query.adminId) {
    params.set("adminId", query.adminId)
  }

  if (query.employerId) {
    params.set("employerId", query.employerId)
  }

  const queryString = params.toString()
  const payload = await apiFetch<Record<string, unknown>>(
    `/api/reviews${queryString ? `?${queryString}` : ""}`,
  )

  return unwrapList<ReviewRow>(payload, "reviews")
}

export interface RegisterInput {
  email: string
  password: string
  role: "employer" | "admin"
  nameEn: string
  nameFa: string
  phone?: string
}

export interface LoginInput {
  email: string
  password: string
}

export interface OtpSendInput {
  phone: string
}

export interface OtpVerifyInput {
  phone: string
  code: string
}

export async function register(
  input: RegisterInput,
): Promise<{ user: SafeUser; accessToken: string }> {
  const payload = await apiFetch<Record<string, unknown>>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  })

  const user = unwrapItem<SafeUser>(payload, "user")
  const accessToken = unwrapItem<string>(payload, "accessToken")

  if (!user || !accessToken) {
    throw new Error("Registration response was empty")
  }

  return { user, accessToken }
}

export async function login(
  input: LoginInput,
): Promise<{ user: SafeUser; accessToken: string }> {
  const payload = await apiFetch<Record<string, unknown>>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  })

  const user = unwrapItem<SafeUser>(payload, "user")
  const accessToken = unwrapItem<string>(payload, "accessToken")

  if (!user || !accessToken) {
    throw new Error("Login response was empty")
  }

  return { user, accessToken }
}

export async function sendOtp(
  input: OtpSendInput,
): Promise<{ message: string; phone: string }> {
  const payload = await apiFetch<Record<string, unknown>>("/api/auth/otp/send", {
    method: "POST",
    body: JSON.stringify(input),
  })

  const message = unwrapItem<string>(payload, "message")
  const phone = unwrapItem<string>(payload, "phone")

  if (!message || !phone) {
    throw new Error("Send OTP response was empty")
  }

  return { message, phone }
}

export async function verifyOtp(
  input: OtpVerifyInput,
): Promise<{ user: SafeUser; accessToken: string }> {
  const payload = await apiFetch<Record<string, unknown>>("/api/auth/otp/verify", {
    method: "POST",
    body: JSON.stringify(input),
  })

  const user = unwrapItem<SafeUser>(payload, "user")
  const accessToken = unwrapItem<string>(payload, "accessToken")

  if (!user || !accessToken) {
    throw new Error("Verify OTP response was empty")
  }

  return { user, accessToken }
}

export async function logout(): Promise<void> {
  await apiFetch<void>("/api/auth/logout", { method: "POST" })
}

export async function getMe(): Promise<SafeUser> {
  const payload = await apiFetch<Record<string, unknown>>("/api/auth/me")
  const user = unwrapItem<SafeUser>(payload, "user")

  if (!user) {
    throw new Error("Get me response was empty")
  }

  return user
}

export interface Ticket {
  id: string
  userId: string
  userName: string
  userEmail: string
  subject: string
  category: string
  priority: string
  status: string
  createdAt: string
  updatedAt: string
}

export interface TicketMessage {
  id: string
  ticketId: string
  senderId: string
  senderName: string
  body: string
  createdAt: string
}

export interface CreateTicketInput {
  subject: string
  category: "billing" | "technical" | "account" | "other"
  priority: "low" | "medium" | "high" | "urgent"
}

export async function createTicket(input: CreateTicketInput): Promise<Ticket> {
  const payload = await apiFetch<Record<string, unknown>>("/api/tickets", {
    method: "POST",
    body: JSON.stringify(input),
  })
  const ticket = unwrapItem<Ticket>(payload, "ticket")
  if (!ticket) {
    throw new Error("Ticket creation response was empty")
  }
  return ticket
}

export async function listTickets(): Promise<Ticket[]> {
  const payload = await apiFetch<Record<string, unknown>>("/api/tickets")
  return unwrapList<Ticket>(payload, "tickets")
}

export async function getTicket(id: string): Promise<Ticket | null> {
  const payload = await apiFetch<Record<string, unknown>>(`/api/tickets/${id}`)
  return unwrapItem<Ticket>(payload, "ticket")
}

export async function updateTicket(
  id: string,
  input: {
    status?: "open" | "in_progress" | "resolved" | "closed"
    priority?: "low" | "medium" | "high" | "urgent"
  },
): Promise<Ticket> {
  const payload = await apiFetch<Record<string, unknown>>(`/api/tickets/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  })
  const ticket = unwrapItem<Ticket>(payload, "ticket")
  if (!ticket) {
    throw new Error("Ticket update response was empty")
  }
  return ticket
}

export interface CreateTicketMessageInput {
  body: string
}

export async function createTicketMessage(
  ticketId: string,
  input: CreateTicketMessageInput,
): Promise<TicketMessage> {
  const payload = await apiFetch<Record<string, unknown>>(
    `/api/tickets/${ticketId}/messages`,
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  )
  const message = unwrapItem<TicketMessage>(payload, "message")
  if (!message) {
    throw new Error("Ticket message creation response was empty")
  }
  return message
}

export async function listTicketMessages(ticketId: string): Promise<TicketMessage[]> {
  const payload = await apiFetch<Record<string, unknown>>(
    `/api/tickets/${ticketId}/messages`,
  )
  return unwrapList<TicketMessage>(payload, "messages")
}
