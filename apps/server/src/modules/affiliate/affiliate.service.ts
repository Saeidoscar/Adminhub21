import { and, desc, eq, sql } from "drizzle-orm"
import { db } from "../../db"
import { affiliateCodes, affiliateCommissions, users } from "../../db/schema"
import type {
  GenerateCodeInput,
  ListCommissionsQuery,
} from "./affiliate.schemas"

export type AffiliateCodeRow = {
  id: string
  userId: string
  userName: string
  userEmail: string
  code: string
  isActive: boolean
  createdAt: string
}

export type AffiliateCommissionRow = {
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

function toSafeCode(
  row: {
    id: string
    userId: string
    code: string
    isActive: boolean
    createdAt: Date
  } & { nameEn: string; nameFa: string; email: string },
): AffiliateCodeRow {
  const userName = row.nameFa || row.nameEn
  return {
    id: row.id,
    userId: row.userId,
    userName,
    userEmail: row.email,
    code: row.code,
    isActive: row.isActive,
    createdAt: row.createdAt.toISOString(),
  }
}

function toSafeCommission(
  row: {
    id: string
    codeId: string
    code: string
    referrerId: string
    referredId: string
    amountToman: number
    amountUSD: number
    status: string
    paidAt: string | null
    createdAt: Date
  } & { referrerName: string; referredName: string },
): AffiliateCommissionRow {
  return {
    id: row.id,
    codeId: row.codeId,
    code: row.code,
    referrerId: row.referrerId,
    referrerName: row.referrerName,
    referredId: row.referredId,
    referredName: row.referredName,
    amountToman: row.amountToman,
    amountUSD: row.amountUSD,
    status: row.status,
    paidAt: row.paidAt,
    createdAt: row.createdAt.toISOString(),
  }
}

export async function getOrCreateAffiliateCode(
  userId: string,
): Promise<AffiliateCodeRow> {
  const [existing] = await db
    .select()
    .from(affiliateCodes)
    .where(eq(affiliateCodes.userId, userId))
    .limit(1)

  if (existing) {
    const user = await db
      .select({
        nameEn: users.nameEn,
        nameFa: users.nameFa,
        email: users.email,
      })
      .from(users)
      .where(eq(users.id, existing.userId))
      .limit(1)

    return toSafeCode({
      ...existing,
      nameEn: user[0]?.nameEn ?? "",
      nameFa: user[0]?.nameFa ?? "",
      email: user[0]?.email ?? "",
    })
  }

  const code = `AFF-${Math.random().toString(36).slice(2, 8).toUpperCase()}`

  const [row] = await db
    .insert(affiliateCodes)
    .values({
      userId,
      code,
    })
    .returning()

  if (!row) {
    throw new Error("Failed to create affiliate code")
  }

  const user = await db
    .select({ nameEn: users.nameEn, nameFa: users.nameFa, email: users.email })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  return toSafeCode({
    ...row,
    nameEn: user[0]?.nameEn ?? "",
    nameFa: user[0]?.nameFa ?? "",
    email: user[0]?.email ?? "",
  })
}

export async function getAffiliateCodeByUser(
  userId: string,
): Promise<AffiliateCodeRow | null> {
  const [row] = await db
    .select()
    .from(affiliateCodes)
    .where(eq(affiliateCodes.userId, userId))
    .limit(1)

  if (!row) return null

  const user = await db
    .select({ nameEn: users.nameEn, nameFa: users.nameFa, email: users.email })
    .from(users)
    .where(eq(users.id, row.userId))
    .limit(1)

  return toSafeCode({
    ...row,
    nameEn: user[0]?.nameEn ?? "",
    nameFa: user[0]?.nameFa ?? "",
    email: user[0]?.email ?? "",
  })
}

export async function listCommissionsForUser(
  userId: string,
  query: ListCommissionsQuery,
): Promise<AffiliateCommissionRow[]> {
  const [code] = await db
    .select()
    .from(affiliateCodes)
    .where(eq(affiliateCodes.userId, userId))
    .limit(1)

  if (!code) return []

  const conditions = [eq(affiliateCommissions.codeId, code.id)]

  if (query.status) {
    conditions.push(eq(affiliateCommissions.status, query.status))
  }

  const rows = await db
    .select({
      id: affiliateCommissions.id,
      codeId: affiliateCommissions.codeId,
      code: affiliateCodes.code,
      referrerId: affiliateCommissions.referrerId,
      referredId: affiliateCommissions.referredId,
      amountToman: affiliateCommissions.amountToman,
      amountUSD: affiliateCommissions.amountUSD,
      status: affiliateCommissions.status,
      paidAt: affiliateCommissions.paidAt,
      createdAt: affiliateCommissions.createdAt,
    })
    .from(affiliateCommissions)
    .innerJoin(
      affiliateCodes,
      eq(affiliateCodes.id, affiliateCommissions.codeId),
    )
    .where(and(...conditions))
    .orderBy(desc(affiliateCommissions.createdAt))

  const result: AffiliateCommissionRow[] = []

  for (const row of rows) {
    const [referrer] = await db
      .select({ nameEn: users.nameEn, nameFa: users.nameFa })
      .from(users)
      .where(eq(users.id, row.referrerId))
      .limit(1)
    const [referred] = await db
      .select({ nameEn: users.nameEn, nameFa: users.nameFa })
      .from(users)
      .where(eq(users.id, row.referredId))
      .limit(1)

    result.push(
      toSafeCommission({
        ...row,
        referrerName: referrer?.nameFa || referrer?.nameEn || "",
        referredName: referred?.nameFa || referred?.nameEn || "",
      }),
    )
  }

  return result
}

export async function recordCommission(
  codeId: string,
  referrerId: string,
  referredId: string,
  amountToman: number,
  amountUSD: number,
): Promise<AffiliateCommissionRow> {
  const [row] = await db
    .insert(affiliateCommissions)
    .values({
      codeId,
      referrerId,
      referredId,
      amountToman,
      amountUSD,
      status: "pending",
    })
    .returning()

  if (!row) {
    throw new Error("Failed to record commission")
  }

  const [referrer] = await db
    .select({ nameEn: users.nameEn, nameFa: users.nameFa })
    .from(users)
    .where(eq(users.id, referrerId))
    .limit(1)
  const [referred] = await db
    .select({ nameEn: users.nameEn, nameFa: users.nameFa })
    .from(users)
    .where(eq(users.id, referredId))
    .limit(1)

  return toSafeCommission({
    ...row,
    code: "",
    referrerName: referrer?.nameFa || referrer?.nameEn || "",
    referredName: referred?.nameFa || referred?.nameEn || "",
  })
}
