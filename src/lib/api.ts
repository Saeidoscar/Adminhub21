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

function getApiBaseUrlLaravel() {
  return (import.meta.env.VITE_API_BASE_URL_LARAVEL?.trim() || getApiBaseUrl())
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

    const error = new Error(
      message || `Request failed with status ${response.status}`,
    )
    ;(error as Error & { status: number }).status = response.status
    throw error
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

export interface AdminUserRow {
  id: string
  email: string
  role: string
  nameEn: string
  nameFa: string
  phone: string | null
  phoneVerified: boolean
  createdAt: string
}

export async function listAdminUsers(query: {
  role?: string
  search?: string
}): Promise<AdminUserRow[]> {
  const params = new URLSearchParams()
  if (query.role) params.set("role", query.role)
  if (query.search) params.set("search", query.search)
  const qs = params.toString()
  const payload = await apiFetch<Record<string, unknown>>(
    `/api/admin/users${qs ? `?${qs}` : ""}`,
  )
  return unwrapList<AdminUserRow>(payload, "users")
}

export async function getAdminUser(id: string): Promise<AdminUserRow | null> {
  const payload = await apiFetch<Record<string, unknown>>(`/api/admin/users/${id}`)
  return unwrapItem<AdminUserRow>(payload, "user")
}

export async function updateAdminUser(
  id: string,
  data: Partial<{
    role: string
    nameEn: string
    nameFa: string
    phone: string | null
    phoneVerified: boolean
  }>,
): Promise<AdminUserRow> {
  const payload = await apiFetch<Record<string, unknown>>(`/api/admin/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  })
  const user = unwrapItem<AdminUserRow>(payload, "user")
  if (!user) {
    throw new Error("Update user response was empty")
  }
  return user
}

export async function deleteAdminUser(id: string): Promise<void> {
  await apiFetch<Record<string, unknown>>(`/api/admin/users/${id}`, {
    method: "DELETE",
  })
}

export interface StoryRow {
  id: string
  authorId: string
  authorName: string
  title: string
  content: string
  coverUrl: string | null
  status: string
  views: number
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface BlogRow {
  id: string
  authorId: string
  authorName: string
  title: string
  content: string
  coverUrl: string | null
  status: string
  views: number
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface CommentRow {
  id: string
  postId: string
  postType: string
  authorId: string
  authorName: string
  parentId: string | null
  body: string
  createdAt: string
}

export async function listAdminStories(query: {
  status?: string
  search?: string
}): Promise<StoryRow[]> {
  const params = new URLSearchParams()
  if (query.status) params.set("status", query.status)
  if (query.search) params.set("search", query.search)
  const qs = params.toString()
  const payload = await apiFetch<Record<string, unknown>>(
    `/api/admin/content/stories${qs ? `?${qs}` : ""}`,
  )
  return unwrapList<StoryRow>(payload, "stories")
}

export async function listAdminBlogs(query: {
  status?: string
  search?: string
}): Promise<BlogRow[]> {
  const params = new URLSearchParams()
  if (query.status) params.set("status", query.status)
  if (query.search) params.set("search", query.search)
  const qs = params.toString()
  const payload = await apiFetch<Record<string, unknown>>(
    `/api/admin/content/blogs${qs ? `?${qs}` : ""}`,
  )
  return unwrapList<BlogRow>(payload, "blogs")
}

export async function moderateStoryAdmin(
  id: string,
  action: "approve" | "reject" | "archive",
): Promise<StoryRow> {
  const payload = await apiFetch<Record<string, unknown>>(
    `/api/admin/content/stories/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify({ action }),
    },
  )
  const story = unwrapItem<StoryRow>(payload, "story")
  if (!story) {
    throw new Error("Moderate story response was empty")
  }
  return story
}

