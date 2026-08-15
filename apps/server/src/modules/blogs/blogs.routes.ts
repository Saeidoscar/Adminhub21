import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { requireAuth } from "../../middleware/auth"
import { ApiError } from "../../lib/errors"
import {
  createBlog,
  listBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
} from "./blogs.service"
import {
  createBlogSchema,
  updateBlogSchema,
  listBlogsQuerySchema,
} from "./blogs.schemas"

const blogsRoutes = new Hono()

blogsRoutes.post(
  "/",
  requireAuth,
  zValidator("json", createBlogSchema),
  async (c) => {
    const { id } = c.get("authUser")
    const body = c.req.valid("json")
    const blog = await createBlog(id, body)
    return c.json({ blog }, 201)
  },
)

blogsRoutes.get("/", zValidator("query", listBlogsQuerySchema), async (c) => {
  const query = c.req.valid("query")
  const items = await listBlogs(query)
  return c.json({ blogs: items })
})

blogsRoutes.get("/:id", async (c) => {
  const id = c.req.param("id")
  const blog = await getBlogById(id)
  if (!blog) {
    throw new ApiError(404, "Blog not found", "NOT_FOUND")
  }
  return c.json({ blog })
})

blogsRoutes.patch(
  "/:id",
  requireAuth,
  zValidator("json", updateBlogSchema),
  async (c) => {
    const { id } = c.get("authUser")
    const blogId = c.req.param("id")
    const body = c.req.valid("json")
    const blog = await updateBlog(blogId, id, body)
    return c.json({ blog })
  },
)

blogsRoutes.delete("/:id", requireAuth, async (c) => {
  const { id } = c.get("authUser")
  const blogId = c.req.param("id")
  await deleteBlog(blogId, id)
  return c.json({ ok: true })
})

export { blogsRoutes }
