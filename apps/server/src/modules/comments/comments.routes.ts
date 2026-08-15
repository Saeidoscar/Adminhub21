import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { requireAuth } from "../../middleware/auth"
import { ApiError } from "../../lib/errors"
import { createComment, listComments, deleteComment } from "./comments.service"
import {
  createCommentSchema,
  listCommentsQuerySchema,
} from "./comments.schemas"

const commentsRoutes = new Hono()

commentsRoutes.post(
  "/",
  requireAuth,
  zValidator("json", createCommentSchema),
  async (c) => {
    const { id } = c.get("authUser")
    const body = c.req.valid("json")
    const comment = await createComment(id, body)
    return c.json({ comment }, 201)
  },
)

commentsRoutes.get(
  "/",
  zValidator("query", listCommentsQuerySchema),
  async (c) => {
    const query = c.req.valid("query")
    const items = await listComments(query)
    return c.json({ comments: items })
  },
)

commentsRoutes.delete("/:id", requireAuth, async (c) => {
  const { id } = c.get("authUser")
  const commentId = c.req.param("id")
  await deleteComment(commentId, id)
  return c.json({ ok: true })
})

export { commentsRoutes }
