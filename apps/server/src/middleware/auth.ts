import { createMiddleware } from "hono/factory"
import { verifyToken } from "../lib/tokens"
import { ApiError } from "../lib/errors"

export type Role = "employer" | "admin"

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
  let payload
  try {
    payload = await verifyToken(token, "access")
  } catch {
    throw new ApiError(401, "Invalid or expired access token", "UNAUTHORIZED")
  }
  c.set("authUser", { id: payload.sub, role: payload.role })
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
