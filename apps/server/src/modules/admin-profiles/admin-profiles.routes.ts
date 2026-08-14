import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { requireAuth, requireRole } from "../../middleware/auth"
import { ApiError } from "../../lib/errors"
import { eq } from "drizzle-orm"
import { db } from "../../db"
import { adminProfiles } from "../../db/schema"
import {
  listAdminProfiles,
  getAdminProfileById,
  updateAdminProfile,
} from "./admin-profiles.service"
import {
  listAdminProfilesQuerySchema,
  updateAdminProfileSchema,
} from "./admin-profiles.schemas"
import * as policy from "../policies/admin-profile.policy"

const adminProfilesRoutes = new Hono()

adminProfilesRoutes.get(
  "/",
  zValidator("query", listAdminProfilesQuerySchema),
  async (c) => {
    const query = c.req.valid("query")
    const profiles = await listAdminProfiles(query)
    return c.json({ profiles })
  },
)

adminProfilesRoutes.get("/:id", async (c) => {
  const id = c.req.param("id")
  const profile = await getAdminProfileById(id)
  if (!profile) {
    throw new ApiError(404, "Admin profile not found", "NOT_FOUND")
  }
  return c.json({ profile })
})

adminProfilesRoutes.put(
  "/me",
  requireAuth,
  zValidator("json", updateAdminProfileSchema),
  async (c) => {
    const user = c.get("authUser")
    const body = c.req.valid("json")
    const [profile] = await db
      .select()
      .from(adminProfiles)
      .where(eq(adminProfiles.userId, user.id))
      .limit(1)
    if (!profile) {
      throw new ApiError(404, "Admin profile not found", "NOT_FOUND")
    }
    if (!policy.update(user, { userId: profile.userId } as any)) {
      throw new ApiError(403, "Forbidden", "FORBIDDEN")
    }
    const updated = await updateAdminProfile(user.id, body)
    return c.json({ profile: updated })
  },
)

adminProfilesRoutes.put(
  "/:id",
  requireAuth,
  requireRole("super_admin"),
  zValidator("json", updateAdminProfileSchema),
  async (c) => {
    const id = c.req.param("id")
    const profile = await getAdminProfileById(id)
    if (!profile) {
      throw new ApiError(404, "Admin profile not found", "NOT_FOUND")
    }
    const user = c.get("authUser")
    if (!policy.update(user, profile)) {
      throw new ApiError(403, "Forbidden", "FORBIDDEN")
    }
    const updated = await updateAdminProfile(profile.userId, c.req.valid("json"))
    return c.json({ profile: updated })
  },
)

export { adminProfilesRoutes }
