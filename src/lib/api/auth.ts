import type { SafeUser } from "@adminhub/shared"
import { apiFetch, unwrapItem } from "./core"

export type { SafeUser }

export interface RegisterInput {
  email: string
  password: string
  role: "employer" | "admin"
  nameEn: string
  nameFa: string
  phone?: string
}

export interface LoginInput {
  email: string
  password: string
}

export interface OtpSendInput {
  phone: string
}

export interface OtpVerifyInput {
  phone: string
  code: string
}

export async function register(
  input: RegisterInput,
): Promise<{ user: SafeUser; accessToken: string }> {
  const payload = await apiFetch<Record<string, unknown>>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  })

  const user = unwrapItem<SafeUser>(payload, "user")
  const accessToken = unwrapItem<string>(payload, "accessToken")

  if (!user || !accessToken) {
    throw new Error("Registration response was empty")
  }

  return { user, accessToken }
}

export async function login(
  input: LoginInput,
): Promise<{ user: SafeUser; accessToken: string }> {
  const payload = await apiFetch<Record<string, unknown>>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  })

  const user = unwrapItem<SafeUser>(payload, "user")
  const accessToken = unwrapItem<string>(payload, "accessToken")

  if (!user || !accessToken) {
    throw new Error("Login response was empty")
  }

  return { user, accessToken }
}

export async function sendOtp(
  input: OtpSendInput,
): Promise<{ message: string; phone: string }> {
  const payload = await apiFetch<Record<string, unknown>>("/api/auth/otp/request", {
    method: "POST",
    body: JSON.stringify(input),
  })

  const message = unwrapItem<string>(payload, "message")
  const phone = unwrapItem<string>(payload, "phone")

  if (!message || !phone) {
    throw new Error("Send OTP response was empty")
  }

  return { message, phone }
}

export async function verifyOtp(
  input: OtpVerifyInput,
): Promise<{ user: SafeUser; accessToken: string }> {
  const payload = await apiFetch<Record<string, unknown>>("/api/auth/otp/verify", {
    method: "POST",
    body: JSON.stringify(input),
  })

  const user = unwrapItem<SafeUser>(payload, "user")
  const accessToken = unwrapItem<string>(payload, "accessToken")

  if (!user || !accessToken) {
    throw new Error("Verify OTP response was empty")
  }

  return { user, accessToken }
}

export async function logout(): Promise<void> {
  await apiFetch<void>("/api/auth/logout", { method: "POST" })
}

export async function getMe(): Promise<SafeUser> {
  const payload = await apiFetch<Record<string, unknown>>("/api/auth/me")
  const user = unwrapItem<SafeUser>(payload, "user")

  if (!user) {
    throw new Error("Get me response was empty")
  }

  return user
}
