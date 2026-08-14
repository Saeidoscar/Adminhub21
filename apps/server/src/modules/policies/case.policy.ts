import type { AuthUser } from "../../middleware/auth"
import type { CaseRow } from "../cases/cases.service"
import { eq } from "drizzle-orm"
import { db } from "../../db"
import { adminProfiles } from "../../db/schema"

export async function view(user: AuthUser, case_: CaseRow) {
  if (user.role === "super_admin") return true
  if (user.id === case_.employerId) return true
  if (user.role === "admin") {
    const [profile] = await db
      .select({ id: adminProfiles.id })
      .from(adminProfiles)
      .where(eq(adminProfiles.userId, user.id))
      .limit(1)
    return profile?.id === case_.adminId
  }
  return false
}

export async function create(user: AuthUser) {
  return user.role === "admin" || user.role === "super_admin"
}

export async function update(user: AuthUser, case_: CaseRow) {
  if (user.role === "super_admin") return true
  if (user.role === "admin") {
    const [profile] = await db
      .select({ id: adminProfiles.id })
      .from(adminProfiles)
      .where(eq(adminProfiles.userId, user.id))
      .limit(1)
    return profile?.id === case_.adminId
  }
  return false
}
