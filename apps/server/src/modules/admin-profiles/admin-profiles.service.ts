import { and, asc, desc, eq, ilike, sql } from "drizzle-orm"
import { db } from "../../db"
import { adminProfiles, users } from "../../db/schema"
import type {
  ListAdminProfilesQuery,
  UpdateAdminProfileInput,
} from "./admin-profiles.schemas"

export type AdminProfileRow = {
  id: string
  userId: string
  nameEn: string
  nameFa: string
  photo: string
  platforms: string[]
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
  createdAt: string
}

function toSafe(row: {
  id: string
  userId: string
  nameEn: string
  nameFa: string
  photo: string | null
  platforms: string[] | null
  rating: number | string
  reviews: number
  verified: boolean
  insured: boolean
  monthlyToman: number
  monthlyUSD: number
  bioEn: string | null
  bioFa: string | null
  skillsEn: string[] | null
  skillsFa: string[] | null
  createdAt: Date
}): AdminProfileRow {
  return {
    id: row.id,
    userId: row.userId,
    nameEn: row.nameEn,
    nameFa: row.nameFa,
    photo: row.photo ?? "",
    platforms: row.platforms ?? [],
    rating: Number(row.rating),
    reviews: row.reviews,
    verified: row.verified,
    insured: row.insured,
    monthlyToman: row.monthlyToman,
    monthlyUSD: row.monthlyUSD,
    bioEn: row.bioEn ?? "",
    bioFa: row.bioFa ?? "",
    skillsEn: row.skillsEn ?? [],
    skillsFa: row.skillsFa ?? [],
    createdAt: row.createdAt.toISOString(),
  }
}

export async function listAdminProfiles(
  query: ListAdminProfilesQuery,
): Promise<AdminProfileRow[]> {
  const conditions = []

  if (query.platforms && query.platforms.length > 0) {
    const platformSql = query.platforms
      .map((p) => `'${p.replace(/'/g, "''")}'`)
      .join(",")
    conditions.push(
      sql`${adminProfiles.platforms} && ARRAY[${sql.raw(platformSql)}]`,
    )
  }

  if (query.verified) {
    conditions.push(eq(adminProfiles.verified, query.verified === "true"))
  }

  if (query.search) {
    const term = `%${query.search.replace(/%/g, "\\%")}%`
    conditions.push(
      sql`(${users.nameEn} ILIKE ${term} OR ${users.nameFa} ILIKE ${term} OR ${adminProfiles.bioEn} ILIKE ${term} OR ${adminProfiles.bioFa} ILIKE ${term})`,
    )
  }

  const rows = await db
    .select({
      id: adminProfiles.id,
      userId: adminProfiles.userId,
      nameEn: users.nameEn,
      nameFa: users.nameFa,
      photo: adminProfiles.photo,
      platforms: adminProfiles.platforms,
      rating: adminProfiles.rating,
      reviews: adminProfiles.reviews,
      verified: adminProfiles.verified,
      insured: adminProfiles.insured,
      monthlyToman: adminProfiles.monthlyToman,
      monthlyUSD: adminProfiles.monthlyUSD,
      bioEn: adminProfiles.bioEn,
      bioFa: adminProfiles.bioFa,
      skillsEn: adminProfiles.skillsEn,
      skillsFa: adminProfiles.skillsFa,
      createdAt: adminProfiles.createdAt,
    })
    .from(adminProfiles)
    .innerJoin(users, eq(users.id, adminProfiles.userId))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(adminProfiles.rating), asc(adminProfiles.reviews))

  return rows.map(toSafe)
}

export async function getAdminProfileById(
  id: string,
): Promise<AdminProfileRow | null> {
  const [row] = await db
    .select({
      id: adminProfiles.id,
      userId: adminProfiles.userId,
      nameEn: users.nameEn,
      nameFa: users.nameFa,
      photo: adminProfiles.photo,
      platforms: adminProfiles.platforms,
      rating: adminProfiles.rating,
      reviews: adminProfiles.reviews,
      verified: adminProfiles.verified,
      insured: adminProfiles.insured,
      monthlyToman: adminProfiles.monthlyToman,
      monthlyUSD: adminProfiles.monthlyUSD,
      bioEn: adminProfiles.bioEn,
      bioFa: adminProfiles.bioFa,
      skillsEn: adminProfiles.skillsEn,
      skillsFa: adminProfiles.skillsFa,
      createdAt: adminProfiles.createdAt,
    })
    .from(adminProfiles)
    .innerJoin(users, eq(users.id, adminProfiles.userId))
    .where(eq(adminProfiles.id, id))
    .limit(1)

  if (!row) return null
  return toSafe(row)
}

export async function updateAdminProfile(
  userId: string,
  data: UpdateAdminProfileInput,
): Promise<AdminProfileRow> {
  const [row] = await db
    .update(adminProfiles)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(adminProfiles.userId, userId))
    .returning()

  if (!row) {
    throw new Error("Admin profile not found")
  }

  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)
  if (!user[0]) {
    throw new Error("User not found")
  }

  return toSafe({
    ...row,
    nameEn: user[0].nameEn,
    nameFa: user[0].nameFa,
  })
}
