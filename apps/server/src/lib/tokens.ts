import { sign, verify } from "hono/jwt"
import { env } from "../env"

export type TokenType = "access" | "refresh"

export interface AuthTokenPayload {
  sub: string
  role: "employer" | "admin" | "super_admin"
  type: TokenType
}

export const ACCESS_TTL_SECONDS = 15 * 60
export const REFRESH_TTL_SECONDS = 30 * 24 * 60 * 60

const secretFor = (type: TokenType) =>
  type === "access" ? env.JWT_ACCESS_SECRET : env.JWT_REFRESH_SECRET

export async function signToken(
  payload: AuthTokenPayload,
): Promise<string> {
  const ttl =
    payload.type === "access" ? ACCESS_TTL_SECONDS : REFRESH_TTL_SECONDS
  const now = Math.floor(Date.now() / 1000)
  return sign(
    { ...payload, iat: now, exp: now + ttl },
    secretFor(payload.type),
  )
}

export async function verifyToken(
  token: string,
  type: TokenType,
): Promise<AuthTokenPayload> {
  const payload = (await verify(token, secretFor(type), "HS256")) as Record<
    string,
    unknown
  >
  if (payload.type !== type || typeof payload.sub !== "string") {
    throw new Error("Invalid token")
  }
  return {
    sub: payload.sub,
    role: (payload.role as "employer" | "admin" | "super_admin") || "employer",
    type: payload.type as TokenType,
  }
}
