import NotFound from "@/components/shared/NotFound"
import { getPublicContractPreview } from "@/server/actions/contracts/getContracts"
import ContractPreviewClient from "./_components/ContractPreviewClient"

type PageProps = {
  params: Promise<{ uuid: string }>
}

export default async function Page({ params }: PageProps) {
  const { uuid } = await params
  const result = await getPublicContractPreview(uuid)

  if (result.notFound) return <NotFound />

  if (result.error || !result.preview) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-10 dark:bg-gray-950">
        <div className="mx-auto max-w-5xl rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {result.error ?? "پیش‌نمایش قرارداد در دسترس نیست."}
        </div>
      </main>
    )
  }

  return <ContractPreviewClient initialPreview={result.preview} />
}
