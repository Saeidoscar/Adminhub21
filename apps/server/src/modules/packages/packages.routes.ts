import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { requireAuth } from "../../middleware/auth"
import { ApiError } from "../../lib/errors"
import { db } from "../../db"
import { adminProfiles } from "../../db/schema"
import { eq } from "drizzle-orm"
import {
  listPackages,
  getPackageById,
  createPackage,
  updatePackage,
  deletePackage,
} from "./packages.service"
import {
  listPackagesQuerySchema,
  createPackageSchema,
  updatePackageSchema,
} from "./packages.schemas"
import * as policy from "../policies/package.policy"

const packagesRoutes = new Hono()

packagesRoutes.get(
  "/",
  zValidator("query", listPackagesQuerySchema),
  async (c) => {
    const query = c.req.valid("query")
    const items = await listPackages(query)
    return c.json({ packages: items })
  },
)

packagesRoutes.get("/:id", async (c) => {
  const id = c.req.param("id")
  const pkg = await getPackageById(id)
  if (!pkg) {
    throw new ApiError(404, "Package not found", "NOT_FOUND")
  }
  return c.json({ package: pkg })
})

packagesRoutes.post(
  "/",
  requireAuth,
  zValidator("json", createPackageSchema),
  async (c) => {
    const user = c.get("authUser")
    if (!(await policy.create(user))) {
      throw new ApiError(403, "Forbidden", "FORBIDDEN")
    }
    const [profile] = await db
      .select()
      .from(adminProfiles)
      .where(eq(adminProfiles.userId, user.id))
      .limit(1)
    if (!profile) {
      throw new ApiError(403, "Forbidden", "FORBIDDEN")
    }
    const body = c.req.valid("json")
    const pkg = await createPackage(profile.id, body)
    return c.json({ package: pkg }, 201)
  },
)

packagesRoutes.put(
  "/:id",
  requireAuth,
  zValidator("json", updatePackageSchema),
  async (c) => {
    const user = c.get("authUser")
    const id = c.req.param("id")
    const body = c.req.valid("json")
    const pkg = await getPackageById(id)
    if (!pkg) {
      throw new ApiError(404, "Package not found", "NOT_FOUND")
    }
    if (!(await policy.update(user, pkg))) {
      throw new ApiError(403, "Forbidden", "FORBIDDEN")
    }
    const updated = await updatePackage(id, body)
    return c.json({ package: updated })
  },
)

packagesRoutes.delete(
  "/:id",
  requireAuth,
  async (c) => {
    const user = c.get("authUser")
    const id = c.req.param("id")
    const pkg = await getPackageById(id)
    if (!pkg) {
      throw new ApiError(404, "Package not found", "NOT_FOUND")
    }
    if (!(await policy.remove(user, pkg))) {
      throw new ApiError(403, "Forbidden", "FORBIDDEN")
    }
    await deletePackage(id)
    return c.json({ ok: true })
  },
)

export { packagesRoutes }
