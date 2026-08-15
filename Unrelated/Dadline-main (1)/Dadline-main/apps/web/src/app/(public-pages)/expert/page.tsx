import type { Metadata } from "next"
import { getExperts } from "@/server/actions/provider/getProviders"
import { getLegalCategories } from "@/server/actions/legal/getLegalCategories"
import { getLocations } from "@/server/actions/locations/getLocations"
import ExpertPageContent from "./_components/ExpertPageContent"

export const metadata: Metadata = {
  title: "کارشناسان حقوقی ایران | دادلاین",
  description:
    "بهترین کارشناسان حقوقی ایران را بر اساس تخصص، عملکرد، تجربه و دیدگاه مشتریان جستجو کنید",
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

const ExpertPage = async ({ searchParams }: { searchParams: SearchParams }) => {
  const params = await searchParams
  const page = Number(params.page) > 0 ? Number(params.page) : 1

  const [expertsResult, categoriesResult, locationsResult] = await Promise.all([
    getExperts({
      search: params.search,
      city: params.city,
      province: params.province,
      category: params.category,
      online: params.online === "true",
      page,
      per_page: PER_PAGE,
    }),
    getLegalCategories(),
    getLocations({ hasProviders: true, type: "expert" }),
  ])

  return (
    <ExpertPageContent
      experts={expertsResult.experts}
      pagination={expertsResult.pagination}
      fetchError={expertsResult.error}
      categories={categoriesResult.categories}
      provinces={locationsResult.data ?? []}
      searchParams={params}
    />
  )
}

export default ExpertPage
