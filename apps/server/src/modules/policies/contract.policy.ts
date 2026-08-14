import type { AuthUser } from "../../middleware/auth"
import type { ContractRow } from "../contracts/contracts.service"
import { eq } from "drizzle-orm"
import { db } from "../../db"
import { adminProfiles } from "../../db/schema"

export async function view(user: AuthUser, contract: ContractRow) {
  if (user.role === "super_admin") return true
  if (user.id === contract.employerId) return true
  if (user.role === "admin") {
    const [profile] = await db
      .select({ id: adminProfiles.id })
      .from(adminProfiles)
      .where(eq(adminProfiles.userId, user.id))
      .limit(1)
    return profile?.id === contract.adminId
  }
  return false
}

export async function updateStatus(user: AuthUser, contract: ContractRow) {
  return view(user, contract)
}
