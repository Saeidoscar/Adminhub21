import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { ApiError } from "../../lib/errors"
import { getPublicContractByCode } from "./public-contracts.service"
import { getPublicContractSchema } from "./public-contracts.schemas"

const publicContractsRoutes = new Hono()

publicContractsRoutes.get(
  "/:code",
  zValidator("param", getPublicContractSchema),
  async (c) => {
    const { code } = c.req.valid("param")
    const contract = await getPublicContractByCode({ code })
    if (!contract) {
      throw new ApiError(404, "Contract not found", "NOT_FOUND")
    }
    return c.json({ contract })
  },
)

export { publicContractsRoutes }
