import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { requireAuth, requireRole } from "../../middleware/auth"
import { ApiError } from "../../lib/errors"
import {
  listUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "./admin-users.service"
import { listUsersQuerySchema, updateUserSchema } from "./admin-users.schemas"

const adminUsersRoutes = new Hono()

adminUsersRoutes.get(
  "/",
  requireAuth,
  requireRole("super_admin" as any),
  zValidator("query", listUsersQuerySchema),
  async (c) => {
    const query = c.req.valid("query")
    const items = await listUsers(query)
    return c.json({ users: items })
  },
)

adminUsersRoutes.get(
  "/:id",
  requireAuth,
  requireRole("super_admin" as any),
  async (c) => {
    const id = c.req.param("id")
    const user = await getUserById(id)
    if (!user) {
      throw new ApiError(404, "User not found", "NOT_FOUND")
    }
    return c.json({ user })
  },
)

adminUsersRoutes.patch(
  "/:id",
  requireAuth,
  requireRole("super_admin" as any),
  zValidator("json", updateUserSchema),
  async (c) => {
    const id = c.req.param("id")
    const body = c.req.valid("json")
    const user = await updateUser(id, body)
    return c.json({ user })
  },
)

adminUsersRoutes.delete(
  "/:id",
  requireAuth,
  requireRole("super_admin" as any),
  async (c) => {
    const id = c.req.param("id")
    await deleteUser(id)
    return c.json({ ok: true })
  },
)

export { adminUsersRoutes }
