import AdaptiveCard from "@/components/shared/AdaptiveCard"
import Container from "@/components/shared/Container"
import Link from "next/link"
import { TbFilePlus } from "react-icons/tb"
import ContractsListFilters from "./_components/ContractsListFilters"
import ContractsTable from "./_components/ContractsTable"
import { getContracts } from "@/server/actions/contracts/getContracts"
import type { ContractStatus } from "@/@types/contracts"
import { redirect } from "next/navigation"

type PageProps = {
  searchParams: Promise<{
    q?: string
    status?: ContractStatus | "all"
    dateFrom?: string
    dateTo?: string
    page?: string
    perPage?: string
  }>
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams
  const result = await getContracts({
    q: params.q,
    status: params.status,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
    page: Number(params.page) || 1,
    perPage: Number(params.perPage) || 10,
  })

  if (result.status === 403) redirect("/pishkhan/limited-access")

  return (
    <Container className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            قراردادها
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            پیش‌نویس‌ها، قراردادهای آماده امضا و قراردادهای منعقدشده در یک مسیر
            قابل پیگیری.
          </p>
        </div>
        <Link href="/pishkhan/contracts/new">
          <span className="button button-md rounded-xl bg-primary px-5 py-2 text-neutral hover:bg-primary-mild inline-flex items-center gap-2">
            <TbFilePlus />
            قرارداد جدید
          </span>
        </Link>
      </div>

      <AdaptiveCard>
        <div className="space-y-4">
          <ContractsListFilters
            initial={{
              q: params.q,
              status: params.status ?? "all",
              dateFrom: params.dateFrom,
              dateTo: params.dateTo,
            }}
          />
          {result.error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-100">
              {result.error}
            </div>
          )}
          <ContractsTable
            contracts={result.items}
            pagination={result.pagination}
          />
        </div>
      </AdaptiveCard>
    </Container>
  )
}