export async function moderateBlogAdmin(
  id: string,
  action: "approve" | "reject" | "archive",
): Promise<BlogRow> {
  const payload = await apiFetch<Record<string, unknown>>(
    `/api/admin/content/blogs/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify({ action }),
    },
  )
  const blog = unwrapItem<BlogRow>(payload, "blog")
  if (!blog) {
    throw new Error("Moderate blog response was empty")
  }
  return blog
}

export async function listAdminComments(query: {
  postType?: string
}): Promise<CommentRow[]> {
  const params = new URLSearchParams()
  if (query.postType) params.set("postType", query.postType)
  const qs = params.toString()
  const payload = await apiFetch<Record<string, unknown>>(
    `/api/admin/content/comments${qs ? `?${qs}` : ""}`,
  )
  return unwrapList<CommentRow>(payload, "comments")
}

export async function deleteAdminComment(id: string): Promise<void> {
  await apiFetch<Record<string, unknown>>(`/api/admin/content/comments/${id}`, {
    method: "DELETE",
  })
}

export async function listAdminTickets(query: {
  status?: string
  category?: string
  priority?: string
}): Promise<TicketRow[]> {
  const params = new URLSearchParams()
  if (query.status) params.set("status", query.status)
  if (query.category) params.set("category", query.category)
  if (query.priority) params.set("priority", query.priority)
  const qs = params.toString()
  const payload = await apiFetch<Record<string, unknown>>(
    `/api/admin/tickets${qs ? `?${qs}` : ""}`,
  )
  return unwrapList<TicketRow>(payload, "tickets")
}

export async function getAdminTicket(id: string): Promise<TicketRow | null> {
  const payload = await apiFetch<Record<string, unknown>>(`/api/admin/tickets/${id}`)
  return unwrapItem<TicketRow>(payload, "ticket")
}

export async function updateAdminTicket(
  id: string,
  data: {
    status?: "open" | "in_progress" | "resolved" | "closed"
    priority?: "low" | "medium" | "high" | "urgent"
  },
): Promise<TicketRow> {
  const payload = await apiFetch<Record<string, unknown>>(`/api/admin/tickets/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  })
  const ticket = unwrapItem<TicketRow>(payload, "ticket")
  if (!ticket) {
    throw new Error("Update ticket response was empty")
  }
  return ticket
}

export async function listAdminCases(query: {
  status?: string
  priority?: string
  search?: string
}): Promise<CaseRow[]> {
  const params = new URLSearchParams()
  if (query.status) params.set("status", query.status)
  if (query.priority) params.set("priority", query.priority)
  if (query.search) params.set("search", query.search)
  const qs = params.toString()
  const payload = await apiFetch<Record<string, unknown>>(
    `/api/cases${qs ? `?${qs}` : ""}`,
  )
  return unwrapList<CaseRow>(payload, "cases")
}

export async function getAdminCase(id: string): Promise<CaseRow | null> {
  const payload = await apiFetch<Record<string, unknown>>(`/api/cases/${id}`)
  return unwrapItem<CaseRow>(payload, "case")
}

export async function createAdminCase(data: {
  employerId: string
  title: string
  description: string
  priority?: string
  tags?: string[]
}): Promise<CaseRow> {
  const payload = await apiFetch<Record<string, unknown>>("/api/cases", {
    method: "POST",
    body: JSON.stringify(data),
  })
  const case_ = unwrapItem<CaseRow>(payload, "case")
  if (!case_) {
    throw new Error("Create case response was empty")
  }
  return case_
}

export async function updateAdminCase(
  id: string,
  data: Partial<{
    title: string
    description: string
    priority: string
    status: string
    tags: string[]
  }>,
): Promise<CaseRow> {
  const payload = await apiFetch<Record<string, unknown>>(`/api/cases/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  })
  const case_ = unwrapItem<CaseRow>(payload, "case")
  if (!case_) {
    throw new Error("Update case response was empty")
  }
  return case_
}

export async function listAdminTasks(caseId: string): Promise<TaskRow[]> {
  const payload = await apiFetch<Record<string, unknown>>(
    `/api/tasks/case/${caseId}`,
  )
  return unwrapList<TaskRow>(payload, "tasks")
}

export async function getAdminTask(id: string): Promise<TaskRow | null> {
  const payload = await apiFetch<Record<string, unknown>>(`/api/tasks/${id}`)
  return unwrapItem<TaskRow>(payload, "task")
}

export async function createAdminTask(data: {
  caseId: string
  title: string
  description: string
  assignedTo?: string
  status?: string
  priority?: string
  dueDate?: string
}): Promise<TaskRow> {
  const payload = await apiFetch<Record<string, unknown>>("/api/tasks", {
    method: "POST",
    body: JSON.stringify(data),
  })
  const task = unwrapItem<TaskRow>(payload, "task")
  if (!task) {
    throw new Error("Create task response was empty")
  }
  return task
}

export async function updateAdminTask(
  id: string,
  data: Partial<{
    title: string
    description: string
    assignedTo: string
    status: string
    priority: string
    dueDate: string
  }>,
): Promise<TaskRow> {
  const payload = await apiFetch<Record<string, unknown>>(`/api/tasks/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  })
  const task = unwrapItem<TaskRow>(payload, "task")
  if (!task) {
    throw new Error("Update task response was empty")
  }
  return task
}

export async function listAdminEvents(query: {
  from?: string
  to?: string
}): Promise<EventRow[]> {
  const params = new URLSearchParams()
  if (query.from) params.set("from", query.from)
  if (query.to) params.set("to", query.to)
  const qs = params.toString()
  const payload = await apiFetch<Record<string, unknown>>(
    `/api/events${qs ? `?${qs}` : ""}`,
  )
  return unwrapList<EventRow>(payload, "events")
}

