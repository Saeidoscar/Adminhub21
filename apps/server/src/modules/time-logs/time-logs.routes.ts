import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { requireAuth } from "../../middleware/auth"
import { ApiError } from "../../lib/errors"
import {
  createTimeLog,
  listTimeLogsForUser,
  getTimeLogById,
} from "./time-logs.service"
import {
  createTimeLogSchema,
  listTimeLogsQuerySchema,
} from "./time-logs.schemas"

const timeLogsRoutes = new Hono()

timeLogsRoutes.post(
  "/",
  requireAuth,
  zValidator("json", createTimeLogSchema),
  async (c) => {
    const { id } = c.get("authUser")
    const body = c.req.valid("json")
    const timeLog = await createTimeLog(id, body)
    return c.json({ timeLog }, 201)
  },
)

timeLogsRoutes.get(
  "/",
  requireAuth,
  zValidator("query", listTimeLogsQuerySchema),
  async (c) => {
    const { id } = c.get("authUser")
    const query = c.req.valid("query")
    const items = await listTimeLogsForUser(id, query)
    return c.json({ timeLogs: items })
  },
)

timeLogsRoutes.get("/:id", requireAuth, async (c) => {
  const { id: userId } = c.get("authUser")
  const id = c.req.param("id")
  const timeLog = await getTimeLogById(id, userId)
  if (!timeLog) {
    throw new ApiError(404, "Time log not found", "NOT_FOUND")
  }
  return c.json({ timeLog })
})

export { timeLogsRoutes }
