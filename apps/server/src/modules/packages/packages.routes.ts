import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { requireAuth, requireRole } from "../../middleware/auth"
import { ApiError } from "../../lib/errors"
import {
  listPackages,
  getPackageById,
  createPackage,
  updatePackage,
  deletePackage,
} from "./packages.service"
import { listPackagesQuerySchema, createPackageSchema, updatePackageSchema } from "./packages.schemas"

const packagesRoutes = new Hono()

packagesRoutes.get("/", zValidator("query", listPackagesQuerySchema), async (c) => {
  const query = c.req.valid("query")
  const items = await listPackages(query)
  return c.json({ packages: items })
})

packagesRoutes.get("/:id", async (c) => {
  const id = c.req.param("id")
  const pkg = await getPackageById(id)
  if (!pkg) {
    throw new ApiError(404, "Package not found", "NOT_FOUND")
  }
  return c.json({ package: pkg })
})

packagesRoutes.post("/", requireAuth, requireRole("admin"), zValidator("json", createPackageSchema), async (c) => {
  const { id } = c.get("authUser")
  const body = c.req.valid("json")
  const pkg = await createPackage(id, body)
  return c.json({ package: pkg }, 201)
})

packagesRoutes.put("/:id", requireAuth, requireRole("admin"), zValidator("json", updatePackageSchema), async (c) => {
  const id = c.req.param("id")
  const body = c.req.valid("json")
  const pkg = await updatePackage(id, body)
  return c.json({ package: pkg })
})

packagesRoutes.delete("/:id", requireAuth, requireRole("admin"), async (c) => {
  const id = c.req.param("id")
  await deletePackage(id)
  return c.json({ ok: true })
})

export { packagesRoutes }