export async function getAdminEvent(id: string): Promise<EventRow | null> {
  const payload = await apiFetch<Record<string, unknown>>(`/api/events/${id}`)
  return unwrapItem<EventRow>(payload, "event")
}

export async function createAdminEvent(data: {
  title: string
  description?: string
  startAt: string
  endAt: string
  allDay?: boolean
  color?: string
}): Promise<EventRow> {
  const payload = await apiFetch<Record<string, unknown>>("/api/events", {
    method: "POST",
    body: JSON.stringify(data),
  })
  const event = unwrapItem<EventRow>(payload, "event")
  if (!event) {
    throw new Error("Create event response was empty")
  }
  return event
}

export async function updateAdminEvent(
  id: string,
  data: Partial<{
    title: string
    description: string
    startAt: string
    endAt: string
    allDay: boolean
    color: string
  }>,
): Promise<EventRow> {
  const payload = await apiFetch<Record<string, unknown>>(`/api/events/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  })
  const event = unwrapItem<EventRow>(payload, "event")
  if (!event) {
    throw new Error("Update event response was empty")
  }
  return event
}

export async function deleteAdminEvent(id: string): Promise<void> {
  await apiFetch<Record<string, unknown>>(`/api/events/${id}`, {
    method: "DELETE",
  })
}

export async function listAdminTimeLogs(query: {
  caseId?: string
  taskId?: string
}): Promise<TimeLogRow[]> {
  const params = new URLSearchParams()
  if (query.caseId) params.set("caseId", query.caseId)
  if (query.taskId) params.set("taskId", query.taskId)
  const qs = params.toString()
  const payload = await apiFetch<Record<string, unknown>>(
    `/api/time-logs${qs ? `?${qs}` : ""}`,
  )
  return unwrapList<TimeLogRow>(payload, "timeLogs")
}

export async function getAdminTimeLog(id: string): Promise<TimeLogRow | null> {
  const payload = await apiFetch<Record<string, unknown>>(`/api/time-logs/${id}`)
  return unwrapItem<TimeLogRow>(payload, "timeLog")
}

export async function createAdminTimeLog(data: {
  caseId?: string
  taskId?: string
  description: string
  startedAt: string
  endedAt: string
}): Promise<TimeLogRow> {
  const payload = await apiFetch<Record<string, unknown>>("/api/time-logs", {
    method: "POST",
    body: JSON.stringify(data),
  })
  const timeLog = unwrapItem<TimeLogRow>(payload, "timeLog")
  if (!timeLog) {
    throw new Error("Create time log response was empty")
  }
  return timeLog
}

export async function listAdminPortfolio(adminId: string): Promise<PortfolioRow[]> {
  const payload = await apiFetch<Record<string, unknown>>(
    `/api/portfolio/admin/${adminId}`,
  )
  return unwrapList<PortfolioRow>(payload, "portfolio")
}

export async function getAdminPortfolio(id: string): Promise<PortfolioRow | null> {
  const payload = await apiFetch<Record<string, unknown>>(`/api/portfolio/${id}`)
  return unwrapItem<PortfolioRow>(payload, "portfolio")
}

export async function createAdminPortfolio(data: {
  title: string
  description: string
  mediaUrl: string
  mediaType: string
  tags?: string[]
}): Promise<PortfolioRow> {
  const payload = await apiFetch<Record<string, unknown>>("/api/portfolio", {
    method: "POST",
    body: JSON.stringify(data),
  })
  const portfolio = unwrapItem<PortfolioRow>(payload, "portfolio")
  if (!portfolio) {
    throw new Error("Create portfolio response was empty")
  }
  return portfolio
}

export async function updateAdminPortfolio(
  id: string,
  data: Partial<{
    title: string
    description: string
    mediaUrl: string
    mediaType: string
    tags: string[]
  }>,
): Promise<PortfolioRow> {
  const payload = await apiFetch<Record<string, unknown>>(`/api/portfolio/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  })
  const portfolio = unwrapItem<PortfolioRow>(payload, "portfolio")
  if (!portfolio) {
    throw new Error("Update portfolio response was empty")
  }
  return portfolio
}

export async function deleteAdminPortfolio(id: string): Promise<void> {
  await apiFetch<Record<string, unknown>>(`/api/portfolio/${id}`, {
    method: "DELETE",
  })
}

