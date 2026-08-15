import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { requireAuth, requireRole } from "../../middleware/auth"
import { ApiError } from "../../lib/errors"
import { eq } from "drizzle-orm"
import { db } from "../../db"
import { affiliateCodes, affiliateCommissions } from "../../db/schema"
import {
  getOrCreateAffiliateCode,
  getAffiliateCodeByUser,
  listCommissionsForUser,
  recordCommission,
} from "./affiliate.service"
import {
  generateCodeSchema,
  listCommissionsQuerySchema,
  verifyCommissionSchema,
} from "./affiliate.schemas"

const affiliateRoutes = new Hono()

affiliateRoutes.get("/my-code", requireAuth, async (c) => {
  const { id } = c.get("authUser")
  const code = await getAffiliateCodeByUser(id)
  if (!code) {
    throw new ApiError(404, "Affiliate code not found", "NOT_FOUND")
  }
  return c.json({ code })
})

affiliateRoutes.post(
  "/my-code",
  requireAuth,
  zValidator("json", generateCodeSchema),
  async (c) => {
    const { id } = c.get("authUser")
    const code = await getOrCreateAffiliateCode(id)
    return c.json({ code })
  },
)

affiliateRoutes.get(
  "/commissions",
  requireAuth,
  zValidator("query", listCommissionsQuerySchema),
  async (c) => {
    const { id } = c.get("authUser")
    const query = c.req.valid("query")
    const commissions = await listCommissionsForUser(id, query)
    return c.json({ commissions })
  },
)

affiliateRoutes.post(
  "/commissions/verify",
  requireAuth,
  requireRole("super_admin" as any),
  zValidator("json", verifyCommissionSchema),
  async (c) => {
    const body = c.req.valid("json")
    const codeValue = body.code

    const [codeRow] = await db
      .select()
      .from(affiliateCodes)
      .where(eq(affiliateCodes.code, codeValue))
      .limit(1)

    if (!codeRow) {
      throw new ApiError(404, "Invalid affiliate code", "NOT_FOUND")
    }

    const { id: verifierId } = c.get("authUser")

    if (codeRow.userId === verifierId) {
      throw new ApiError(400, "Cannot verify your own code", "BAD_REQUEST")
    }

    const [existing] = await db
      .select()
      .from(affiliateCommissions)
      .where(eq(affiliateCommissions.referredId, verifierId))
      .limit(1)

    if (existing) {
      throw new ApiError(
        400,
        "You have already used an affiliate code",
        "BAD_REQUEST",
      )
    }

    const commission = await recordCommission(
      codeRow.id,
      codeRow.userId,
      verifierId,
      0,
      0,
    )

    return c.json({ commission }, 201)
  },
)

export { affiliateRoutes }
