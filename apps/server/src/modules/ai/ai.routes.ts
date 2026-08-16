import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { requireAuth } from "../../middleware/auth"
import { rateLimit } from "../../middleware/rate-limit"
import { ApiError } from "../../lib/errors"
import {
  createConversation,
  listConversations,
  getConversation,
  sendMessage,
  listMessages,
  switchModel,
  getAvailableModels,
  renameConversation,
  deleteConversation,
} from "./ai.service"
import {
  createConversationSchema,
  sendMessageSchema,
  switchModelSchema,
  renameConversationSchema,
} from "./ai.schemas"

const aiRoutes = new Hono()

aiRoutes.post(
  "/conversations",
  requireAuth,
  zValidator("json", createConversationSchema),
  async (c) => {
    const { id } = c.get("authUser")
    const body = c.req.valid("json")
    const conversation = await createConversation(id, body)
    return c.json({ conversation }, 201)
  },
)

aiRoutes.get("/conversations", requireAuth, async (c) => {
  const { id } = c.get("authUser")
  const items = await listConversations(id)
  return c.json({ conversations: items })
})

aiRoutes.get("/conversations/:id", requireAuth, async (c) => {
  const { id: userId } = c.get("authUser")
  const id = c.req.param("id")
  const conversation = await getConversation(id, userId)
  if (!conversation) {
    throw new ApiError(404, "Conversation not found", "NOT_FOUND")
  }
  return c.json({ conversation })
})

aiRoutes.post(
  "/conversations/:id/messages",
  requireAuth,
  rateLimit({ windowMs: 60000, max: 20 }),
  zValidator("json", sendMessageSchema),
  async (c) => {
    const { id: userId } = c.get("authUser")
    const conversationId = c.req.param("id")
    const body = c.req.valid("json")
    const message = await sendMessage(userId, conversationId, body.content)
    return c.json({ message }, 201)
  },
)

aiRoutes.patch(
  "/conversations/:id/model",
  requireAuth,
  zValidator("json", switchModelSchema),
  async (c) => {
    const { id: userId } = c.get("authUser")
    const conversationId = c.req.param("id")
    const body = c.req.valid("json")
    const conversation = await switchModel(userId, conversationId, body.modelId)
    return c.json({ conversation })
  },
)

aiRoutes.patch(
  "/conversations/:id",
  requireAuth,
  zValidator("json", renameConversationSchema),
  async (c) => {
    const { id: userId } = c.get("authUser")
    const conversationId = c.req.param("id")
    const body = c.req.valid("json")
    const conversation = await renameConversation(userId, conversationId, body.title)
    return c.json({ conversation })
  },
)

aiRoutes.delete("/conversations/:id", requireAuth, async (c) => {
  const { id: userId } = c.get("authUser")
  const conversationId = c.req.param("id")
  await deleteConversation(userId, conversationId)
  return c.json({ ok: true })
})

aiRoutes.get("/conversations/:id/messages", requireAuth, async (c) => {
  const { id: userId } = c.get("authUser")
  const conversationId = c.req.param("id")
  const items = await listMessages(conversationId, userId)
  return c.json({ messages: items })
})

aiRoutes.get("/models", requireAuth, async (c) => {
  const items = await getAvailableModels()
  return c.json({ models: items })
})

export { aiRoutes }
