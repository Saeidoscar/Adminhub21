import { createMiddleware } from "hono/factory"
import { ApiError } from "../lib/errors"
import { validateApiToken } from "../lib/sanctum"
import { db } from "../db"
import { users } from "../db/schema"
import { eq } from "drizzle-orm"

export type Role = "employer" | "admin" | "super_admin"

export interface AuthUser {
  id: string
  role: Role
}

declare module "hono" {
  interface ContextVariableMap {
    authUser: AuthUser
  }
}

export const requireAuth = createMiddleware(async (c, next) => {
  const header = c.req.header("Authorization")
  if (!header?.startsWith("Bearer ")) {
    throw new ApiError(401, "Missing access token", "UNAUTHORIZED")
  }
  const token = header.slice("Bearer ".length)
  const record = await validateApiToken(token)
  if (!record) {
    throw new ApiError(401, "Invalid or revoked access token", "UNAUTHORIZED")
  }

  const [user] = await db.select().from(users).where(eq(users.id, record.userId)).limit(1)
  if (!user) {
    throw new ApiError(401, "User not found", "UNAUTHORIZED")
  }

  c.set("authUser", { id: user.id, role: user.role })
  await next()
})

export function requireRole(...roles: Role[]) {
  return createMiddleware(async (c, next) => {
    const user = c.get("authUser")
    if (!roles.includes(user.role)) {
      throw new ApiError(403, "You do not have permission for this action", "FORBIDDEN")
    }
    await next()
  })
}
