import { and, asc, desc, eq, sql } from "drizzle-orm"
import { db } from "../../db"
import { adminProfiles, packages, users } from "../../db/schema"
import type {
  ListPackagesQuery,
  CreatePackageInput,
  UpdatePackageInput,
} from "./packages.schemas"

export type PackageRow = {
  id: string
  adminId: string
  adminNameEn: string
  adminNameFa: string
  adminPhoto: string
  name: string
  description: string
  type: "platform" | "bundle"
  platforms: string[]
  platformConfigs: unknown[]
  priceToman: number
  priceUSD: number
  billingCycle: "monthly" | "project" | "hourly"
  deliveryTime: string
  featured: boolean
  active: boolean
  createdAt: string
  updatedAt: string
}

function toSafe(row: {
  id: string
  adminId: string
  adminNameEn: string
  adminNameFa: string
  adminPhoto: string | null
  name: string
  description: string
  type: string
  platforms: string[] | null
  platformConfigs: unknown[] | null
  priceToman: number
  priceUSD: number
  billingCycle: string
  deliveryTime: string
  featured: boolean
  active: boolean
  createdAt: Date
  updatedAt: Date
}): PackageRow {
  return {
    id: row.id,
    adminId: row.adminId,
    adminNameEn: row.adminNameEn,
    adminNameFa: row.adminNameFa,
    adminPhoto: row.adminPhoto ?? "",
    name: row.name,
    description: row.description,
    type: row.type as PackageRow["type"],
    platforms: row.platforms ?? [],
    platformConfigs: row.platformConfigs ?? [],
    priceToman: row.priceToman,
    priceUSD: row.priceUSD,
    billingCycle: row.billingCycle as PackageRow["billingCycle"],
    deliveryTime: row.deliveryTime,
    featured: row.featured,
    active: row.active,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

export async function listPackages(
  query: ListPackagesQuery,
): Promise<PackageRow[]> {
  const conditions = []

  if (query.platforms && query.platforms.length > 0) {
    const platformSql = query.platforms
      .map((p) => `'${p.replace(/'/g, "''")}'`)
      .join(",")
    conditions.push(
      sql`${packages.platforms} && ARRAY[${sql.raw(platformSql)}]`,
    )
  }

  if (query.type) {
    conditions.push(eq(packages.type, query.type))
  }

  if (query.featured) {
    conditions.push(eq(packages.featured, query.featured === "true"))
  }

  if (query.billingCycle) {
    conditions.push(eq(packages.billingCycle, query.billingCycle))
  }

  if (query.search) {
    const term = `%${query.search.replace(/%/g, "\\%")}%`
    conditions.push(
      sql`(${packages.name} ILIKE ${term} OR ${packages.description} ILIKE ${term})`,
    )
  }

  const rows = await db
    .select({
      id: packages.id,
      adminId: packages.adminId,
      adminNameEn: users.nameEn,
      adminNameFa: users.nameFa,
      adminPhoto: adminProfiles.photo,
      name: packages.name,
      description: packages.description,
      type: packages.type,
      platforms: packages.platforms,
      platformConfigs: packages.platformConfigs,
      priceToman: packages.priceToman,
      priceUSD: packages.priceUSD,
      billingCycle: packages.billingCycle,
      deliveryTime: packages.deliveryTime,
      featured: packages.featured,
      active: packages.active,
      createdAt: packages.createdAt,
      updatedAt: packages.updatedAt,
    })
    .from(packages)
    .innerJoin(adminProfiles, eq(adminProfiles.id, packages.adminId))
    .innerJoin(users, eq(users.id, adminProfiles.userId))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(packages.featured), desc(packages.createdAt))

  return rows.map(toSafe)
}

export async function getPackageById(id: string): Promise<PackageRow | null> {
  const [row] = await db
    .select({
      id: packages.id,
      adminId: packages.adminId,
      adminNameEn: users.nameEn,
      adminNameFa: users.nameFa,
      adminPhoto: adminProfiles.photo,
      name: packages.name,
      description: packages.description,
      type: packages.type,
      platforms: packages.platforms,
      platformConfigs: packages.platformConfigs,
      priceToman: packages.priceToman,
      priceUSD: packages.priceUSD,
      billingCycle: packages.billingCycle,
      deliveryTime: packages.deliveryTime,
      featured: packages.featured,
      active: packages.active,
      createdAt: packages.createdAt,
      updatedAt: packages.updatedAt,
    })
    .from(packages)
    .innerJoin(adminProfiles, eq(adminProfiles.id, packages.adminId))
    .innerJoin(users, eq(users.id, adminProfiles.userId))
    .where(eq(packages.id, id))
    .limit(1)

  if (!row) return null
  return toSafe(row)
}

export async function createPackage(
  adminId: string,
  data: CreatePackageInput,
): Promise<PackageRow> {
  const [row] = await db
    .insert(packages)
    .values({
      adminId,
      ...data,
    })
    .returning()

  if (!row) {
    throw new Error("Failed to create package")
  }

  const admin = await db
    .select({
      nameEn: users.nameEn,
      nameFa: users.nameFa,
      photo: adminProfiles.photo,
    })
    .from(adminProfiles)
    .innerJoin(users, eq(users.id, adminProfiles.userId))
    .where(eq(adminProfiles.id, adminId))
    .limit(1)

  return toSafe({
    ...row,
    adminNameEn: admin[0]?.nameEn ?? "",
    adminNameFa: admin[0]?.nameFa ?? "",
    adminPhoto: admin[0]?.photo ?? null,
  })
}

export async function updatePackage(
  id: string,
  data: UpdatePackageInput,
): Promise<PackageRow> {
  const [row] = await db
    .update(packages)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(packages.id, id))
    .returning()

  if (!row) {
    throw new Error("Package not found")
  }

  const admin = await db
    .select({
      nameEn: users.nameEn,
      nameFa: users.nameFa,
      photo: adminProfiles.photo,
    })
    .from(adminProfiles)
    .innerJoin(users, eq(users.id, adminProfiles.userId))
    .where(eq(adminProfiles.id, row.adminId))
    .limit(1)

  return toSafe({
    ...row,
    adminNameEn: admin[0]?.nameEn ?? "",
    adminNameFa: admin[0]?.nameFa ?? "",
    adminPhoto: admin[0]?.photo ?? null,
  })
}

export async function deletePackage(id: string): Promise<void> {
  await db.delete(packages).where(eq(packages.id, id))
}
