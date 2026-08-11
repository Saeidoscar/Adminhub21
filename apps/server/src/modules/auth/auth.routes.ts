import { Hono } from "hono"
import { deleteCookie, getCookie, setCookie } from "hono/cookie"
import { zValidator } from "@hono/zod-validator"
import { env } from "../../env"
import { ApiError } from "../../lib/errors"
import { verifyToken, REFRESH_TTL_SECONDS } from "../../lib/tokens"
import { requireAuth } from "../../middleware/auth"
import { loginSchema, registerSchema } from "./schemas"
import * as service from "./auth.service"

const REFRESH_COOKIE = "ah_refresh"

const authRoutes = new Hono()

function setRefreshCookie(c: Parameters<typeof setCookie>[0], token: string) {
  setCookie(c, REFRESH_COOKIE, token, {
    httpOnly: true,
    sameSite: "Lax",
    secure: env.NODE_ENV === "production",
    path: "/",
    maxAge: REFRESH_TTL_SECONDS,
  })
}

authRoutes.post(
  "/register",
  zValidator("json", registerSchema),
  async (c) => {
    const body = c.req.valid("json")
    const result = await service.register(body)
    setRefreshCookie(c, result.refreshToken)
    return c.json(
      { user: result.user, accessToken: result.accessToken },
      201,
    )
  },
)

authRoutes.post("/login", zValidator("json", loginSchema), async (c) => {
  const body = c.req.valid("json")
  const result = await service.login(body)
  setRefreshCookie(c, result.refreshToken)
  return c.json({ user: result.user, accessToken: result.accessToken })
})

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

authRoutes.post("/logout", (c) => {
  deleteCookie(c, REFRESH_COOKIE, { path: "/" })
  return c.json({ ok: true })
})

authRoutes.get("/me", requireAuth, async (c) => {
  const { id } = c.get("authUser")
  const user = await service.me(id)
  return c.json({ user })
})

export { authRoutes }
