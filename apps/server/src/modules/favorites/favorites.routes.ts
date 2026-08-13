import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { requireAuth, requireRole } from "../../middleware/auth"
import { listFavorites, addFavorite, removeFavorite } from "./favorites.service"
import { favoriteAdminIdParamSchema } from "./favorites.schemas"

const favoritesRoutes = new Hono()

favoritesRoutes.get("/", requireAuth, async (c) => {
  const { id } = c.get("authUser")
  const items = await listFavorites(id)
  return c.json({ favorites: items })
})

favoritesRoutes.post(
  "/:adminId",
  requireAuth,
  requireRole("employer"),
  zValidator("param", favoriteAdminIdParamSchema),
  async (c) => {
    const { id: userId } = c.get("authUser")
    const { adminId } = c.req.valid("param")
    const favorite = await addFavorite(userId, adminId)
    return c.json({ favorite }, 201)
  },
)

favoritesRoutes.delete(
  "/:adminId",
  requireAuth,
  requireRole("employer"),
  zValidator("param", favoriteAdminIdParamSchema),
  async (c) => {
    const { id: userId } = c.get("authUser")
    const { adminId } = c.req.valid("param")
    await removeFavorite(userId, adminId)
    return c.json({ ok: true })
  },
)

export { favoritesRoutes }
