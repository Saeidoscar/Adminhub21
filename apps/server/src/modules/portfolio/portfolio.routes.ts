import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { requireAuth } from "../../middleware/auth"
import { ApiError } from "../../lib/errors"
import {
  createPortfolio,
  listPortfolioForAdmin,
  getPortfolioById,
  updatePortfolio,
  deletePortfolio,
} from "./portfolio.service"
import {
  createPortfolioSchema,
  updatePortfolioSchema,
} from "./portfolio.schemas"
import * as policy from "../policies/portfolio.policy"

const portfolioRoutes = new Hono()

portfolioRoutes.post(
  "/",
  requireAuth,
  zValidator("json", createPortfolioSchema),
  async (c) => {
    const user = c.get("authUser")
    if (!(await policy.create(user))) {
      throw new ApiError(403, "Forbidden", "FORBIDDEN")
    }
    const { id } = c.get("authUser")
    const body = c.req.valid("json")
    const item = await createPortfolio(id, body)
    return c.json({ portfolio: item }, 201)
  },
)

portfolioRoutes.get("/admin/:adminId", async (c) => {
  const adminId = c.req.param("adminId")
  const items = await listPortfolioForAdmin(adminId)
  return c.json({ portfolio: items })
})

portfolioRoutes.get("/:id", async (c) => {
  const id = c.req.param("id")
  const item = await getPortfolioById(id)
  if (!item) {
    throw new ApiError(404, "Portfolio item not found", "NOT_FOUND")
  }
  return c.json({ portfolio: item })
})

portfolioRoutes.patch(
  "/:id",
  requireAuth,
  zValidator("json", updatePortfolioSchema),
  async (c) => {
    const user = c.get("authUser")
    const id = c.req.param("id")
    const body = c.req.valid("json")
    const item = await getPortfolioById(id)
    if (!item) {
      throw new ApiError(404, "Portfolio item not found", "NOT_FOUND")
    }
    if (!(await policy.update(user, item))) {
      throw new ApiError(403, "Forbidden", "FORBIDDEN")
    }
    const updated = await updatePortfolio(id, body)
    return c.json({ portfolio: updated })
  },
)

portfolioRoutes.delete("/:id", requireAuth, async (c) => {
  const user = c.get("authUser")
  const id = c.req.param("id")
  const item = await getPortfolioById(id)
  if (!item) {
    throw new ApiError(404, "Portfolio item not found", "NOT_FOUND")
  }
    if (!(await policy.remove(user, item))) {
      throw new ApiError(404, "Portfolio item not found", "NOT_FOUND")
    }
    await deletePortfolio(id)
  return c.json({ ok: true })
})

export { portfolioRoutes }
