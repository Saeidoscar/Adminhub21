import type { DashboardStats, WalletRow, WalletTransactionRow } from "@adminhub/shared"
import { apiFetch, unwrapItem, unwrapList } from "./core"

export type { DashboardStats, WalletRow, WalletTransactionRow }

export async function getDashboardStats(): Promise<DashboardStats> {
  const payload = await apiFetch<Record<string, unknown>>(
    "/api/admin/dashboard/stats",
  )

  const stats = unwrapItem<DashboardStats>(payload, "stats")

  if (!stats) {
    throw new Error("Dashboard stats response was empty")
  }

  return stats
}

export async function getWallet(): Promise<WalletRow> {
  const payload = await apiFetch<Record<string, unknown>>("/api/wallet/balance")

  const wallet = unwrapItem<WalletRow>(payload, "wallet")

  if (!wallet) {
    throw new Error("Wallet response was empty")
  }

  return wallet
}

export interface CreateTransactionInput {
  type: "deposit" | "withdraw" | "transfer" | "payout" | "payment"
  amountToman?: number
  amountUSD?: number
  currency: string
  note?: string
}

export async function createTransaction(
  input: CreateTransactionInput,
): Promise<WalletTransactionRow> {
  const payload = await apiFetch<Record<string, unknown>>(
    "/api/wallets/me/transactions",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  )

  const transaction = unwrapItem<WalletTransactionRow>(payload, "transaction")

  if (!transaction) {
    throw new Error("Transaction creation response was empty")
  }

  return transaction
}

export interface ListTransactionsQuery {
  walletId?: string
  type?: "deposit" | "withdraw" | "transfer" | "payout" | "payment"
  status?: "pending" | "completed" | "failed" | "cancelled"
}

export async function listTransactions(
  query: ListTransactionsQuery = {},
): Promise<WalletTransactionRow[]> {
  const params = new URLSearchParams()

  if (query.walletId) {
    params.set("walletId", query.walletId)
  }

  if (query.type) {
    params.set("type", query.type)
  }

  if (query.status) {
    params.set("status", query.status)
  }

  const queryString = params.toString()
  const payload = await apiFetch<Record<string, unknown>>(
    `/api/wallet/transactions${queryString ? `?${queryString}` : ""}`,
  )

  return unwrapList<WalletTransactionRow>(payload, "transactions")
}
