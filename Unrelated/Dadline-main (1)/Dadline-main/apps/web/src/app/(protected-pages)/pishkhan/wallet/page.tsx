import AdaptiveCard from "@/components/shared/AdaptiveCard"
import Container from "@/components/shared/Container"
import { redirect } from "next/navigation"
import WalletFilters from "./_components/WalletFilters"
import WalletSidebar from "./_components/WalletSidebar"
import WalletStatsSidebar from "./_components/WalletStatsSidebar"
import WalletTransactionsTable from "./_components/WalletTransactionsTable"
import { getWalletDashboard } from "@/server/actions/wallet/getWallet"
import type {
  WalletDirection,
  WalletTransactionStatus,
  WalletTransactionType,
} from "@/@types/wallet"

type PageProps = {
  searchParams: Promise<{
    direction?: WalletDirection | "all"
    type?: WalletTransactionType | "all"
    status?: WalletTransactionStatus | "all"
    dateFrom?: string
    dateTo?: string
    page?: string
    perPage?: string
    payment?: "success" | "failed"
    paymentId?: string
    success?: string
  }>
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams
  const paymentStatus =
    params.payment ??
    (params.success === "1" || params.success === "true"
      ? "success"
      : params.success === "0" || params.success === "false"
        ? "failed"
        : undefined)

  const result = await getWalletDashboard({
    direction: params.direction,
    type: params.type,
    status: params.status,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
    page: Number(params.page) || 1,
    perPage: Number(params.perPage) || 10,
    forceFresh: paymentStatus === "success" || paymentStatus === "failed",
  })

  if (result.status === 401) redirect("/sign-in")

  return (
    <Container className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          کیف پول
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          مدیریت موجودی، برداشت درآمد، کارت هدیه و تاریخچه تراکنش‌ها
        </p>
      </div>

      {result.error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-100">
          {result.error}
        </div>
      )}

      {paymentStatus === "success" && (
        <div className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-100">
          پرداخت با موفقیت تایید و موجودی کیف پول شارژ شد.
        </div>
      )}

      {paymentStatus === "failed" && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-100">
          پرداخت تایید نشد. اگر مبلغی از حساب شما کسر شده باشد، حداکثر تا ۷۲
          ساعت آینده از سمت بانک برگشت داده می‌شود.
        </div>
      )}

      {result.dashboard && (
        <div className="space-y-5">
          <WalletSidebar
            summary={result.dashboard.summary}
            settlements={result.dashboard.settlements}
            giftCards={result.dashboard.giftCards}
            settlementFee={result.dashboard.settlementFee}
          />

          <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
            <AdaptiveCard className="min-w-0">
              <div className="min-w-0 space-y-4">
                <WalletFilters
                  initial={{
                    direction: params.direction ?? "all",
                    type: params.type ?? "all",
                    status: params.status ?? "all",
                    dateFrom: params.dateFrom,
                    dateTo: params.dateTo,
                  }}
                />
                <WalletTransactionsTable
                  transactions={result.dashboard.transactions}
                  pagination={result.dashboard.pagination}
                />
              </div>
            </AdaptiveCard>

            <WalletStatsSidebar stats={result.dashboard.stats} />
          </div>
        </div>
      )}
    </Container>
  )
}
