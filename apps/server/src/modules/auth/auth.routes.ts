import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { ApiError } from "../../lib/errors"
import { deleteCookie, getCookie, setCookie } from "hono/cookie"
import { env } from "../../env"
import { REFRESH_TTL_SECONDS, verifyToken } from "../../lib/tokens"
import { revokeApiToken } from "../../lib/sanctum"
import { requireAuth } from "../../middleware/auth"
import { loginSchema, registerSchema } from "./schemas"
import * as service from "./auth.service"
import { sendOtpSchema, verifyOtpSchema } from "./otp.schemas"
import * as otpService from "./otp.service"

const authRoutes = new Hono()
const REFRESH_COOKIE = "ah_refresh"

function setRefreshCookie(c: Parameters<typeof setCookie>[0], token: string) {
  setCookie(c, REFRESH_COOKIE, token, {
    httpOnly: true,
    sameSite: "Lax",
    secure: env.NODE_ENV === "production",
    path: "/",
    maxAge: REFRESH_TTL_SECONDS,
  })
}

authRoutes.post("/register", zValidator("json", registerSchema), async (c) => {
  const body = c.req.valid("json")
  const result = await service.register(body)
  setRefreshCookie(c, result.refreshToken)
  return c.json({ user: result.user, accessToken: result.accessToken }, 201)
})

authRoutes.post("/login", zValidator("json", loginSchema), async (c) => {
  const body = c.req.valid("json")
  const result = await service.login(body)
  setRefreshCookie(c, result.refreshToken)
  return c.json({ user: result.user, accessToken: result.accessToken })
})

authRoutes.post("/otp/send", zValidator("json", sendOtpSchema), async (c) => {
  const body = c.req.valid("json")
  const result = await otpService.sendOtp(body)
  return c.json(result)
})

authRoutes.post(
  "/otp/verify",
  zValidator("json", verifyOtpSchema),
  async (c) => {
    const body = c.req.valid("json")
    const result = await otpService.verifyOtp(body)
    setRefreshCookie(c, result.refreshToken)
    return c.json({ user: result.user, accessToken: result.accessToken })
  },
)

authRoutes.post("/refresh", async (c) => {
  const token = getCookie(c, REFRESH_COOKIE)
  if (!token) {
    throw new ApiError(401, "Missing refresh token", "NO_REFRESH")
  }
  let payload
  try {
    payload = await verifyToken(token, "refresh")
  } catch {
    throw new ApiError(401, "Invalid refresh token", "INVALID_REFRESH")
  }
  const result = await service.refresh(payload.sub)
  setRefreshCookie(c, result.refreshToken)
  return c.json({ user: result.user, accessToken: result.accessToken })
})

authRoutes.post("/logout", async (c) => {
  const header = c.req.header("Authorization")
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : null
  if (token) {
    await revokeApiToken(token)
  }
  deleteCookie(c, REFRESH_COOKIE, { path: "/" })
  return c.json({ ok: true })
})

authRoutes.get("/me", requireAuth, async (c) => {
  const { id } = c.get("authUser")
  const user = await service.me(id)
  return c.json({ user })
})

export { authRoutes }
