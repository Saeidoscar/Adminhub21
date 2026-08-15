import NotFound from "@/components/shared/NotFound"
import {
  getContract,
  getContractBasePricing,
  getContractPricing,
} from "@/server/actions/contracts/getContracts"
import { redirect } from "next/navigation"
import ContractWorkspace from "../_components/ContractWorkspace"

type PageProps = {
  params: Promise<{ uuid: string }>
  searchParams?: Promise<{
    payment?: string
    purchaseType?: string
    returnContext?: string
  }>
}

const paymentStatus = (value?: string) =>
  value === "success" || value === "failed" ? value : null

export default async function Page({ params, searchParams }: PageProps) {
  const { uuid } = await params
  const query = (await searchParams) ?? {}
  const status = paymentStatus(query.payment)
  const forceFresh = status !== null
  const [result, pricing, basePricing] = await Promise.all([
    getContract(uuid, { forceFresh }),
    getContractPricing(uuid, { forceFresh }),
    getContractBasePricing(),
  ])

  if (result.notFound) return <NotFound />

  if (result.status === 403 || pricing.status === 403)
    redirect("/pishkhan/limited-access")

  if (result.status === 422 && result.error?.includes("احراز هویت سطح ۲")) {
    redirect("/pishkhan/profile/verification")
  }

  if (result.error || !result.contract) {
    return (
      <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-100">
        {result.error ?? "قرارداد پیدا نشد."}
      </div>
    )
  }

  return (
    <ContractWorkspace
      contract={result.contract}
      quote={pricing.quote}
      basePricing={basePricing.pricing}
      paymentStatus={status}
      purchaseType={query.purchaseType ?? null}
      returnContext={query.returnContext ?? null}
    />
  )
}
