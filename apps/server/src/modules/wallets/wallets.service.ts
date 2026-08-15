import { and, desc, eq, sql } from "drizzle-orm"
import { db } from "../../db"
import {
  transactionStatusEnum,
  transactionTypeEnum,
  walletTransactions,
  wallets,
} from "../../db/schema"
import type {
  CreateTransactionInput,
  ListTransactionsQuery,
} from "./wallets.schemas"

export type WalletRow = {
  id: string
  userId: string
  balanceToman: number
  balanceUSD: number
  currency: string
  createdAt: string
  updatedAt: string
}

export type WalletTransactionRow = {
  id: string
  walletId: string
  type: "deposit" | "withdraw" | "transfer" | "payout" | "payment"
  amountToman: number
  amountUSD: number
  currency: string
  status: "pending" | "completed" | "failed" | "cancelled"
  referenceId: string | null
  note: string | null
  createdAt: string
}

function toSafeWallet(row: {
  id: string
  userId: string
  balanceToman: number
  balanceUSD: number
  currency: string
  createdAt: Date
  updatedAt: Date
}): WalletRow {
  return {
    id: row.id,
    userId: row.userId,
    balanceToman: row.balanceToman,
    balanceUSD: row.balanceUSD,
    currency: row.currency,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

function toSafeTransaction(row: {
  id: string
  walletId: string
  type: string
  amountToman: number
  amountUSD: number
  currency: string
  status: string
  referenceId: string | null
  note: string | null
  createdAt: Date
}): WalletTransactionRow {
  return {
    id: row.id,
    walletId: row.walletId,
    type: row.type as WalletTransactionRow["type"],
    amountToman: row.amountToman,
    amountUSD: row.amountUSD,
    currency: row.currency,
    status: row.status as WalletTransactionRow["status"],
    referenceId: row.referenceId,
    note: row.note,
    createdAt: row.createdAt.toISOString(),
  }
}

export async function getOrCreateWallet(userId: string): Promise<WalletRow> {
  const [existing] = await db
    .select()
    .from(wallets)
    .where(eq(wallets.userId, userId))
    .limit(1)

  if (existing) {
    return toSafeWallet(existing)
  }

  const [row] = await db.insert(wallets).values({ userId }).returning()
  if (!row) {
    throw new Error("Failed to create wallet")
  }
  return toSafeWallet(row)
}

export async function getWallet(userId: string): Promise<WalletRow | null> {
  const [row] = await db
    .select()
    .from(wallets)
    .where(eq(wallets.userId, userId))
    .limit(1)
  if (!row) return null
  return toSafeWallet(row)
}

export async function createTransaction(
  userId: string,
  data: CreateTransactionInput,
): Promise<WalletTransactionRow> {
  const wallet = await getOrCreateWallet(userId)

  const [row] = await db
    .insert(walletTransactions)
    .values({
      walletId: wallet.id,
      type: data.type,
      amountToman: data.amountToman ?? 0,
      amountUSD: data.amountUSD ?? 0,
      currency: data.currency,
      note: data.note,
    })
    .returning()

  if (!row) {
    throw new Error("Failed to create transaction")
  }

  return toSafeTransaction(row)
}

export async function listTransactions(
  userId: string,
  query: ListTransactionsQuery,
): Promise<WalletTransactionRow[]> {
  const wallet = await getWallet(userId)
  if (!wallet) return []

  const conditions = [eq(walletTransactions.walletId, wallet.id)]

  if (query.type) {
    conditions.push(eq(walletTransactions.type, query.type))
  }

  if (query.status) {
    conditions.push(eq(walletTransactions.status, query.status))
  }

  const rows = await db
    .select()
    .from(walletTransactions)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(walletTransactions.createdAt))

  return rows.map(toSafeTransaction)
}
