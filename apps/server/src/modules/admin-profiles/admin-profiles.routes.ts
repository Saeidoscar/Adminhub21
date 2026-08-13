import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { requireAuth, requireRole } from "../../middleware/auth"
import { ApiError } from "../../lib/errors"
import { listAdminProfiles, getAdminProfileById, updateAdminProfile } from "./admin-profiles.service"
import { listAdminProfilesQuerySchema, updateAdminProfileSchema } from "./admin-profiles.schemas"

const adminProfilesRoutes = new Hono()

adminProfilesRoutes.get("/", zValidator("query", listAdminProfilesQuerySchema), async (c) => {
  const query = c.req.valid("query")
  const profiles = await listAdminProfiles(query)
  return c.json({ profiles })
})

adminProfilesRoutes.get("/:id", async (c) => {
  const id = c.req.param("id")
  const profile = await getAdminProfileById(id)
  if (!profile) {
    throw new ApiError(404, "Admin profile not found", "NOT_FOUND")
  }
  return c.json({ profile })
})

adminProfilesRoutes.put("/me", requireAuth, requireRole("admin"), zValidator("json", updateAdminProfileSchema), async (c) => {
  const { id } = c.get("authUser")
  const body = c.req.valid("json")
  const profile = await updateAdminProfile(id, body)
  return c.json({ profile })
})

export { adminProfilesRoutes }
