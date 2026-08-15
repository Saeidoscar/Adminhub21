import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { requireAuth, requireRole } from "../../middleware/auth"
import { ApiError } from "../../lib/errors"
import {
  listAllTickets,
  getTicketById,
  updateTicketStatus,
} from "./admin-tickets.service"
import { listAdminTicketsQuerySchema } from "./admin-tickets.schemas"

const adminTicketsRoutes = new Hono()

adminTicketsRoutes.get(
  "/",
  requireAuth,
  requireRole("super_admin" as any),
  zValidator("query", listAdminTicketsQuerySchema),
  async (c) => {
    const query = c.req.valid("query")
    const items = await listAllTickets(query)
    return c.json({ tickets: items })
  },
)

adminTicketsRoutes.get(
  "/:id",
  requireAuth,
  requireRole("super_admin" as any),
  async (c) => {
    const id = c.req.param("id")
    const ticket = await getTicketById(id)
    if (!ticket) {
      throw new ApiError(404, "Ticket not found", "NOT_FOUND")
    }
    return c.json({ ticket })
  },
)

adminTicketsRoutes.patch(
  "/:id",
  requireAuth,
  requireRole("super_admin" as any),
  zValidator("json", listAdminTicketsQuerySchema),
  async (c) => {
    const id = c.req.param("id")
    const body = c.req.valid("json")
    const ticket = await updateTicketStatus(id, {
      status: body.status || "open",
    })
    return c.json({ ticket })
  },
)

export { adminTicketsRoutes }
