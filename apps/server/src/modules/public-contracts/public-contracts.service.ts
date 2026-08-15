import { eq } from "drizzle-orm"
import { db } from "../../db"
import { adminProfiles, contracts, users } from "../../db/schema"
import type { GetPublicContractInput } from "./public-contracts.schemas"

export type PublicContractRow = {
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
}): PublicContractRow {
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
    status: row.status as PublicContractRow["status"],
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

export async function getPublicContractByCode(
  input: GetPublicContractInput,
): Promise<PublicContractRow | null> {
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
    .where(eq(contracts.code, input.code))
    .limit(1)

  if (!row) return null

  return toSafe({
    ...row,
    employerName: row.employerName || row.adminNameEn,
  })
}
