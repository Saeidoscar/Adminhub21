"use server"

import type { WalletDashboard, WalletListParams } from "@/@types/wallet"
import { apiGet } from "@/lib/apiClient"
import getServerSession from "@/server/actions/auth/getServerSession"
import { walletDashboardResponseSchema } from "./wallet.schemas"

const emptyPagination = {
  currentPage: 1,
  lastPage: 1,
  perPage: 10,
  total: 0,
}

export async function getWalletDashboard(
  params: WalletListParams,
): Promise<{
  dashboard: WalletDashboard | null
  error: string | null
  status: number
}> {
  const session = await getServerSession()
  if (!session?.accessToken) {
    return {
      dashboard: null,
      error: "برای مشاهده کیف پول وارد شوید.",
      status: 401,
    }
  }

  const query = new URLSearchParams()
  if (params.direction && params.direction !== "all")
    query.set("direction", params.direction)
  if (params.type && params.type !== "all") query.set("type", params.type)
  if (params.status && params.status !== "all")
    query.set("status", params.status)
  if (params.dateFrom) query.set("date_from", params.dateFrom)
  if (params.dateTo) query.set("date_to", params.dateTo)
  query.set("page", String(params.page ?? 1))
  query.set("per_page", String(params.perPage ?? 10))

  const response = await apiGet<unknown>(
    `/users/me/wallet?${query.toString()}`,
    session.accessToken,
    {
      revalidate: false,
      tags: ["wallet:dashboard"],
      noStore: params.forceFresh,
    },
  )

  if (!response.ok || !response.data) {
    return { dashboard: null, error: response.error, status: response.status }
  }

  const parsed = walletDashboardResponseSchema.safeParse(response.data)
  if (!parsed.success) {
    return {
      dashboard: null,
      error: "پاسخ کیف پول از سرور معتبر نیست.",
      status: 422,
    }
  }

  const transactions = parsed.data.data.transactions

  return {
    dashboard: {
      summary: parsed.data.data.summary,
      stats: parsed.data.data.stats,
      transactions: transactions.data,
      settlements: parsed.data.data.settlements,
      giftCards: parsed.data.data.giftCards,
      settlementFee: parsed.data.data.settlementFee,
      pagination: {
        currentPage: transactions.current_page ?? emptyPagination.currentPage,
        lastPage: transactions.last_page ?? emptyPagination.lastPage,
        perPage: transactions.per_page ?? emptyPagination.perPage,
        total: transactions.total ?? emptyPagination.total,
      },
    },
    error: null,
    status: response.status,
  }
}
