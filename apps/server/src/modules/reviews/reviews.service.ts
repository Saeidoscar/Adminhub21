import { and, desc, eq, sql } from "drizzle-orm"
import { db } from "../../db"
import { adminProfiles, reviews, users } from "../../db/schema"
import type { CreateReviewInput, ListReviewsQuery } from "./reviews.schemas"

export type ReviewRow = {
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

function toSafe(row: {
  id: string
  adminId: string
  adminNameEn: string
  adminNameFa: string
  employerId: string
  employerName: string
  contractId: string | null
  rating: number
  comment: string | null
  createdAt: Date
}): ReviewRow {
  return {
    id: row.id,
    adminId: row.adminId,
    adminNameEn: row.adminNameEn,
    adminNameFa: row.adminNameFa,
    employerId: row.employerId,
    employerName: row.employerName,
    contractId: row.contractId,
    rating: row.rating,
    comment: row.comment,
    createdAt: row.createdAt.toISOString(),
  }
}

export async function createReview(
  employerId: string,
  data: CreateReviewInput,
): Promise<ReviewRow> {
  const [row] = await db
    .insert(reviews)
    .values({
      employerId,
      adminId: data.adminId,
      contractId: data.contractId,
      rating: data.rating,
      comment: data.comment,
    })
    .returning()

  if (!row) {
    throw new Error("Failed to create review")
  }

  const admin = await db
    .select({
      nameEn: users.nameEn,
      nameFa: users.nameFa,
    })
    .from(adminProfiles)
    .innerJoin(users, eq(users.id, adminProfiles.userId))
    .where(eq(adminProfiles.id, data.adminId))
    .limit(1)

  const [employer] = await db
    .select({ nameFa: users.nameFa })
    .from(users)
    .where(eq(users.id, employerId))
    .limit(1)

  return toSafe({
    ...row,
    adminNameEn: admin[0]?.nameEn ?? "",
    adminNameFa: admin[0]?.nameFa ?? "",
    employerName: employer?.nameFa || "",
  })
}

export async function listReviews(
  query: ListReviewsQuery,
): Promise<ReviewRow[]> {
  const conditions = []

  if (query.adminId) {
    conditions.push(eq(reviews.adminId, query.adminId))
  }

  if (query.employerId) {
    conditions.push(eq(reviews.employerId, query.employerId))
  }

  const rows = await db
    .select({
      id: reviews.id,
      adminId: reviews.adminId,
      adminNameEn: users.nameEn,
      adminNameFa: users.nameFa,
      employerId: reviews.employerId,
      contractId: reviews.contractId,
      rating: reviews.rating,
      comment: reviews.comment,
      createdAt: reviews.createdAt,
    })
    .from(reviews)
    .innerJoin(adminProfiles, eq(adminProfiles.id, reviews.adminId))
    .innerJoin(users, eq(users.id, adminProfiles.userId))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(reviews.createdAt))

  const employerIds = Array.from(new Set(rows.map((r) => r.employerId)))

  const employers = await db
    .select({ id: users.id, nameFa: users.nameFa })
    .from(users)
    .where(sql`${users.id} IN ${employerIds}`)

  const employerMap = new Map(employers.map((e) => [e.id, e.nameFa]))

  return rows.map((row) =>
    toSafe({
      ...row,
      employerName: employerMap.get(row.employerId) || "",
    }),
  )
}

export async function getReviewById(id: string): Promise<ReviewRow | null> {
  const [row] = await db
    .select({
      id: reviews.id,
      adminId: reviews.adminId,
      adminNameEn: users.nameEn,
      adminNameFa: users.nameFa,
      employerId: reviews.employerId,
      contractId: reviews.contractId,
      rating: reviews.rating,
      comment: reviews.comment,
      createdAt: reviews.createdAt,
    })
    .from(reviews)
    .innerJoin(adminProfiles, eq(adminProfiles.id, reviews.adminId))
    .innerJoin(users, eq(users.id, adminProfiles.userId))
    .where(eq(reviews.id, id))
    .limit(1)

  if (!row) return null

  const [employer] = await db
    .select({ nameFa: users.nameFa })
    .from(users)
    .where(eq(users.id, row.employerId))
    .limit(1)

  return toSafe({
    ...row,
    employerName: employer?.nameFa || "",
  })
}
