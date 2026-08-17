export type PlatformKey = "instagram" | "telegram" | "whatsapp" | "torob" | "digikala" | "linkedin"

export type BillingCycle = "monthly" | "project" | "hourly"

export type PackageType = "platform" | "bundle"

export interface PlatformConfig {
  platform: PlatformKey
  settings: Record<string, unknown>
}

export interface ContractPackage {
  id: string
  adminId: string
  name: string
  description: string
  type: PackageType
  platforms: PlatformKey[]
  platformConfigs: PlatformConfig[]
  priceToman: number
  priceUSD: number
  billingCycle: BillingCycle
  deliveryTime: string
  featured: boolean
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface CustomOffer {
  id: string
  packageId?: string
  adminId: string
  employerId: string
  employerName: string
  name: string
  description: string
  platforms: PlatformKey[]
  platformConfigs: PlatformConfig[]
  proposedPriceToman?: number
  proposedPriceUSD?: number
  billingCycle: BillingCycle
  deliveryTime?: string
  startDate?: string
  endDate?: string
  message?: string
  createdAt: string
}

export interface AdminProfile {
  id: string
  nameEn: string
  nameFa: string
  photo: string
  platforms: PlatformKey[]
  rating: number
  reviews: number
  verified: boolean
  insured: boolean
  monthlyToman: number
  monthlyUSD: number
  bioEn: string
  bioFa: string
  skillsEn: string[]
  skillsFa: string[]
}

export type Role = "employer" | "admin" | "super_admin"

export interface SafeUser {
  id: string
  email: string
  role: Role
  nameEn: string
  nameFa: string
  phone: string | null
  photo: string | null
  phoneVerified: boolean
  createdAt: string
}

export interface ContractRow {
  id: string
  code: string
  adminId: string
  adminNameEn: string
  adminNameFa: string
  adminPhoto: string
  employerId: string
  employerName: string
  platform: string
  status: "active" | "pending" | "completed" | "disputed"
  amountToman: number
  amountUSD: number
  hasInsurance: boolean
  hasSubstitute: boolean
  termClause: string | null
  substituteClause: string | null
  startDate: string | null
  endDate: string | null
  signedByEmployerAt: string | null
  signedByAdminAt: string | null
  createdAt: string
  updatedAt: string
}

export interface ReviewRow {
  id: string
  adminId: string
  adminNameEn: string
  adminNameFa: string
  employerId: string
  employerName: string
  contractId: string | null
  rating: number
  comment: string | null
  createdAt: string
}

export interface WalletRow {
  id: string
  userId: string
  balanceToman: number
  balanceUSD: number
  currency: string
  createdAt: string
  updatedAt: string
}

export interface WalletTransactionRow {
  id: string
  walletId: string
  type: "deposit" | "withdraw" | "transfer" | "payout" | "payment"
  amountToman: number
  amountUSD: number
  currency: string
  status: "pending" | "completed" | "failed" | "cancelled"
  referenceId: string | null
  note: string | null
  createdAt: string
}

export interface FavoriteRow {
  id: string
  userId: string
  adminId: string
  createdAt: string
}

export interface PayoutRow {
  id: string
  userId: string
  userName: string
  amountToman: number
  amountUSD: number
  currency: string
  method: string
  accountDetails: Record<string, unknown>
  status: "pending" | "approved" | "rejected" | "completed"
  processedAt: string | null
  processedByName: string | null
  note: string | null
  createdAt: string
}

export interface CaseRow {
  id: string
  adminId: string
  adminNameEn: string
  adminNameFa: string
  employerId: string
  employerName: string
  title: string
  description: string
  priority: "low" | "medium" | "high" | "urgent"
  status: "open" | "in_progress" | "review" | "closed"
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface TaskRow {
  id: string
  caseId: string
  caseTitle: string
  assignedTo: string | null
  assignedName: string | null
  title: string
  description: string
  status: "todo" | "in_progress" | "done" | "blocked"
  priority: string
  dueDate: string | null
  createdAt: string
  updatedAt: string
}

export interface EventRow {
  id: string
  userId: string
  title: string
  description: string
  startAt: string
  endAt: string
  allDay: boolean
  color: string
  createdAt: string
  updatedAt: string
}

export interface TimeLogRow {
  id: string
  userId: string
  userName: string
  caseId: string | null
  caseTitle: string | null
  taskId: string | null
  taskTitle: string | null
  description: string
  startedAt: string
  endedAt: string
  durationMinutes: number | null
  createdAt: string
}

export interface PortfolioRow {
  id: string
  adminId: string
  adminNameEn: string
  adminNameFa: string
  title: string
  description: string
  mediaUrl: string
  mediaType: string
  tags: string[]
  createdAt: string
}

export interface TicketRow {
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

export interface TicketMessageRow {
  id: string
  ticketId: string
  senderId: string
  senderName: string
  body: string
  createdAt: string
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

export interface AiConversationRow {
  id: string
  userId: string
  title: string
  modelId: string
  createdAt: string
  updatedAt: string
}

export interface AiMessageRow {
  id: string
  conversationId: string
  role: string
  content: string
  provider?: string
  modelCode?: string
  promptTokens?: number
  completionTokens?: number
  totalTokens?: number
  inputCost?: number
  outputCost?: number
  totalCost?: number
  responseTimeMs?: number
  createdAt: string
}

export interface AiModelRow {
  id: string
  provider: string
  code: string
  name: string
  description?: string
  inputCost: number
  outputCost: number
  contextWindow?: number
  apiBaseUrl?: string
  defaultTemperature?: number
  maxOutputTokens?: number
  supportsStreaming: boolean
  supportsVision: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface AffiliateCodeRow {
  id: string
  userId: string
  userName: string
  userEmail: string
  code: string
  isActive: boolean
  createdAt: string
}

export interface AffiliateCommissionRow {
  id: string
  codeId: string
  code: string
  referrerId: string
  referrerName: string
  referredId: string
  referredName: string
  amountToman: number
  amountUSD: number
  status: string
  paidAt: string | null
  createdAt: string
}

export interface DashboardStats {
  totalUsers: number
  totalAdmins: number
  totalEmployers: number
  totalContracts: number
  activeContracts: number
  totalRevenueToman: number
  totalRevenueUSD: number
  totalPackages: number
  totalReviews: number
  avgRating: number
}
