import type { Metadata } from "next"
import { getLawyers } from "@/server/actions/provider/getProviders"
import { getLegalCategories } from "@/server/actions/legal/getLegalCategories"
import { getLocations } from "@/server/actions/locations/getLocations"
import LawyerPageContent from "./_components/LawyerPageContent"

export const metadata: Metadata = {
  title: "وکیل پایه یک ایران | دادلاین",
  description:
    "بهترین وکیل‌های پایه یک ایران را بر اساس تخصص، عملکرد، تجربه و دیدگاه مشتریان جستجو کنید",
}

const PER_PAGE = 16

type SearchParams = Promise<{
  search?: string
  city?: string
  province?: string
  category?: string
  online?: string
  page?: string
}>

const LawyerPage = async ({ searchParams }: { searchParams: SearchParams }) => {
  const params = await searchParams
  const page = Number(params.page) > 0 ? Number(params.page) : 1

  const [lawyersResult, categoriesResult, locationsResult] = await Promise.all([
    getLawyers({
      search: params.search,
      city: params.city,
      province: params.province,
      category: params.category,
      online: params.online === "true",
      page,
      per_page: PER_PAGE,
    }),
    getLegalCategories(),
    getLocations({ hasProviders: true, type: "lawyer" }),
  ])

  return (
    <LawyerPageContent
      lawyers={lawyersResult.lawyers}
      pagination={lawyersResult.pagination}
      fetchError={lawyersResult.error}
      categories={categoriesResult.categories}
      provinces={locationsResult.data ?? []}
      searchParams={params}
    />
  )
}

export default LawyerPage
