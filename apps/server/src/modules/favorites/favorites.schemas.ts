import { z } from "zod"

export const favoriteAdminIdParamSchema = z.object({
  adminId: z.string().uuid(),
})

export type FavoriteAdminIdParam = z.infer<typeof favoriteAdminIdParamSchema>
