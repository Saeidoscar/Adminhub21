import type { AuthUser } from "../../middleware/auth"
import type { PortfolioRow } from "../portfolio/portfolio.service"
import { eq } from "drizzle-orm"
import { db } from "../../db"
import { adminProfiles } from "../../db/schema"

export function view(_user: AuthUser, _item: PortfolioRow) {
  return true
}

export async function create(user: AuthUser) {
  return user.role === "admin" || user.role === "super_admin"
}

export async function update(user: AuthUser, item: PortfolioRow) {
  if (user.role === "super_admin") return true
  if (user.role !== "admin") return false

  const [profile] = await db
    .select({ id: adminProfiles.id })
    .from(adminProfiles)
    .where(eq(adminProfiles.userId, user.id))
    .limit(1)

  return profile?.id === item.adminId
}

export async function remove(user: AuthUser, item: PortfolioRow) {
  return update(user, item)
}
