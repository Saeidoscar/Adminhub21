import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { requireAuth } from "../../middleware/auth"
import { ApiError } from "../../lib/errors"
import {
  createContract,
  listContractsForUser,
  getContractById,
  updateContractStatus,
} from "./contracts.service"
import {
  createContractSchema,
  updateContractStatusSchema,
} from "./contracts.schemas"
import * as policy from "../policies/contract.policy"

const contractsRoutes = new Hono()

contractsRoutes.post(
  "/",
  requireAuth,
  zValidator("json", createContractSchema),
  async (c) => {
    const { id: requesterId, role } = c.get("authUser")
    const body = c.req.valid("json")
    const contract = await createContract(requesterId, role, body)
    return c.json({ contract }, 201)
  },
)

contractsRoutes.get("/", requireAuth, async (c) => {
  const { id, role } = c.get("authUser")
  const items = await listContractsForUser(id, role)
  return c.json({ contracts: items })
})

contractsRoutes.get("/:id", requireAuth, async (c) => {
  const user = c.get("authUser")
  const id = c.req.param("id")
  const contract = await getContractById(id)
  if (!contract) {
    throw new ApiError(404, "Contract not found", "NOT_FOUND")
  }
  if (!(await policy.view(user, contract))) {
    throw new ApiError(403, "Forbidden", "FORBIDDEN")
  }
  return c.json({ contract })
})

contractsRoutes.patch(
  "/:id/status",
  requireAuth,
  zValidator("json", updateContractStatusSchema),
  async (c) => {
    const user = c.get("authUser")
    const id = c.req.param("id")
    const body = c.req.valid("json")
    const contract = await getContractById(id)
    if (!contract) {
      throw new ApiError(404, "Contract not found", "NOT_FOUND")
    }
    if (!(await policy.updateStatus(user, contract))) {
      throw new ApiError(403, "Forbidden", "FORBIDDEN")
    }
    const updated = await updateContractStatus(id, body)
    return c.json({ contract: updated })
  },
)

export { contractsRoutes }
