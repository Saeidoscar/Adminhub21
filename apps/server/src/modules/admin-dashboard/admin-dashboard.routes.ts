import { Hono } from "hono"
import { requireAuth, requireRole } from "../../middleware/auth"
import { getDashboardStats } from "./admin-dashboard.service"

const adminDashboardRoutes = new Hono()

adminDashboardRoutes.get(
  "/stats",
  requireAuth,
  requireRole("super_admin" as any),
  async (c) => {
    const stats = await getDashboardStats()
    return c.json({ stats })
  },
)

export { adminDashboardRoutes }
