import type { AuthUser } from "../../middleware/auth"
import type { AdminProfileRow } from "../admin-profiles/admin-profiles.service"

export function view(_user: AuthUser, _profile: AdminProfileRow) {
  return true
}

export function update(user: AuthUser, profile: AdminProfileRow) {
  return user.id === profile.userId || user.role === "super_admin"
}

export function remove(user: AuthUser, _profile: AdminProfileRow) {
  return user.role === "super_admin"
}
