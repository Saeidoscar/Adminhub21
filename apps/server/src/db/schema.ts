import {
  boolean,
  doublePrecision,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core"
import type { BillingCycle, PlatformConfig, PlatformKey } from "@adminhub/shared"

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}

export const roleEnum = pgEnum("role", ["employer", "admin", "super_admin"])

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: roleEnum("role").notNull().default("employer"),
  nameEn: text("name_en").notNull(),
  nameFa: text("name_fa").notNull(),
  phone: text("phone"),
  photo: text("photo"),
  phoneVerified: boolean("phone_verified").notNull().default(false),
  otpCode: text("otp_code"),
  otpExpiresAt: timestamp("otp_expires_at", { withTimezone: true }),
  ...timestamps,
})

export const apiTokens = pgTable("api_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull().default("default"),
  token: text("token").notNull().unique(),
  abilities: jsonb("abilities").$type<string[]>().notNull().default(["*"]),
  lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
  ...timestamps,
})

export const adminProfiles = pgTable("admin_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  photo: text("photo"),
  rating: doublePrecision("rating").notNull().default(0),
  reviews: integer("reviews").notNull().default(0),
  verified: boolean("verified").notNull().default(false),
  insured: boolean("insured").notNull().default(false),
  monthlyToman: integer("monthly_toman").notNull().default(0),
  monthlyUSD: integer("monthly_usd").notNull().default(0),
  bioEn: text("bio_en"),
  bioFa: text("bio_fa"),
  skillsEn: text("skills_en").array(),
  skillsFa: text("skills_fa").array(),
  platforms: text("platforms").array().$type<PlatformKey[]>(),
  ...timestamps,
})

export const packageTypeEnum = pgEnum("package_type", ["platform", "bundle"])
export const billingCycleEnum = pgEnum("billing_cycle", [
  "monthly",
  "project",
  "hourly",
])

export const packages = pgTable("packages", {
  id: uuid("id").primaryKey().defaultRandom(),
  adminId: uuid("admin_id")
    .notNull()
    .references(() => adminProfiles.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description").notNull(),
  type: packageTypeEnum("type").notNull(),
  platforms: text("platforms").array().$type<PlatformKey[]>().notNull().default([]),
  platformConfigs: jsonb("platform_configs")
    .$type<PlatformConfig[]>()
    .notNull()
    .default([]),
  priceToman: integer("price_toman").notNull(),
  priceUSD: integer("price_usd").notNull(),
  billingCycle: billingCycleEnum("billing_cycle")
    .$type<BillingCycle>()
    .notNull(),
  deliveryTime: text("delivery_time").notNull(),
  featured: boolean("featured").notNull().default(false),
  active: boolean("active").notNull().default(true),
  ...timestamps,
})

export const customOffers = pgTable("custom_offers", {
  id: uuid("id").primaryKey().defaultRandom(),
  packageId: uuid("package_id").references(() => packages.id, {
    onDelete: "set null",
  }),
  adminId: uuid("admin_id")
    .notNull()
    .references(() => adminProfiles.id, { onDelete: "cascade" }),
  employerId: uuid("employer_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  employerName: text("employer_name").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  platforms: text("platforms").array().$type<PlatformKey[]>().notNull().default([]),
  platformConfigs: jsonb("platform_configs")
    .$type<PlatformConfig[]>()
    .notNull()
    .default([]),
  proposedPriceToman: integer("proposed_price_toman"),
  proposedPriceUSD: integer("proposed_price_usd"),
  billingCycle: billingCycleEnum("billing_cycle")
    .$type<BillingCycle>()
    .notNull(),
  deliveryTime: text("delivery_time"),
  startDate: text("start_date"),
  endDate: text("end_date"),
  message: text("message"),
  ...timestamps,
})

export const contractStatusEnum = pgEnum("contract_status", [
  "active",
  "pending",
  "completed",
  "disputed",
])

export const contracts = pgTable("contracts", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull().unique(),
  employerId: uuid("employer_id")
    .notNull()
    .references(() => users.id),
  adminId: uuid("admin_id")
    .notNull()
    .references(() => adminProfiles.id),
  platform: text("platform").notNull(),
  status: contractStatusEnum("status").notNull().default("pending"),
  amountToman: integer("amount_toman").notNull(),
  amountUSD: integer("amount_usd").notNull(),
  hasInsurance: boolean("has_insurance").notNull().default(false),
  hasSubstitute: boolean("has_substitute").notNull().default(false),
  termClause: text("term_clause"),
  substituteClause: text("substitute_clause"),
  startDate: text("start_date"),
  endDate: text("end_date"),
  signedByEmployerAt: text("signed_by_employer_at"),
  signedByAdminAt: text("signed_by_admin_at"),
  ...timestamps,
})

export const favorites = pgTable(
  "favorites",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    adminId: uuid("admin_id")
      .notNull()
      .references(() => adminProfiles.id, { onDelete: "cascade" }),
    ...timestamps,
  },
  (t) => [uniqueIndex("favorites_user_admin").on(t.userId, t.adminId)],
)

