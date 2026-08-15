import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { requireAuth, requireRole } from "../../middleware/auth"
import { ApiError } from "../../lib/errors"
import {
  listStoriesAdmin,
  listBlogsAdmin,
  moderateStory,
  moderateBlog,
  listCommentsAdmin,
  deleteCommentAdmin,
} from "./admin-content.service"
import { moderateContentSchema } from "./admin-content.schemas"

const adminContentRoutes = new Hono()

adminContentRoutes.get(
  "/stories",
  requireAuth,
  requireRole("super_admin" as any),
  zValidator("query", moderateContentSchema),
  async (c) => {
    const query = c.req.valid("query")
    const items = await listStoriesAdmin({
      status: query.status,
      search: undefined,
    })
    return c.json({ stories: items })
  },
)

adminContentRoutes.get(
  "/blogs",
  requireAuth,
  requireRole("super_admin" as any),
  zValidator("query", moderateContentSchema),
  async (c) => {
    const query = c.req.valid("query")
    const items = await listBlogsAdmin({
      status: query.status,
      search: undefined,
    })
    return c.json({ blogs: items })
  },
)

adminContentRoutes.patch(
  "/stories/:id",
  requireAuth,
  requireRole("super_admin" as any),
  zValidator("json", moderateContentSchema),
  async (c) => {
    const id = c.req.param("id")
    const body = c.req.valid("json")
    const action = body.action || "approve"
    const story = await moderateStory(id, action)
    if (!story) {
      throw new ApiError(404, "Story not found", "NOT_FOUND")
    }
    return c.json({ story })
  },
)

adminContentRoutes.patch(
  "/blogs/:id",
  requireAuth,
  requireRole("super_admin" as any),
  zValidator("json", moderateContentSchema),
  async (c) => {
    const id = c.req.param("id")
    const body = c.req.valid("json")
    const action = body.action || "approve"
    const blog = await moderateBlog(id, action)
    if (!blog) {
      throw new ApiError(404, "Blog not found", "NOT_FOUND")
    }
    return c.json({ blog })
  },
)

adminContentRoutes.get(
  "/comments",
  requireAuth,
  requireRole("super_admin" as any),
  zValidator("query", moderateContentSchema),
  async (c) => {
    const query = c.req.valid("query")
    const items = await listCommentsAdmin({ postType: query.postType })
    return c.json({ comments: items })
  },
)

adminContentRoutes.delete(
  "/comments/:id",
  requireAuth,
  requireRole("super_admin" as any),
  async (c) => {
    const id = c.req.param("id")
    await deleteCommentAdmin(id)
    return c.json({ ok: true })
  },
)

export { adminContentRoutes }
