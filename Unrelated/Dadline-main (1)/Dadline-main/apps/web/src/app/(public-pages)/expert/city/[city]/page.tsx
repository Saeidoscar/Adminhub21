import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getExperts } from "@/server/actions/provider/getProviders"
import { getLegalCategories } from "@/server/actions/legal/getLegalCategories"
import { getLocations } from "@/server/actions/locations/getLocations"
import { findCityBySlug } from "../../../_shared/providers/lookup"
import ExpertPageContent from "../../_components/ExpertPageContent"

const PER_PAGE = 20

type Props = {
  params: Promise<{ city: string }>
  searchParams: Promise<{ page?: string }>
}

const loadContext = async (citySlug: string) => {
  const locationsResult = await getLocations({
    hasProviders: true,
    type: "expert",
  })
  const provinces = locationsResult.data ?? []
  const match = findCityBySlug(provinces, citySlug)
  return { provinces, match }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = await params
  const { match } = await loadContext(city)
  if (!match) return { title: "صفحه یافت نشد | دادلاین" }
  return {
    title: `کارشناس حقوقی در ${match.city.name} | دادلاین`,
    description: `بهترین کارشناسان حقوقی در ${match.city.name} را با دادلاین پیدا کنید`,
  }
}

const ExpertCityPage = async ({ params, searchParams }: Props) => {
  const { city } = await params
  const { page: pageParam } = await searchParams
  const page = Number(pageParam) > 0 ? Number(pageParam) : 1

  const [{ provinces, match }, categoriesResult] = await Promise.all([
    loadContext(city),
    getLegalCategories(),
  ])

  if (!match) notFound()

  const expertsResult = await getExperts({ city, page, per_page: PER_PAGE })

  return (
    <ExpertPageContent
      experts={expertsResult.experts}
      pagination={expertsResult.pagination}
      fetchError={expertsResult.error}
      categories={categoriesResult.categories}
      provinces={provinces}
      searchParams={{ city, page: String(page) }}
      titleOverride={`کارشناس حقوقی در ${match.city.name}`}
      breadcrumbExtra={[{ label: match.city.name }]}
    />
  )
}

export default ExpertCityPage
