import { and, desc, eq, sql } from "drizzle-orm"
import { db } from "../../db"
import { adminProfiles, cases, users } from "../../db/schema"
import type {
  CreateCaseInput,
  UpdateCaseInput,
  ListCasesQuery,
} from "./cases.schemas"

export type CaseRow = {
  id: string
  adminId: string
  adminNameEn: string
  adminNameFa: string
  employerId: string
  employerName: string
  title: string
  description: string
  priority: "low" | "medium" | "high" | "urgent"
  status: "open" | "in_progress" | "review" | "closed"
  tags: string[]
  createdAt: string
  updatedAt: string
}

function toSafe(row: {
  id: string
  adminId: string
  adminNameEn: string
  adminNameFa: string
  employerId: string
  employerName: string
  title: string
  description: string
  priority: string
  status: string
  tags: string[] | null
  createdAt: Date
  updatedAt: Date
}): CaseRow {
  return {
    id: row.id,
    adminId: row.adminId,
    adminNameEn: row.adminNameEn,
    adminNameFa: row.adminNameFa,
    employerId: row.employerId,
    employerName: row.employerName,
    title: row.title,
    description: row.description,
    priority: row.priority as CaseRow["priority"],
    status: row.status as CaseRow["status"],
    tags: row.tags ?? [],
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
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

export async function createCase(
  adminId: string,
  data: CreateCaseInput,
): Promise<CaseRow> {
  const [adminProfile] = await db
    .select({ id: adminProfiles.id })
    .from(adminProfiles)
    .where(eq(adminProfiles.userId, adminId))
    .limit(1)

  if (!adminProfile) {
    throw new Error("Admin profile not found")
  }

  const [row] = await db
    .insert(cases)
    .values({
      adminId: adminProfile.id,
      employerId: data.employerId,
      title: data.title,
      description: data.description,
      priority: data.priority,
      tags: data.tags,
    })
    .returning()

  if (!row) {
    throw new Error("Failed to create case")
  }

  const admin = await resolveAdminName(row.adminId)
  const [employer] = await db
    .select({ nameFa: users.nameFa, nameEn: users.nameEn })
    .from(users)
    .where(eq(users.id, data.employerId))
    .limit(1)

  return toSafe({
    ...row,
    adminNameEn: admin.nameEn,
    adminNameFa: admin.nameFa,
    employerName: employer?.nameFa || employer?.nameEn || "",
  })
}

export async function listCasesForAdmin(
  adminId: string,
  query: ListCasesQuery,
): Promise<CaseRow[]> {
  const [adminProfile] = await db
    .select({ id: adminProfiles.id })
    .from(adminProfiles)
    .where(eq(adminProfiles.userId, adminId))
    .limit(1)

  const conditions = [eq(cases.adminId, adminProfile?.id ?? "")]

  if (query.status) {
    conditions.push(eq(cases.status, query.status))
  }
  if (query.priority) {
    conditions.push(eq(cases.priority, query.priority))
  }
  if (query.search) {
    const term = `%${query.search.replace(/%/g, "\\%")}%`
    conditions.push(
      sql`(${cases.title} ILIKE ${term} OR ${cases.description} ILIKE ${term})`,
    )
  }

  const rows = await db
    .select({
      id: cases.id,
      adminId: cases.adminId,
      adminNameEn: users.nameEn,
      adminNameFa: users.nameFa,
      employerId: cases.employerId,
      employerName: users.nameFa,
      title: cases.title,
      description: cases.description,
      priority: cases.priority,
      status: cases.status,
      tags: cases.tags,
      createdAt: cases.createdAt,
      updatedAt: cases.updatedAt,
    })
    .from(cases)
    .innerJoin(adminProfiles, eq(adminProfiles.id, cases.adminId))
    .innerJoin(users, eq(users.id, adminProfiles.userId))
    .where(and(...conditions))
    .orderBy(desc(cases.createdAt))

  return rows.map((row) =>
    toSafe({
      ...row,
      employerName: row.employerName || row.adminNameEn,
    }),
  )
}

export async function listCasesForEmployer(
  employerId: string,
  query: ListCasesQuery,
): Promise<CaseRow[]> {
  const conditions = [eq(cases.employerId, employerId)]

  if (query.status) {
    conditions.push(eq(cases.status, query.status))
  }
  if (query.priority) {
    conditions.push(eq(cases.priority, query.priority))
  }
  if (query.search) {
    const term = `%${query.search.replace(/%/g, "\\%")}%`
    conditions.push(
      sql`(${cases.title} ILIKE ${term} OR ${cases.description} ILIKE ${term})`,
    )
  }

  const rows = await db
    .select({
      id: cases.id,
      adminId: cases.adminId,
      adminNameEn: users.nameEn,
      adminNameFa: users.nameFa,
      employerId: cases.employerId,
      employerName: users.nameFa,
      title: cases.title,
      description: cases.description,
      priority: cases.priority,
      status: cases.status,
      tags: cases.tags,
      createdAt: cases.createdAt,
      updatedAt: cases.updatedAt,
    })
    .from(cases)
    .innerJoin(adminProfiles, eq(adminProfiles.id, cases.adminId))
    .innerJoin(users, eq(users.id, adminProfiles.userId))
    .where(and(...conditions))
    .orderBy(desc(cases.createdAt))

  return rows.map((row) =>
    toSafe({
      ...row,
      employerName: row.employerName || row.adminNameEn,
    }),
  )
}

export async function getCaseById(
  id: string,
): Promise<CaseRow | null> {
  const [row] = await db
    .select({
      id: cases.id,
      adminId: cases.adminId,
      adminNameEn: users.nameEn,
      adminNameFa: users.nameFa,
      employerId: cases.employerId,
      employerName: users.nameFa,
      title: cases.title,
      description: cases.description,
      priority: cases.priority,
      status: cases.status,
      tags: cases.tags,
      createdAt: cases.createdAt,
      updatedAt: cases.updatedAt,
    })
    .from(cases)
    .innerJoin(adminProfiles, eq(adminProfiles.id, cases.adminId))
    .innerJoin(users, eq(users.id, adminProfiles.userId))
    .where(eq(cases.id, id))
    .limit(1)

  if (!row) return null
  return toSafe({
    ...row,
    employerName: row.employerName || row.adminNameEn,
  })
}

export async function updateCase(
  id: string,
  data: UpdateCaseInput,
): Promise<CaseRow> {
  const [row] = await db
    .update(cases)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(cases.id, id))
    .returning()

  if (!row) {
    throw new Error("Case not found")
  }

  const admin = await resolveAdminName(row.adminId)
  const [employer] = await db
    .select({ nameFa: users.nameFa, nameEn: users.nameEn })
    .from(users)
    .where(eq(users.id, row.employerId))
    .limit(1)

  return toSafe({
    ...row,
    adminNameEn: admin.nameEn,
    adminNameFa: admin.nameFa,
    employerName: employer?.nameFa || employer?.nameEn || "",
  })
}
