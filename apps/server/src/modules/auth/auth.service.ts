import { eq } from "drizzle-orm"
import { db } from "../../db"
import { adminProfiles, users } from "../../db/schema"
import { ApiError } from "../../lib/errors"
import { hashPassword, verifyPassword } from "../../lib/password"
import { signToken } from "../../lib/tokens"
import { createApiToken } from "../../lib/sanctum"
import type { RegisterInput } from "./schemas"

export type SafeUser = {
  id: string
  email: string
  role: "employer" | "admin" | "super_admin"
  nameEn: string
  nameFa: string
  phone: string | null
  photo: string | null
  createdAt: string
}

export interface AuthResult {
  user: SafeUser
  accessToken: string
  refreshToken: string
}

function toSafeUser(row: typeof users.$inferSelect): SafeUser {
  return {
    id: row.id,
    email: row.email,
    role: row.role,
    nameEn: row.nameEn,
    nameFa: row.nameFa,
    phone: row.phone,
    photo: row.photo,
    createdAt: row.createdAt.toISOString(),
  }
}

async function issueTokens(
  row: typeof users.$inferSelect,
): Promise<AuthResult> {
  const [accessToken, refreshToken] = await Promise.all([
    createApiToken(row.id),
    signToken({ sub: row.id, role: row.role, type: "refresh" }),
  ])
  return { user: toSafeUser(row), accessToken, refreshToken }
}

export async function register(input: RegisterInput): Promise<AuthResult> {
  const email = input.email.toLowerCase()

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1)
  if (existing.length > 0) {
    throw new ApiError(
      409,
      "An account with this email already exists",
      "EMAIL_TAKEN",
    )
  }

  const passwordHash = await hashPassword(input.password)
  const [user] = await db
    .insert(users)
    .values({
      email,
      passwordHash,
      role: input.role,
      nameEn: input.nameEn,
      nameFa: input.nameFa,
      phone: input.phone ?? null,
    })
    .returning()

  if (user.role === "admin") {
    await db.insert(adminProfiles).values({ userId: user.id }).returning()
  }

  return issueTokens(user)
}

export async function login(input: {
  email: string
  password: string
}): Promise<AuthResult> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, input.email.toLowerCase()))
    .limit(1)

  if (!user) {
    throw new ApiError(401, "Invalid email or password", "INVALID_CREDENTIALS")
  }
  const ok = await verifyPassword(input.password, user.passwordHash)
  if (!ok) {
    throw new ApiError(401, "Invalid email or password", "INVALID_CREDENTIALS")
  }
  return issueTokens(user)
}

export async function refresh(userId: string): Promise<AuthResult> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)
  if (!user) {
    throw new ApiError(401, "Refresh token no longer valid", "INVALID_REFRESH")
  }
  return issueTokens(user)
}

export async function me(userId: string): Promise<SafeUser> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)
  if (!user) {
    throw new ApiError(404, "User not found", "NOT_FOUND")
  }
  return toSafeUser(user)
}
