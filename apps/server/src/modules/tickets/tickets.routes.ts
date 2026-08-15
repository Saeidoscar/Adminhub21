import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { requireAuth } from "../../middleware/auth"
import { ApiError } from "../../lib/errors"
import {
  createTicket,
  listTicketsForUser,
  getTicketById,
  updateTicket,
  createTicketMessage,
  listTicketMessages,
} from "./tickets.service"
import {
  createTicketSchema,
  updateTicketSchema,
  createTicketMessageSchema,
} from "./tickets.schemas"

const ticketsRoutes = new Hono()

ticketsRoutes.post(
  "/",
  requireAuth,
  zValidator("json", createTicketSchema),
  async (c) => {
    const { id } = c.get("authUser")
    const body = c.req.valid("json")
    const ticket = await createTicket(id, body)
    return c.json({ ticket }, 201)
  },
)

ticketsRoutes.get("/", requireAuth, async (c) => {
  const { id } = c.get("authUser")
  const items = await listTicketsForUser(id)
  return c.json({ tickets: items })
})

ticketsRoutes.get("/:id", requireAuth, async (c) => {
  const { id: requesterId, role } = c.get("authUser")
  const id = c.req.param("id")
  const ticket = await getTicketById(id, requesterId, role)
  if (!ticket) {
    throw new ApiError(404, "Ticket not found", "NOT_FOUND")
  }
  return c.json({ ticket })
})

ticketsRoutes.patch(
  "/:id",
  requireAuth,
  zValidator("json", updateTicketSchema),
  async (c) => {
    const { id: requesterId, role } = c.get("authUser")
    const id = c.req.param("id")
    const body = c.req.valid("json")
    const ticket = await getTicketById(id, requesterId, role)
    if (!ticket) {
      throw new ApiError(404, "Ticket not found", "NOT_FOUND")
    }
    const updated = await updateTicket(id, body)
    return c.json({ ticket: updated })
  },
)

ticketsRoutes.post(
  "/:id/messages",
  requireAuth,
  zValidator("json", createTicketMessageSchema),
  async (c) => {
    const { id: requesterId, role } = c.get("authUser")
    const ticketId = c.req.param("id")
    const body = c.req.valid("json")
    const ticket = await getTicketById(ticketId, requesterId, role)
    if (!ticket) {
      throw new ApiError(404, "Ticket not found", "NOT_FOUND")
    }
    const message = await createTicketMessage(ticketId, requesterId, body.body)
    return c.json({ message }, 201)
  },
)

ticketsRoutes.get("/:id/messages", requireAuth, async (c) => {
  const { id: requesterId, role } = c.get("authUser")
  const ticketId = c.req.param("id")
  const ticket = await getTicketById(ticketId, requesterId, role)
  if (!ticket) {
    throw new ApiError(404, "Ticket not found", "NOT_FOUND")
  }
  const items = await listTicketMessages(ticketId)
  return c.json({ messages: items })
})

export { ticketsRoutes }
