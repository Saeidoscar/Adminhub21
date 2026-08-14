import type { AuthUser } from "../../middleware/auth"
import type { PackageRow } from "../packages/packages.service"
import { eq } from "drizzle-orm"
import { db } from "../../db"
import { adminProfiles } from "../../db/schema"

export function view(_user: AuthUser, _pkg: PackageRow) {
  return true
}

export async function create(user: AuthUser) {
  return user.role === "admin" || user.role === "super_admin"
}

export async function update(user: AuthUser, pkg: PackageRow) {
  if (user.role === "super_admin") return true
  if (user.role !== "admin") return false

  const [profile] = await db
    .select({ id: adminProfiles.id })
    .from(adminProfiles)
    .where(eq(adminProfiles.userId, user.id))
    .limit(1)

  return profile?.id === pkg.adminId
}

export async function remove(user: AuthUser, pkg: PackageRow) {
  return update(user, pkg)
}