export const reviews = pgTable("reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  adminId: uuid("admin_id")
    .notNull()
    .references(() => adminProfiles.id, { onDelete: "cascade" }),
  employerId: uuid("employer_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  contractId: uuid("contract_id").references(() => contracts.id, {
    onDelete: "set null",
  }),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  ...timestamps,
})

export const wallets = pgTable("wallets", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" })
    .unique(),
  balanceToman: integer("balance_toman").notNull().default(0),
  balanceUSD: integer("balance_usd").notNull().default(0),
  currency: text("currency").notNull().default("IRR"),
  ...timestamps,
})

export const transactionTypeEnum = pgEnum("transaction_type", [
  "deposit",
  "withdraw",
  "transfer",
  "payout",
  "payment",
])

export const transactionStatusEnum = pgEnum("transaction_status", [
  "pending",
  "completed",
  "failed",
  "cancelled",
])

export const walletTransactions = pgTable("wallet_transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  walletId: uuid("wallet_id")
    .notNull()
    .references(() => wallets.id, { onDelete: "cascade" }),
  type: transactionTypeEnum("type").notNull(),
  amountToman: integer("amount_toman").notNull().default(0),
  amountUSD: integer("amount_usd").notNull().default(0),
  currency: text("currency").notNull(),
  status: transactionStatusEnum("status").notNull().default("pending"),
  referenceId: text("reference_id"),
  note: text("note"),
  ...timestamps,
})

export const payoutStatusEnum = pgEnum("payout_status", [
  "pending",
  "approved",
  "rejected",
  "completed",
])

export const payouts = pgTable("payouts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  amountToman: integer("amount_toman").notNull(),
  amountUSD: integer("amount_usd").notNull(),
  currency: text("currency").notNull(),
  method: text("method").notNull(),
  accountDetails: jsonb("account_details")
    .$type<Record<string, unknown>>()
    .notNull()
    .default({}),
  status: payoutStatusEnum("status").notNull().default("pending"),
  processedAt: text("processed_at"),
  processedBy: uuid("processed_by").references(() => users.id, {
    onDelete: "set null",
  }),
  note: text("note"),
  ...timestamps,
})

export const casePriorityEnum = pgEnum("case_priority", [
  "low",
  "medium",
  "high",
  "urgent",
])

export const caseStatusEnum = pgEnum("case_status", [
  "open",
  "in_progress",
  "review",
  "closed",
])

export const cases = pgTable("cases", {
  id: uuid("id").primaryKey().defaultRandom(),
  adminId: uuid("admin_id")
    .notNull()
    .references(() => adminProfiles.id, { onDelete: "cascade" }),
  employerId: uuid("employer_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  priority: casePriorityEnum("priority").notNull().default("medium"),
  status: caseStatusEnum("status").notNull().default("open"),
  tags: text("tags").array().notNull().default([]),
  ...timestamps,
})

export const taskStatusEnum = pgEnum("task_status", [
  "todo",
  "in_progress",
  "done",
  "blocked",
])

export const tasks = pgTable("tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  caseId: uuid("case_id")
    .notNull()
    .references(() => cases.id, { onDelete: "cascade" }),
  assignedTo: uuid("assigned_to").references(() => users.id, {
    onDelete: "set null",
  }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: taskStatusEnum("status").notNull().default("todo"),
  priority: text("priority").notNull().default("medium"),
  dueDate: text("due_date"),
  ...timestamps,
})

export const events = pgTable("events", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  startAt: text("start_at").notNull(),
  endAt: text("end_at").notNull(),
  allDay: boolean("all_day").notNull().default(false),
  color: text("color").notNull().default("#3b82f6"),
  ...timestamps,
})

export const timeLogs = pgTable("time_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  caseId: uuid("case_id").references(() => cases.id, {
    onDelete: "set null",
  }),
  taskId: uuid("task_id").references(() => tasks.id, {
    onDelete: "set null",
  }),
  description: text("description").notNull(),
  startedAt: text("started_at").notNull(),
  endedAt: text("ended_at").notNull(),
  durationMinutes: integer("duration_minutes"),
  ...timestamps,
})

export const portfolioItems = pgTable("portfolio_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  adminId: uuid("admin_id")
    .notNull()
    .references(() => adminProfiles.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  mediaUrl: text("media_url").notNull(),
  mediaType: text("media_type").notNull(),
  tags: text("tags").array().notNull().default([]),
  ...timestamps,
})

