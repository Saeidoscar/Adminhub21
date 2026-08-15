import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { requireAuth } from "../../middleware/auth"
import {
  getWallet,
  createTransaction,
  listTransactions,
} from "./wallets.service"
import {
  createTransactionSchema,
  listTransactionsQuerySchema,
} from "./wallets.schemas"

const walletsRoutes = new Hono()

walletsRoutes.get("/me", requireAuth, async (c) => {
  const { id } = c.get("authUser")
  const wallet = await getWallet(id)
  if (!wallet) {
    throw new Error("Wallet not found")
  }
  return c.json({ wallet })
})

walletsRoutes.post(
  "/me/transactions",
  requireAuth,
  zValidator("json", createTransactionSchema),
  async (c) => {
    const { id } = c.get("authUser")
    const body = c.req.valid("json")
    const transaction = await createTransaction(id, body)
    return c.json({ transaction }, 201)
  },
)

walletsRoutes.get(
  "/me/transactions",
  requireAuth,
  zValidator("query", listTransactionsQuerySchema),
  async (c) => {
    const { id } = c.get("authUser")
    const query = c.req.valid("query")
    const items = await listTransactions(id, query)
    return c.json({ transactions: items })
  },
)

export { walletsRoutes }
