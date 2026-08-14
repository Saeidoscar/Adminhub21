import { eq } from "drizzle-orm"
import { db } from "../../db"
import { users } from "../../db/schema"
import { ApiError } from "../../lib/errors"
import { hashPassword } from "../../lib/password"
import { createApiToken } from "../../lib/sanctum"
import { signToken } from "../../lib/tokens"
import type { SendOtpInput, VerifyOtpInput } from "./otp.schemas"

export type AuthResult = {
  user: {
    id: string
    email: string
    role: "employer" | "admin"
    nameEn: string
    nameFa: string
    phone: string | null
    photo: string | null
    createdAt: string
  }
  accessToken: string
  refreshToken: string
}

export async function sendOtp(input: SendOtpInput): Promise<{ ok: true }> {
  const code = String(Math.floor(100000 + Math.random() * 900000))
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000)

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.phone, input.phone))
    .limit(1)

  if (existing) {
    await db
      .update(users)
      .set({ otpCode: code, otpExpiresAt })
      .where(eq(users.id, existing.id))
  }

  return { ok: true }
}

export async function verifyOtp(input: VerifyOtpInput): Promise<AuthResult> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.phone, input.phone))
    .limit(1)

  if (!user) {
    const passwordHash = await hashPassword(Math.random().toString(36))
    const [newUser] = await db
      .insert(users)
      .values({
        email: `${input.phone}@otp.local`,
        passwordHash,
        phone: input.phone,
        nameEn: "User",
        nameFa: "User",
        role: "employer",
      })
      .returning()

    if (!newUser) {
      throw new ApiError(500, "Failed to create user", "NOT_FOUND")
    }

    const [accessToken, refreshToken] = await Promise.all([
      createApiToken(newUser.id),
      signToken({ sub: newUser.id, role: "employer", type: "refresh" }),
    ])

    return {
      user: {
        id: newUser.id,
        email: newUser.email,
        role: "employer",
        nameEn: newUser.nameEn,
        nameFa: newUser.nameFa,
        phone: newUser.phone,
        photo: newUser.photo,
        createdAt: newUser.createdAt.toISOString(),
      },
      accessToken,
      refreshToken,
    }
  }

  if (!user.otpCode || user.otpCode !== input.code) {
    throw new ApiError(400, "Invalid code", "INVALID_CODE")
  }

  if (!user.otpExpiresAt || user.otpExpiresAt.getTime() < Date.now()) {
    throw new ApiError(400, "Code expired", "CODE_EXPIRED")
  }

  await db
    .update(users)
    .set({ otpCode: null, otpExpiresAt: null })
    .where(eq(users.id, user.id))

  const updated = await db
    .select()
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1)

  const row = updated[0]
  if (!row) {
    throw new ApiError(500, "User not found after verification", "NOT_FOUND")
  }

  const role = row.role as "employer" | "admin"

  const [accessToken, refreshToken] = await Promise.all([
    createApiToken(row.id),
    signToken({ sub: row.id, role, type: "refresh" }),
  ])

  return {
    user: {
      id: row.id,
      email: row.email,
      role,
      nameEn: row.nameEn,
      nameFa: row.nameFa,
      phone: row.phone,
      photo: row.photo,
      createdAt: row.createdAt.toISOString(),
    },
    accessToken,
    refreshToken,
  }
}