export const tickets = pgTable("tickets", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  subject: text("subject").notNull(),
  category: text("category").notNull(),
  priority: text("priority").notNull().default("medium"),
  status: text("status").notNull().default("open"),
  ...timestamps,
})

export const ticketMessages = pgTable("ticket_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  ticketId: uuid("ticket_id")
    .notNull()
    .references(() => tickets.id, { onDelete: "cascade" }),
  senderId: uuid("sender_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  ...timestamps,
})

export const stories = pgTable("stories", {
  id: uuid("id").primaryKey().defaultRandom(),
  authorId: uuid("author_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  coverUrl: text("cover_url"),
  status: text("status").notNull().default("draft"),
  views: integer("views").notNull().default(0),
  ...timestamps,
})

export const blogs = pgTable("blogs", {
  id: uuid("id").primaryKey().defaultRandom(),
  authorId: uuid("author_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  coverUrl: text("cover_url"),
  status: text("status").notNull().default("draft"),
  publishedAt: text("published_at"),
  views: integer("views").notNull().default(0),
  ...timestamps,
})

export const comments = pgTable(
  "comments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    postId: uuid("post_id").notNull(),
    postType: text("post_type").notNull(),
    authorId: uuid("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    parentId: uuid("parent_id"),
    body: text("body").notNull(),
    ...timestamps,
  },
  (t) => [uniqueIndex("comments_post_author").on(t.postId, t.authorId)],
)

export const aiConversations = pgTable("ai_conversations", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  model: text("model").notNull(),
  ...timestamps,
})

export const aiMessages = pgTable("ai_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  conversationId: uuid("conversation_id")
    .notNull()
    .references(() => aiConversations.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  content: text("content").notNull(),
  ...timestamps,
})

export const affiliateCodes = pgTable("affiliate_codes", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" })
    .unique(),
  code: text("code").notNull().unique(),
  isActive: boolean("is_active").notNull().default(true),
  ...timestamps,
})

export const affiliateCommissions = pgTable("affiliate_commissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  codeId: uuid("code_id")
    .notNull()
    .references(() => affiliateCodes.id, { onDelete: "cascade" }),
  referrerId: uuid("referrer_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  referredId: uuid("referred_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  amountToman: integer("amount_toman").notNull().default(0),
  amountUSD: integer("amount_usd").notNull().default(0),
  status: text("status").notNull().default("pending"),
  paidAt: text("paid_at"),
  ...timestamps,
})

// ─── Catalogs (read-only, seeded) ────────────────────────────────────────────

export const tools = pgTable("tools", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  icon: text("icon").notNull(),
  rating: doublePrecision("rating").notNull().default(0),
  reviews: integer("reviews").notNull().default(0),
  popular: boolean("popular").notNull().default(false),
  priceToman: integer("price_toman").notNull(),
  priceUSD: integer("price_usd").notNull(),
  descEn: text("desc_en").notNull(),
  descFa: text("desc_fa").notNull(),
  active: boolean("active").notNull().default(true),
  ...timestamps,
})

export const editors = pgTable("editors", {
  id: uuid("id").primaryKey().defaultRandom(),
  nameEn: text("name_en").notNull(),
  nameFa: text("name_fa").notNull(),
  photo: text("photo").notNull(),
  specialty: text("specialty").notNull(),
  rating: doublePrecision("rating").notNull().default(0),
  reviews: integer("reviews").notNull().default(0),
  projects: integer("projects").notNull().default(0),
  delivery: text("delivery").notNull(),
  rateToman: integer("rate_toman").notNull(),
  rateUSD: integer("rate_usd").notNull(),
  bioEn: text("bio_en").notNull(),
  bioFa: text("bio_fa").notNull(),
  active: boolean("active").notNull().default(true),
  ...timestamps,
})

export const vibeCoders = pgTable("vibe_coders", {
  id: uuid("id").primaryKey().defaultRandom(),
  nameEn: text("name_en").notNull(),
  nameFa: text("name_fa").notNull(),
  photo: text("photo").notNull(),
  stack: text("stack").notNull(),
  rating: doublePrecision("rating").notNull().default(0),
  reviews: integer("reviews").notNull().default(0),
  projects: integer("projects").notNull().default(0),
  rateToman: integer("rate_toman").notNull(),
  rateUSD: integer("rate_usd").notNull(),
  delivery: text("delivery").notNull(),
  bioEn: text("bio_en").notNull(),
  bioFa: text("bio_fa").notNull(),
  active: boolean("active").notNull().default(true),
  ...timestamps,
})
