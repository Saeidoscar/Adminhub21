import type { Metadata } from "next"
import { getProducts } from "@/server/actions/products/getProducts"
import DocumentPageContent from "./_components/DocumentPageContent"

export const metadata: Metadata = {
  title: "بانک مستندات حقوقی دادلاین",
  description:
    "تمامی مستندات حقوقی موجود در بانک دادلاین توسط وکلای پایه یک دادگستری و کارشناسان حقوقی متخصص و با تجربه در زمینه‌های مختلف حقوقی تدوین شده‌اند.",
}

type SearchParams = Promise<{
  type?: string
  category?: string
  vendor?: string
  search?: string
  sort?: string
  page?: string
}>

const DocumentPage = async ({
  searchParams,
}: {
  searchParams: SearchParams
}) => {
  const params = await searchParams
  const page = Number.parseInt(params.page ?? "1", 10)
  const result = await getProducts({
    type: params.type,
    category: params.category,
    vendor: params.vendor,
    search: params.search,
    sort: params.sort,
    page: Number.isFinite(page) && page > 0 ? page : 1,
  })

  return (
    <DocumentPageContent
      products={result.products}
      filters={result.filters}
      pagination={result.pagination}
      error={result.error}
      initialType={params.type}
      initialCategory={params.category}
      initialVendor={params.vendor}
      initialSearch={params.search}
      initialSort={params.sort}
    />
  )
}

export default DocumentPage
