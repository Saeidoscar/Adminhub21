import { Hono } from "hono"

export const healthRoutes = new Hono().get("/health", (c) =>
  c.json({
    status: "ok",
    service: "adminhub-api",
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  }),
)
