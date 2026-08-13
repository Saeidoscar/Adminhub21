import { and, desc, eq } from "drizzle-orm"
import { db } from "../../db"
import { adminProfiles, favorites, users } from "../../db/schema"

export type FavoriteRow = {
  adminId: string
  adminNameEn: string
  adminNameFa: string
  adminPhoto: string
  adminRating: number
  adminReviews: number
  adminVerified: boolean
  adminInsured: boolean
  platforms: string[]
  createdAt: string
}

function toSafe(row: {
  adminId: string
  adminNameEn: string
  adminNameFa: string
  adminPhoto: string | null
  adminRating: number
  adminReviews: number
  adminVerified: boolean
  adminInsured: boolean
  platforms: string[] | null
  createdAt: Date
}): FavoriteRow {
  return {
    adminId: row.adminId,
    adminNameEn: row.adminNameEn,
    adminNameFa: row.adminNameFa,
    adminPhoto: row.adminPhoto ?? "",
    adminRating: Number(row.adminRating),
    adminReviews: row.adminReviews,
    adminVerified: row.adminVerified,
    adminInsured: row.adminInsured,
    platforms: row.platforms ?? [],
    createdAt: row.createdAt.toISOString(),
  }
}

export async function listFavorites(userId: string): Promise<FavoriteRow[]> {
  const rows = await db
    .select({
      adminId: adminProfiles.id,
      adminNameEn: users.nameEn,
      adminNameFa: users.nameFa,
      adminPhoto: adminProfiles.photo,
      adminRating: adminProfiles.rating,
      adminReviews: adminProfiles.reviews,
      adminVerified: adminProfiles.verified,
      adminInsured: adminProfiles.insured,
      platforms: adminProfiles.platforms,
      createdAt: favorites.createdAt,
    })
    .from(favorites)
    .innerJoin(adminProfiles, eq(adminProfiles.id, favorites.adminId))
    .innerJoin(users, eq(users.id, adminProfiles.userId))
    .where(eq(favorites.userId, userId))
    .orderBy(desc(favorites.createdAt))

  return rows.map(toSafe)
}

export async function addFavorite(userId: string, adminId: string): Promise<FavoriteRow> {
  const [existing] = await db
    .select({
      adminId: adminProfiles.id,
      adminNameEn: users.nameEn,
      adminNameFa: users.nameFa,
      adminPhoto: adminProfiles.photo,
      adminRating: adminProfiles.rating,
      adminReviews: adminProfiles.reviews,
      adminVerified: adminProfiles.verified,
      adminInsured: adminProfiles.insured,
      platforms: adminProfiles.platforms,
      createdAt: favorites.createdAt,
    })
    .from(favorites)
    .innerJoin(adminProfiles, eq(adminProfiles.id, favorites.adminId))
    .innerJoin(users, eq(users.id, adminProfiles.userId))
    .where(and(eq(favorites.userId, userId), eq(favorites.adminId, adminId)))
    .limit(1)

  if (existing) {
    return toSafe(existing)
  }

  const [row] = await db
    .insert(favorites)
    .values({ userId, adminId })
    .onConflictDoNothing()
    .returning({ createdAt: favorites.createdAt, adminId: favorites.adminId })

  if (!row) {
    const fallback = await db
      .select({
        adminId: adminProfiles.id,
        adminNameEn: users.nameEn,
        adminNameFa: users.nameFa,
        adminPhoto: adminProfiles.photo,
        adminRating: adminProfiles.rating,
        adminReviews: adminProfiles.reviews,
        adminVerified: adminProfiles.verified,
        adminInsured: adminProfiles.insured,
        platforms: adminProfiles.platforms,
        createdAt: favorites.createdAt,
      })
      .from(favorites)
      .innerJoin(adminProfiles, eq(adminProfiles.id, favorites.adminId))
      .innerJoin(users, eq(users.id, adminProfiles.userId))
      .where(and(eq(favorites.userId, userId), eq(favorites.adminId, adminId)))
      .limit(1)

    if (!fallback[0]) {
      throw new Error("Failed to add favorite")
    }

    return toSafe(fallback[0])
  }

  const [admin] = await db
    .select({
      adminId: adminProfiles.id,
      adminNameEn: users.nameEn,
      adminNameFa: users.nameFa,
      adminPhoto: adminProfiles.photo,
      adminRating: adminProfiles.rating,
      adminReviews: adminProfiles.reviews,
      adminVerified: adminProfiles.verified,
      adminInsured: adminProfiles.insured,
      platforms: adminProfiles.platforms,
    })
    .from(adminProfiles)
    .innerJoin(users, eq(users.id, adminProfiles.userId))
    .where(eq(adminProfiles.id, adminId))
    .limit(1)

  return toSafe({
    adminId: admin?.adminId ?? row.adminId,
    adminNameEn: admin?.adminNameEn ?? "",
    adminNameFa: admin?.adminNameFa ?? "",
    adminPhoto: admin?.adminPhoto ?? null,
    adminRating: admin?.adminRating ?? 0,
    adminReviews: admin?.adminReviews ?? 0,
    adminVerified: admin?.adminVerified ?? false,
    adminInsured: admin?.adminInsured ?? false,
    platforms: admin?.platforms ?? [],
    createdAt: row.createdAt,
  })
}

export async function removeFavorite(userId: string, adminId: string): Promise<void> {
  await db.delete(favorites).where(and(eq(favorites.userId, userId), eq(favorites.adminId, adminId)))
}
