import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { requireAuth } from "../../middleware/auth"
import { ApiError } from "../../lib/errors"
import {
  createTask,
  listTasksForCase,
  getTaskById,
  updateTask,
} from "./tasks.service"
import { createTaskSchema } from "./tasks.schemas"

const tasksRoutes = new Hono()

tasksRoutes.post(
  "/",
  requireAuth,
  zValidator("json", createTaskSchema),
  async (c) => {
    const body = c.req.valid("json")
    const task = await createTask(body)
    return c.json({ task }, 201)
  },
)

tasksRoutes.get("/case/:caseId", requireAuth, async (c) => {
  const caseId = c.req.param("caseId")
  const items = await listTasksForCase(caseId)
  return c.json({ tasks: items })
})

tasksRoutes.get("/:id", requireAuth, async (c) => {
  const id = c.req.param("id")
  const task = await getTaskById(id)
  if (!task) {
    throw new ApiError(404, "Task not found", "NOT_FOUND")
  }
  return c.json({ task })
})

tasksRoutes.patch(
  "/:id",
  requireAuth,
  zValidator("json", createTaskSchema),
  async (c) => {
    const body = c.req.valid("json")
    const id = c.req.param("id")
    const task = await updateTask(id, body)
    return c.json({ task })
  },
)

export { tasksRoutes }
