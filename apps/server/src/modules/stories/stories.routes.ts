import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { requireAuth } from "../../middleware/auth"
import { ApiError } from "../../lib/errors"
import {
  createStory,
  listStories,
  getStoryById,
  updateStory,
  deleteStory,
} from "./stories.service"
import {
  createStorySchema,
  updateStorySchema,
  listStoriesQuerySchema,
} from "./stories.schemas"

const storiesRoutes = new Hono()

storiesRoutes.post(
  "/",
  requireAuth,
  zValidator("json", createStorySchema),
  async (c) => {
    const { id } = c.get("authUser")
    const body = c.req.valid("json")
    const story = await createStory(id, body)
    return c.json({ story }, 201)
  },
)

storiesRoutes.get(
  "/",
  zValidator("query", listStoriesQuerySchema),
  async (c) => {
    const query = c.req.valid("query")
    const items = await listStories(query)
    return c.json({ stories: items })
  },
)

storiesRoutes.get("/:id", async (c) => {
  const id = c.req.param("id")
  const story = await getStoryById(id)
  if (!story) {
    throw new ApiError(404, "Story not found", "NOT_FOUND")
  }
  return c.json({ story })
})

storiesRoutes.patch(
  "/:id",
  requireAuth,
  zValidator("json", updateStorySchema),
  async (c) => {
    const { id } = c.get("authUser")
    const storyId = c.req.param("id")
    const body = c.req.valid("json")
    const story = await updateStory(storyId, id, body)
    return c.json({ story })
  },
)

storiesRoutes.delete("/:id", requireAuth, async (c) => {
  const { id } = c.get("authUser")
  const storyId = c.req.param("id")
  await deleteStory(storyId, id)
  return c.json({ ok: true })
})

export { storiesRoutes }
