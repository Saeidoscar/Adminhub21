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
import { createContractSchema, updateContractStatusSchema } from "./contracts.schemas"

const contractsRoutes = new Hono()

contractsRoutes.post("/", requireAuth, zValidator("json", createContractSchema), async (c) => {
  const { id: requesterId, role } = c.get("authUser")
  const body = c.req.valid("json")
  const contract = await createContract(requesterId, role, body)
  return c.json({ contract }, 201)
})

contractsRoutes.get("/", requireAuth, async (c) => {
  const { id, role } = c.get("authUser")
  const items = await listContractsForUser(id, role)
  return c.json({ contracts: items })
})

contractsRoutes.get("/:id", requireAuth, async (c) => {
  const { id: requesterId, role } = c.get("authUser")
  const id = c.req.param("id")
  const contract = await getContractById(id, requesterId, role)
  if (!contract) {
    throw new ApiError(404, "Contract not found", "NOT_FOUND")
  }
  return c.json({ contract })
})

contractsRoutes.patch("/:id/status", requireAuth, zValidator("json", updateContractStatusSchema), async (c) => {
  const { id: requesterId, role } = c.get("authUser")
  const id = c.req.param("id")
  const body = c.req.valid("json")
  const contract = await updateContractStatus(id, requesterId, role, body)
  return c.json({ contract })
})

export { contractsRoutes }
