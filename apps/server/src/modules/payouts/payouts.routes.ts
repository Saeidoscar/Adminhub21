import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { requireAuth, requireRole } from "../../middleware/auth"
import { ApiError } from "../../lib/errors"
import {
  requestPayout,
  listPayoutsForUser,
  updatePayoutStatus,
} from "./payouts.service"
import {
  requestPayoutSchema,
  updatePayoutStatusSchema,
} from "./payouts.schemas"

const payoutsRoutes = new Hono()

payoutsRoutes.post(
  "/",
  requireAuth,
  zValidator("json", requestPayoutSchema),
  async (c) => {
    const { id } = c.get("authUser")
    const body = c.req.valid("json")
    const payout = await requestPayout(id, body)
    return c.json({ payout }, 201)
  },
)

payoutsRoutes.get("/", requireAuth, async (c) => {
  const { id } = c.get("authUser")
  const items = await listPayoutsForUser(id)
  return c.json({ payouts: items })
})

payoutsRoutes.patch(
  "/:id/status",
  requireAuth,
  requireRole("admin" as any, "super_admin" as any),
  zValidator("json", updatePayoutStatusSchema),
  async (c) => {
    const { id: adminId } = c.get("authUser")
    const id = c.req.param("id")
    const body = c.req.valid("json")
    const payout = await updatePayoutStatus(id, adminId, body)
    if (!payout) {
      throw new ApiError(404, "Payout not found", "NOT_FOUND")
    }
    return c.json({ payout })
  },
)

export { payoutsRoutes }
