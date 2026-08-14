import { and, desc, eq, sql } from "drizzle-orm"
import { db } from "../../db"
import { adminProfiles, contracts, customOffers, users } from "../../db/schema"
import type {
  CreateContractInput,
  UpdateContractStatusInput,
} from "./contracts.schemas"

export type ContractRow = {
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
  createdAt: string
  updatedAt: string
}

function toSafe(row: {
  id: string
  code: string
  adminId: string
  adminNameEn: string
  adminNameFa: string
  adminPhoto: string | null
  employerId: string
  employerName: string
  platform: string
  status: string
  amountToman: number
  amountUSD: number
  hasInsurance: boolean
  hasSubstitute: boolean
  termClause: string | null
  substituteClause: string | null
  startDate: string | null
  endDate: string | null
  createdAt: Date
  updatedAt: Date
}): ContractRow {
  return {
    id: row.id,
    code: row.code,
    adminId: row.adminId,
    adminNameEn: row.adminNameEn,
    adminNameFa: row.adminNameFa,
    adminPhoto: row.adminPhoto ?? "",
    employerId: row.employerId,
    employerName: row.employerName,
    platform: row.platform,
    status: row.status as ContractRow["status"],
    amountToman: row.amountToman,
    amountUSD: row.amountUSD,
    hasInsurance: row.hasInsurance,
    hasSubstitute: row.hasSubstitute,
    termClause: row.termClause,
    substituteClause: row.substituteClause,
    startDate: row.startDate,
    endDate: row.endDate,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

async function resolveAdminName(
  adminId: string,
): Promise<{ nameEn: string; nameFa: string; photo: string | null }> {
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

export async function createContract(
  requesterId: string,
  requesterRole: string,
  data: CreateContractInput,
): Promise<ContractRow> {
  let employerId: string
  let adminId: string
  let employerName: string

  if (data.offerId) {
    const [offer] = await db
      .select({
        employerId: customOffers.employerId,
        adminId: customOffers.adminId,
        employerName: customOffers.employerName,
      })
      .from(customOffers)
      .where(eq(customOffers.id, data.offerId))
      .limit(1)

    if (!offer) {
      throw new Error("Offer not found")
    }

    if (requesterRole === "employer" && offer.employerId !== requesterId) {
      throw new Error("Forbidden")
    }
    if (requesterRole === "admin") {
      const [adminProfile] = await db
        .select({ userId: adminProfiles.userId })
        .from(adminProfiles)
        .where(eq(adminProfiles.id, offer.adminId))
        .limit(1)
      if (!adminProfile || adminProfile.userId !== requesterId) {
        throw new Error("Forbidden")
      }
    }

    employerId = offer.employerId
    adminId = offer.adminId
    employerName = offer.employerName
  } else if (data.adminId) {
    if (requesterRole !== "employer") {
      throw new Error("Only employer can create contract without offerId")
    }
    employerId = requesterId
    adminId = data.adminId

    const [employer] = await db
      .select({ nameEn: users.nameEn, nameFa: users.nameFa })
      .from(users)
      .where(eq(users.id, employerId))
      .limit(1)
    if (!employer) {
      throw new Error("Employer not found")
    }
    employerName = employer.nameFa || employer.nameEn
  } else {
    throw new Error("offerId or adminId is required")
  }

  const code = `CNT-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`

  const [row] = await db
    .insert(contracts)
    .values({
      code,
      employerId,
      adminId,
      platform: data.platform,
      amountToman: data.amountToman,
      amountUSD: data.amountUSD,
      hasInsurance: data.hasInsurance,
      hasSubstitute: data.hasSubstitute,
      termClause: data.termClause,
      substituteClause: data.substituteClause,
      startDate: data.startDate,
      endDate: data.endDate,
      status: "pending",
    })
    .returning()

  if (!row) {
    throw new Error("Failed to create contract")
  }

  const admin = await resolveAdminName(adminId)
  const [employer] = await db
    .select({ nameFa: users.nameFa })
    .from(users)
    .where(eq(users.id, employerId))
    .limit(1)
  return toSafe({
    ...row,
    adminNameEn: admin.nameEn,
    adminNameFa: admin.nameFa,
    adminPhoto: admin.photo,
    employerName: employer?.nameFa || "",
  })
}

export async function listContractsForUser(
  userId: string,
  role: string,
): Promise<ContractRow[]> {
  let whereClause
  if (role === "employer") {
    whereClause = eq(contracts.employerId, userId)
  } else {
    const [adminProfile] = await db
      .select({ id: adminProfiles.id })
      .from(adminProfiles)
      .where(eq(adminProfiles.userId, userId))
      .limit(1)
    if (!adminProfile) {
      return []
    }
    whereClause = eq(contracts.adminId, adminProfile.id)
  }

  const rows = await db
    .select({
      id: contracts.id,
      code: contracts.code,
      adminId: contracts.adminId,
      adminNameEn: users.nameEn,
      adminNameFa: users.nameFa,
      adminPhoto: adminProfiles.photo,
      employerId: contracts.employerId,
      employerName: users.nameFa,
      platform: contracts.platform,
      status: contracts.status,
      amountToman: contracts.amountToman,
      amountUSD: contracts.amountUSD,
      hasInsurance: contracts.hasInsurance,
      hasSubstitute: contracts.hasSubstitute,
      termClause: contracts.termClause,
      substituteClause: contracts.substituteClause,
      startDate: contracts.startDate,
      endDate: contracts.endDate,
      createdAt: contracts.createdAt,
      updatedAt: contracts.updatedAt,
    })
    .from(contracts)
    .innerJoin(adminProfiles, eq(adminProfiles.id, contracts.adminId))
    .innerJoin(users, eq(users.id, adminProfiles.userId))
    .where(whereClause)
    .orderBy(desc(contracts.createdAt))

  return rows.map((row) =>
    toSafe({
      ...row,
      employerName: row.employerName || row.adminNameEn,
    }),
  )
}

export async function getContractById(
  id: string,
): Promise<ContractRow | null> {
  const [row] = await db
    .select({
      id: contracts.id,
      code: contracts.code,
      adminId: contracts.adminId,
      adminNameEn: users.nameEn,
      adminNameFa: users.nameFa,
      adminPhoto: adminProfiles.photo,
      employerId: contracts.employerId,
      employerName: users.nameFa,
      platform: contracts.platform,
      status: contracts.status,
      amountToman: contracts.amountToman,
      amountUSD: contracts.amountUSD,
      hasInsurance: contracts.hasInsurance,
      hasSubstitute: contracts.hasSubstitute,
      termClause: contracts.termClause,
      substituteClause: contracts.substituteClause,
      startDate: contracts.startDate,
      endDate: contracts.endDate,
      createdAt: contracts.createdAt,
      updatedAt: contracts.updatedAt,
    })
    .from(contracts)
    .innerJoin(adminProfiles, eq(adminProfiles.id, contracts.adminId))
    .innerJoin(users, eq(users.id, adminProfiles.userId))
    .where(eq(contracts.id, id))
    .limit(1)

  if (!row) return null
  return toSafe({
    ...row,
    employerName: row.employerName || row.adminNameEn,
  })
}

export async function updateContractStatus(
  id: string,
  data: UpdateContractStatusInput,
): Promise<ContractRow> {
  const [existing] = await db
    .select()
    .from(contracts)
    .where(eq(contracts.id, id))
    .limit(1)

  if (!existing) {
    throw new Error("Contract not found")
  }

  const [row] = await db
    .update(contracts)
    .set({
      status: data.status,
      updatedAt: new Date(),
    })
    .where(eq(contracts.id, id))
    .returning()

  if (!row) {
    throw new Error("Contract not found")
  }

  const admin = await resolveAdminName(row.adminId)
  const [employer] = await db
    .select({ nameFa: users.nameFa })
    .from(users)
    .where(eq(users.id, row.employerId))
    .limit(1)

  return toSafe({
    ...row,
    adminNameEn: admin.nameEn,
    adminNameFa: admin.nameFa,
    adminPhoto: admin.photo,
    employerName: employer?.nameFa || "",
  })
}
