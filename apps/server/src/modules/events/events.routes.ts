import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { requireAuth } from "../../middleware/auth"
import { ApiError } from "../../lib/errors"
import {
  createEvent,
  listEventsForUser,
  getEventById,
  updateEvent,
  deleteEvent,
} from "./events.service"
import {
  createEventSchema,
  updateEventSchema,
  listEventsQuerySchema,
} from "./events.schemas"

const eventsRoutes = new Hono()

eventsRoutes.post(
  "/",
  requireAuth,
  zValidator("json", createEventSchema),
  async (c) => {
    const { id } = c.get("authUser")
    const body = c.req.valid("json")
    const event = await createEvent(id, body)
    return c.json({ event }, 201)
  },
)

eventsRoutes.get(
  "/",
  requireAuth,
  zValidator("query", listEventsQuerySchema),
  async (c) => {
    const { id } = c.get("authUser")
    const query = c.req.valid("query")
    const items = await listEventsForUser(id, query)
    return c.json({ events: items })
  },
)

eventsRoutes.get("/:id", requireAuth, async (c) => {
  const { id: userId } = c.get("authUser")
  const id = c.req.param("id")
  const event = await getEventById(id, userId)
  if (!event) {
    throw new ApiError(404, "Event not found", "NOT_FOUND")
  }
  return c.json({ event })
})

eventsRoutes.patch(
  "/:id",
  requireAuth,
  zValidator("json", updateEventSchema),
  async (c) => {
    const { id: userId } = c.get("authUser")
    const id = c.req.param("id")
    const body = c.req.valid("json")
    const event = await updateEvent(id, userId, body)
    return c.json({ event })
  },
)

eventsRoutes.delete("/:id", requireAuth, async (c) => {
  const { id: userId } = c.get("authUser")
  const id = c.req.param("id")
  await deleteEvent(id, userId)
  return c.json({ ok: true })
})

export { eventsRoutes }
