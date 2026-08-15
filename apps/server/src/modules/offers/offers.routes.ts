import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { requireAuth, requireRole } from "../../middleware/auth"
import { ApiError } from "../../lib/errors"
import { db } from "../../db"
import { users } from "../../db/schema"
import { eq } from "drizzle-orm"
import {
  createOffer,
  listOffersForAdmin,
  listOffersForUser,
  getOfferById,
} from "./offers.service"
import { createOfferSchema } from "./offers.schemas"

const offersRoutes = new Hono()

offersRoutes.post(
  "/",
  requireAuth,
  requireRole("employer"),
  zValidator("json", createOfferSchema),
  async (c) => {
    const { id: employerId } = c.get("authUser")
    const body = c.req.valid("json")

    const [employer] = await db
      .select({ nameEn: users.nameEn, nameFa: users.nameFa })
      .from(users)
      .where(eq(users.id, employerId))
      .limit(1)

    if (!employer) {
      throw new ApiError(404, "User not found", "NOT_FOUND")
    }

    const employerName = employer.nameFa || employer.nameEn
    const offer = await createOffer(employerId, employerName, body)
    return c.json({ offer }, 201)
  },
)

offersRoutes.get("/", requireAuth, async (c) => {
  const { id, role } = c.get("authUser")
  let offers
  if (role === "employer") {
    offers = await listOffersForUser(id)
  } else {
    const { adminProfiles } = await import("../../db/schema")
    const [adminProfile] = await db
      .select({ id: adminProfiles.id })
      .from(adminProfiles)
      .where(eq(adminProfiles.userId, id))
      .limit(1)
    offers = adminProfile ? await listOffersForAdmin(adminProfile.id) : []
  }
  return c.json({ offers })
})

offersRoutes.get("/:id", requireAuth, async (c) => {
  const { id: requesterId, role } = c.get("authUser")
  const offerId = c.req.param("id")
  const offer = await getOfferById(offerId, requesterId, role)
  if (!offer) {
    throw new ApiError(404, "Offer not found", "NOT_FOUND")
  }
  return c.json({ offer })
})

export { offersRoutes }
