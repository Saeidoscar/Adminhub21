import { desc, eq } from "drizzle-orm"
import { db } from "../../db"
import { adminProfiles, portfolioItems, users } from "../../db/schema"
import type {
  CreatePortfolioInput,
  UpdatePortfolioInput,
} from "./portfolio.schemas"

export type PortfolioRow = {
  id: string
  adminId: string
  adminNameEn: string
  adminNameFa: string
  title: string
  description: string
  mediaUrl: string
  mediaType: "image" | "video" | "link"
  tags: string[]
  createdAt: string
}

function toSafe(row: {
  id: string
  adminId: string
  adminNameEn: string
  adminNameFa: string
  title: string
  description: string
  mediaUrl: string
  mediaType: string
  tags: string[] | null
  createdAt: Date
}): PortfolioRow {
  return {
    id: row.id,
    adminId: row.adminId,
    adminNameEn: row.adminNameEn,
    adminNameFa: row.adminNameFa,
    title: row.title,
    description: row.description,
    mediaUrl: row.mediaUrl,
    mediaType: row.mediaType as PortfolioRow["mediaType"],
    tags: row.tags ?? [],
    createdAt: row.createdAt.toISOString(),
  }
}

async function resolveAdminName(
  adminId: string,
): Promise<{ nameEn: string; nameFa: string }> {
  const [admin] = await db
    .select({
      nameEn: users.nameEn,
      nameFa: users.nameFa,
    })
    .from(adminProfiles)
    .innerJoin(users, eq(users.id, adminProfiles.userId))
    .where(eq(adminProfiles.id, adminId))
    .limit(1)

  return {
    nameEn: admin?.nameEn ?? "",
    nameFa: admin?.nameFa ?? "",
  }
}

export async function createPortfolio(
  adminId: string,
  data: CreatePortfolioInput,
): Promise<PortfolioRow> {
  const [row] = await db
    .insert(portfolioItems)
    .values({
      adminId,
      title: data.title,
      description: data.description,
      mediaUrl: data.mediaUrl,
      mediaType: data.mediaType,
      tags: data.tags,
    })
    .returning()

  if (!row) {
    throw new Error("Failed to create portfolio item")
  }

  const admin = await resolveAdminName(row.adminId)
  return toSafe({
    ...row,
    adminNameEn: admin.nameEn,
    adminNameFa: admin.nameFa,
  })
}

export async function listPortfolioForAdmin(
  adminId: string,
): Promise<PortfolioRow[]> {
  const rows = await db
    .select({
      id: portfolioItems.id,
      adminId: portfolioItems.adminId,
      adminNameEn: users.nameEn,
      adminNameFa: users.nameFa,
      title: portfolioItems.title,
      description: portfolioItems.description,
      mediaUrl: portfolioItems.mediaUrl,
      mediaType: portfolioItems.mediaType,
      tags: portfolioItems.tags,
      createdAt: portfolioItems.createdAt,
    })
    .from(portfolioItems)
    .innerJoin(adminProfiles, eq(adminProfiles.id, portfolioItems.adminId))
    .innerJoin(users, eq(users.id, adminProfiles.userId))
    .where(eq(portfolioItems.adminId, adminId))
    .orderBy(desc(portfolioItems.createdAt))

  return rows.map(toSafe)
}

export async function getPortfolioById(
  id: string,
): Promise<PortfolioRow | null> {
  const [row] = await db
    .select({
      id: portfolioItems.id,
      adminId: portfolioItems.adminId,
      adminNameEn: users.nameEn,
      adminNameFa: users.nameFa,
      title: portfolioItems.title,
      description: portfolioItems.description,
      mediaUrl: portfolioItems.mediaUrl,
      mediaType: portfolioItems.mediaType,
      tags: portfolioItems.tags,
      createdAt: portfolioItems.createdAt,
    })
    .from(portfolioItems)
    .innerJoin(adminProfiles, eq(adminProfiles.id, portfolioItems.adminId))
    .innerJoin(users, eq(users.id, adminProfiles.userId))
    .where(eq(portfolioItems.id, id))
    .limit(1)

  if (!row) return null
  return toSafe(row)
}

export async function updatePortfolio(
  id: string,
  data: UpdatePortfolioInput,
): Promise<PortfolioRow> {
  const [row] = await db
    .update(portfolioItems)
    .set({
      ...data,
    })
    .where(eq(portfolioItems.id, id))
    .returning()

  if (!row) {
    throw new Error("Portfolio item not found")
  }

  const admin = await resolveAdminName(row.adminId)
  return toSafe({
    ...row,
    adminNameEn: admin.nameEn,
    adminNameFa: admin.nameFa,
  })
}

export async function deletePortfolio(id: string): Promise<void> {
  await db.delete(portfolioItems).where(eq(portfolioItems.id, id))
}
