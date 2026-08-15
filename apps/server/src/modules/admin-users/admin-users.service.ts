import { and, desc, eq, sql } from "drizzle-orm"
import { db } from "../../db"
import { users } from "../../db/schema"
import type { ListUsersQuery, UpdateUserInput } from "./admin-users.schemas"

export type UserRow = {
  id: string
  email: string
  role: string
  nameEn: string
  nameFa: string
  phone: string | null
  phoneVerified: boolean
  createdAt: string
}

function toSafe(row: {
  id: string
  email: string
  role: string
  nameEn: string
  nameFa: string
  phone: string | null
  phoneVerified: boolean
  createdAt: Date
}): UserRow {
  return {
    id: row.id,
    email: row.email,
    role: row.role,
    nameEn: row.nameEn,
    nameFa: row.nameFa,
    phone: row.phone,
    phoneVerified: row.phoneVerified,
    createdAt: row.createdAt.toISOString(),
  }
}

export async function listUsers(query: ListUsersQuery): Promise<UserRow[]> {
  const conditions = []

  if (query.role) {
    conditions.push(eq(users.role, query.role))
  }

  if (query.search) {
    const term = `%${query.search.replace(/%/g, "\\%")}%`
    conditions.push(
      sql`(${users.nameEn} ILIKE ${term} OR ${users.nameFa} ILIKE ${term} OR ${users.email} ILIKE ${term})`,
    )
  }

  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      role: users.role,
      nameEn: users.nameEn,
      nameFa: users.nameFa,
      phone: users.phone,
      phoneVerified: users.phoneVerified,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(users.createdAt))

  return rows.map(toSafe)
}

export async function getUserById(id: string): Promise<UserRow | null> {
  const [row] = await db
    .select({
      id: users.id,
      email: users.email,
      role: users.role,
      nameEn: users.nameEn,
      nameFa: users.nameFa,
      phone: users.phone,
      phoneVerified: users.phoneVerified,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, id))
    .limit(1)

  if (!row) return null
  return toSafe(row)
}

export async function updateUser(
  id: string,
  data: UpdateUserInput,
): Promise<UserRow> {
  const [row] = await db
    .update(users)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(users.id, id))
    .returning()

  if (!row) {
    throw new Error("User not found")
  }

  return toSafe(row)
}

export async function deleteUser(id: string): Promise<void> {
  await db.delete(users).where(eq(users.id, id))
}
