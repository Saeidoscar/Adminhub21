import { and, desc, eq } from "drizzle-orm"
import { db } from "../../db"
import { adminProfiles, customOffers, packages, users } from "../../db/schema"
import type { CreateOfferInput } from "./offers.schemas"

export type OfferRow = {
  id: string
  packageId: string | null
  adminId: string
  adminNameEn: string
  adminNameFa: string
  adminPhoto: string
  employerId: string
  employerName: string
  name: string
  description: string
  platforms: string[]
  platformConfigs: unknown[]
  proposedPriceToman: number | null
  proposedPriceUSD: number | null
  billingCycle: "monthly" | "project" | "hourly"
  deliveryTime: string | null
  startDate: string | null
  endDate: string | null
  message: string | null
  createdAt: string
  updatedAt: string
}

function toSafe(row: {
  id: string
  packageId: string | null
  adminId: string
  adminNameEn: string
  adminNameFa: string
  adminPhoto: string | null
  employerId: string
  employerName: string
  name: string
  description: string
  platforms: string[] | null
  platformConfigs: unknown[] | null
  proposedPriceToman: number | null
  proposedPriceUSD: number | null
  billingCycle: string
  deliveryTime: string | null
  startDate: string | null
  endDate: string | null
  message: string | null
  createdAt: Date
  updatedAt: Date
}): OfferRow {
  return {
    id: row.id,
    packageId: row.packageId,
    adminId: row.adminId,
    adminNameEn: row.adminNameEn,
    adminNameFa: row.adminNameFa,
    adminPhoto: row.adminPhoto ?? "",
    employerId: row.employerId,
    employerName: row.employerName,
    name: row.name,
    description: row.description,
    platforms: row.platforms ?? [],
    platformConfigs: row.platformConfigs ?? [],
    proposedPriceToman: row.proposedPriceToman,
    proposedPriceUSD: row.proposedPriceUSD,
    billingCycle: row.billingCycle as OfferRow["billingCycle"],
    deliveryTime: row.deliveryTime,
    startDate: row.startDate,
    endDate: row.endDate,
    message: row.message,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

async function resolveAdminName(adminId: string): Promise<{ nameEn: string; nameFa: string; photo: string | null }> {
  const [admin] = await db
    .select({
      nameEn: users.nameEn,
      nameFa: users.nameFa,
      photo: adminProfiles.photo,
    })
    .from(adminProfiles)
    .innerJoin(users, eq(users.id, adminProfiles.userId))
    .where(eq(adminProfiles.id, adminId))
    .limit(1)

  return {
    nameEn: admin?.nameEn ?? "",
    nameFa: admin?.nameFa ?? "",
    photo: admin?.photo ?? null,
  }
}

export async function createOffer(employerId: string, employerName: string, data: CreateOfferInput): Promise<OfferRow> {
  let adminId = data.adminId
  if (!adminId && data.packageId) {
    const [pkg] = await db
      .select({ adminId: packages.adminId })
      .from(packages)
      .where(eq(packages.id, data.packageId))
      .limit(1)
    if (!pkg) {
      throw new Error("Package not found")
    }
    adminId = pkg.adminId
  }

  if (!adminId) {
    throw new Error("adminId or packageId is required")
  }

  const [row] = await db
    .insert(customOffers)
    .values({
      ...data,
      adminId,
      employerId,
      employerName,
    })
    .returning()

  if (!row) {
    throw new Error("Failed to create offer")
  }

  const admin = await resolveAdminName(adminId)
  return toSafe({
    ...row,
    adminNameEn: admin.nameEn,
    adminNameFa: admin.nameFa,
    adminPhoto: admin.photo,
  })
}

export async function listOffersForUser(employerId: string): Promise<OfferRow[]> {
  const rows = await db
    .select({
      id: customOffers.id,
      packageId: customOffers.packageId,
      adminId: customOffers.adminId,
      adminNameEn: users.nameEn,
      adminNameFa: users.nameFa,
      adminPhoto: adminProfiles.photo,
      employerId: customOffers.employerId,
      employerName: customOffers.employerName,
      name: customOffers.name,
      description: customOffers.description,
      platforms: customOffers.platforms,
      platformConfigs: customOffers.platformConfigs,
      proposedPriceToman: customOffers.proposedPriceToman,
      proposedPriceUSD: customOffers.proposedPriceUSD,
      billingCycle: customOffers.billingCycle,
      deliveryTime: customOffers.deliveryTime,
      startDate: customOffers.startDate,
      endDate: customOffers.endDate,
      message: customOffers.message,
      createdAt: customOffers.createdAt,
      updatedAt: customOffers.updatedAt,
    })
    .from(customOffers)
    .innerJoin(adminProfiles, eq(adminProfiles.id, customOffers.adminId))
    .innerJoin(users, eq(users.id, adminProfiles.userId))
    .where(eq(customOffers.employerId, employerId))
    .orderBy(desc(customOffers.createdAt))

  return rows.map(toSafe)
}

export async function listOffersForAdmin(adminId: string): Promise<OfferRow[]> {
  const rows = await db
    .select({
      id: customOffers.id,
      packageId: customOffers.packageId,
      adminId: customOffers.adminId,
      adminNameEn: users.nameEn,
      adminNameFa: users.nameFa,
      adminPhoto: adminProfiles.photo,
      employerId: customOffers.employerId,
      employerName: customOffers.employerName,
      name: customOffers.name,
      description: customOffers.description,
      platforms: customOffers.platforms,
      platformConfigs: customOffers.platformConfigs,
      proposedPriceToman: customOffers.proposedPriceToman,
      proposedPriceUSD: customOffers.proposedPriceUSD,
      billingCycle: customOffers.billingCycle,
      deliveryTime: customOffers.deliveryTime,
      startDate: customOffers.startDate,
      endDate: customOffers.endDate,
      message: customOffers.message,
      createdAt: customOffers.createdAt,
      updatedAt: customOffers.updatedAt,
    })
    .from(customOffers)
    .innerJoin(adminProfiles, eq(adminProfiles.id, customOffers.adminId))
    .innerJoin(users, eq(users.id, adminProfiles.userId))
    .where(eq(customOffers.adminId, adminId))
    .orderBy(desc(customOffers.createdAt))

  return rows.map(toSafe)
}

export async function getOfferById(id: string, requesterId: string, requesterRole: "employer" | "admin"): Promise<OfferRow | null> {
  const [row] = await db
    .select({
      id: customOffers.id,
      packageId: customOffers.packageId,
      adminId: customOffers.adminId,
      adminNameEn: users.nameEn,
      adminNameFa: users.nameFa,
      adminPhoto: adminProfiles.photo,
      employerId: customOffers.employerId,
      employerName: customOffers.employerName,
      name: customOffers.name,
      description: customOffers.description,
      platforms: customOffers.platforms,
      platformConfigs: customOffers.platformConfigs,
      proposedPriceToman: customOffers.proposedPriceToman,
      proposedPriceUSD: customOffers.proposedPriceUSD,
      billingCycle: customOffers.billingCycle,
      deliveryTime: customOffers.deliveryTime,
      startDate: customOffers.startDate,
      endDate: customOffers.endDate,
      message: customOffers.message,
      createdAt: customOffers.createdAt,
      updatedAt: customOffers.updatedAt,
    })
    .from(customOffers)
    .innerJoin(adminProfiles, eq(adminProfiles.id, customOffers.adminId))
    .innerJoin(users, eq(users.id, adminProfiles.userId))
    .where(eq(customOffers.id, id))
    .limit(1)

  if (!row) return null

  if (requesterRole === "employer" && row.employerId !== requesterId) {
    return null
  }
  if (requesterRole === "admin") {
    const [adminProfile] = await db
      .select({ userId: adminProfiles.userId })
      .from(adminProfiles)
      .where(eq(adminProfiles.id, row.adminId))
      .limit(1)
    if (!adminProfile || adminProfile.userId !== requesterId) {
      return null
    }
  }

  return toSafe(row)
}
