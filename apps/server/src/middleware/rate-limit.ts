import { createMiddleware } from "hono/factory"
import { ApiError } from "../lib/errors"

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

function cleanupStore() {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (entry.resetAt < now) {
      store.delete(key)
    }
  }
}

setInterval(cleanupStore, 60000)

export function rateLimit(options: { windowMs: number; max: number }) {
  const { windowMs, max } = options

  return createMiddleware(async (c, next) => {
    const authUser = c.get("authUser")
    const key = `${authUser.id}:${c.req.path}`

    const now = Date.now()
    const entry = store.get(key)

    if (entry && entry.resetAt < now) {
      store.delete(key)
    }

    const current = store.get(key)

    if (current && current.count >= max) {
      throw new ApiError(429, "Too many requests", "RATE_LIMIT_EXCEEDED")
    }

    if (!current) {
      store.set(key, { count: 1, resetAt: now + windowMs })
    } else {
      current.count++
    }

    await next()
  })
}
