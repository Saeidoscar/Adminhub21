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

export const roleEnum = pgEnum("role", ["employer", "admin"])

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: roleEnum("role").notNull().default("employer"),
  nameEn: text("name_en").notNull(),
  nameFa: text("name_fa").notNull(),
  phone: text("phone"),
  photo: text("photo"),
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
