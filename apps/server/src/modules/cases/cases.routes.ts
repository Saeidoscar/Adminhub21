import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { requireAuth } from "../../middleware/auth"
import { ApiError } from "../../lib/errors"
import {
  createCase,
  listCasesForAdmin,
  listCasesForEmployer,
  getCaseById,
  updateCase,
} from "./cases.service"
import {
  createCaseSchema,
  updateCaseSchema,
  listCasesQuerySchema,
} from "./cases.schemas"
import * as policy from "../policies/case.policy"

const casesRoutes = new Hono()

casesRoutes.post(
  "/",
  requireAuth,
  zValidator("json", createCaseSchema),
  async (c) => {
    const user = c.get("authUser")
    if (!(await policy.create(user))) {
      throw new ApiError(403, "Forbidden", "FORBIDDEN")
    }
    const { id } = c.get("authUser")
    const body = c.req.valid("json")
    const case_ = await createCase(id, body)
    return c.json({ case: case_ }, 201)
  },
)

casesRoutes.get(
  "/",
  requireAuth,
  zValidator("query", listCasesQuerySchema),
  async (c) => {
    const { id, role } = c.get("authUser")
    const query = c.req.valid("query")
    const items =
      role === "admin"
        ? await listCasesForAdmin(id, query)
        : await listCasesForEmployer(id, query)
    return c.json({ cases: items })
  },
)

casesRoutes.get("/:id", requireAuth, async (c) => {
  const user = c.get("authUser")
  const id = c.req.param("id")
  const case_ = await getCaseById(id)
  if (!case_) {
    throw new ApiError(404, "Case not found", "NOT_FOUND")
  }
  if (!(await policy.view(user, case_))) {
    throw new ApiError(403, "Forbidden", "FORBIDDEN")
  }
  return c.json({ case: case_ })
})

casesRoutes.patch(
  "/:id",
  requireAuth,
  zValidator("json", updateCaseSchema),
  async (c) => {
    const user = c.get("authUser")
    const body = c.req.valid("json")
    const id = c.req.param("id")
    const case_ = await getCaseById(id)
    if (!case_) {
      throw new ApiError(404, "Case not found", "NOT_FOUND")
    }
    if (!(await policy.update(user, case_))) {
      throw new ApiError(403, "Forbidden", "FORBIDDEN")
    }
    const updated = await updateCase(id, body)
    return c.json({ case: updated })
  },
)

export { casesRoutes }