export interface StoryRow {
  id: string
  authorId: string
  authorName: string
  title: string
  content: string
  coverUrl: string | null
  status: string
  views: number
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface BlogRow {
  id: string
  authorId: string
  authorName: string
  title: string
  content: string
  coverUrl: string | null
  status: string
  views: number
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface CommentRow {
  id: string
  postId: string
  postType: string
  authorId: string
  authorName: string
  parentId: string | null
  body: string
  createdAt: string
}

export interface CreateStoryInput {
  title: string
  content: string
  coverUrl?: string
  status?: "draft" | "published" | "archived"
}

export async function listStories(query: {
  status?: string
  search?: string
} = {}): Promise<StoryRow[]> {
  const params = new URLSearchParams()
  if (query.status) params.set("status", query.status)
  if (query.search) params.set("search", query.search)
  const qs = params.toString()
  const payload = await apiFetch<Record<string, unknown>>(
    `/api/stories${qs ? `?${qs}` : ""}`,
  )
  return unwrapList<StoryRow>(payload, "stories")
}

export async function getStory(id: string): Promise<StoryRow | null> {
  const payload = await apiFetch<Record<string, unknown>>(`/api/stories/${id}`)
  return unwrapItem<StoryRow>(payload, "story")
}

export async function createStory(input: CreateStoryInput): Promise<StoryRow> {
  const payload = await apiFetch<Record<string, unknown>>("/api/stories", {
    method: "POST",
    body: JSON.stringify(input),
  })
  const story = unwrapItem<StoryRow>(payload, "story")
  if (!story) {
    throw new Error("Create story response was empty")
  }
  return story
}

export async function updateStory(
  id: string,
  input: Partial<CreateStoryInput>,
): Promise<StoryRow> {
  const payload = await apiFetch<Record<string, unknown>>(`/api/stories/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  })
  const story = unwrapItem<StoryRow>(payload, "story")
  if (!story) {
    throw new Error("Update story response was empty")
  }
  return story
}

export async function deleteStory(id: string): Promise<void> {
  await apiFetch<Record<string, unknown>>(`/api/stories/${id}`, {
    method: "DELETE",
  })
}

export interface CreateBlogInput {
  title: string
  content: string
  coverUrl?: string
  status?: "draft" | "published" | "archived"
}

export async function listBlogs(query: {
  status?: string
  search?: string
} = {}): Promise<BlogRow[]> {
  const params = new URLSearchParams()
  if (query.status) params.set("status", query.status)
  if (query.search) params.set("search", query.search)
  const qs = params.toString()
  const payload = await apiFetch<Record<string, unknown>>(
    `/api/blogs${qs ? `?${qs}` : ""}`,
  )
  return unwrapList<BlogRow>(payload, "blogs")
}

export async function getBlog(id: string): Promise<BlogRow | null> {
  const payload = await apiFetch<Record<string, unknown>>(`/api/blogs/${id}`)
  return unwrapItem<BlogRow>(payload, "blog")
}

export async function createBlog(input: CreateBlogInput): Promise<BlogRow> {
  const payload = await apiFetch<Record<string, unknown>>("/api/blogs", {
    method: "POST",
    body: JSON.stringify(input),
  })
  const blog = unwrapItem<BlogRow>(payload, "blog")
  if (!blog) {
    throw new Error("Create blog response was empty")
  }
  return blog
}

export async function updateBlog(
  id: string,
  input: Partial<CreateBlogInput>,
): Promise<BlogRow> {
  const payload = await apiFetch<Record<string, unknown>>(`/api/blogs/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  })
  const blog = unwrapItem<BlogRow>(payload, "blog")
  if (!blog) {
    throw new Error("Update blog response was empty")
  }
  return blog
}

export async function deleteBlog(id: string): Promise<void> {
  await apiFetch<Record<string, unknown>>(`/api/blogs/${id}`, {
    method: "DELETE",
  })
}

export interface CreateCommentInput {
  postId: string
  postType: "story" | "blog"
  body: string
  parentId?: string
}

export async function listComments(query: {
  postId: string
  postType: string
}): Promise<CommentRow[]> {
  const params = new URLSearchParams()
  params.set("postId", query.postId)
  params.set("postType", query.postType)
  const qs = params.toString()
  const payload = await apiFetch<Record<string, unknown>>(
    `/api/comments${qs ? `?${qs}` : ""}`,
  )
  return unwrapList<CommentRow>(payload, "comments")
}

export async function getComment(id: string): Promise<CommentRow | null> {
  const payload = await apiFetch<Record<string, unknown>>(`/api/comments/${id}`)
  return unwrapItem<CommentRow>(payload, "comment")
}

export async function createComment(input: CreateCommentInput): Promise<CommentRow> {
  const payload = await apiFetch<Record<string, unknown>>("/api/comments", {
    method: "POST",
    body: JSON.stringify(input),
  })
  const comment = unwrapItem<CommentRow>(payload, "comment")
  if (!comment) {
    throw new Error("Create comment response was empty")
  }
  return comment
}

export async function deleteComment(id: string): Promise<void> {
  await apiFetch<Record<string, unknown>>(`/api/comments/${id}`, {
    method: "DELETE",
  })
}
