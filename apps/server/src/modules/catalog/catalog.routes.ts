import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { listTools, listEditors, listVibeCoders } from "./catalog.service"
import {
  listToolsQuerySchema,
  listEditorsQuerySchema,
  listVibeCodersQuerySchema,
} from "./catalog.schemas"

const catalogRoutes = new Hono()

catalogRoutes.get("/tools", zValidator("query", listToolsQuerySchema), async (c) => {
  const query = c.req.valid("query")
  const items = await listTools({
    category: query.category,
    popular: query.popular === "true" ? true : query.popular === "false" ? false : undefined,
    minRating: query.minRating,
    search: query.search,
  })
  return c.json({ tools: items })
})

catalogRoutes.get("/editors", zValidator("query", listEditorsQuerySchema), async (c) => {
  const query = c.req.valid("query")
  const items = await listEditors({
    specialty: query.specialty,
    minRating: query.minRating,
    search: query.search,
  })
  return c.json({ editors: items })
})

catalogRoutes.get("/vibe-coders", zValidator("query", listVibeCodersQuerySchema), async (c) => {
  const query = c.req.valid("query")
  const items = await listVibeCoders({
    stack: query.stack,
    minRating: query.minRating,
    search: query.search,
  })
  return c.json({ "vibe-coders": items })
})

export { catalogRoutes }
