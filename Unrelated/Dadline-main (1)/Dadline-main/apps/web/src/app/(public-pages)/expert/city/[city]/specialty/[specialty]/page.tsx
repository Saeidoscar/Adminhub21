import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getExperts } from "@/server/actions/provider/getProviders"
import { getLegalCategories } from "@/server/actions/legal/getLegalCategories"
import { getLocations } from "@/server/actions/locations/getLocations"
import {
  findCategoryBySlug,
  findCityBySlug,
} from "../../../../../_shared/providers/lookup"
import ExpertPageContent from "../../../../_components/ExpertPageContent"

const PER_PAGE = 12

type Props = {
  params: Promise<{ city: string specialty: string }>
  searchParams: Promise<{ page?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city, specialty } = await params
  const [categoriesResult, locationsResult] = await Promise.all([
    getLegalCategories(),
    getLocations({ hasProviders: true, type: "expert" }),
  ])
  const categoryMatch = findCategoryBySlug(
    categoriesResult.categories,
    specialty,
  )
  const cityMatch = findCityBySlug(locationsResult.data ?? [], city)
  if (!categoryMatch || !cityMatch) return { title: "صفحه یافت نشد | دادلاین" }
  return {
    title: `کارشناس حقوقی ${categoryMatch.name} در ${cityMatch.city.name} | دادلاین`,
    description: `بهترین کارشناسان حقوقی متخصص ${categoryMatch.name} در ${cityMatch.city.name} را با دادلاین پیدا کنید`,
  }
}

const ExpertCitySpecialtyPage = async ({ params, searchParams }: Props) => {
  const { city, specialty } = await params
  const { page: pageParam } = await searchParams
  const page = Number(pageParam) > 0 ? Number(pageParam) : 1

  const [categoriesResult, locationsResult] = await Promise.all([
    getLegalCategories(),
    getLocations({ hasProviders: true, type: "expert" }),
  ])

  const categoryMatch = findCategoryBySlug(
    categoriesResult.categories,
    specialty,
  )
  const cityMatch = findCityBySlug(locationsResult.data ?? [], city)
  if (!categoryMatch || !cityMatch) notFound()

  const expertsResult = await getExperts({
    city,
    category: specialty,
    page,
    per_page: PER_PAGE,
  })

  return (
    <ExpertPageContent
      experts={expertsResult.experts}
      pagination={expertsResult.pagination}
      fetchError={expertsResult.error}
      categories={categoriesResult.categories}
      provinces={locationsResult.data ?? []}
      searchParams={{ city, category: specialty, page: String(page) }}
      titleOverride={`کارشناس حقوقی ${categoryMatch.name} در ${cityMatch.city.name}`}
      breadcrumbExtra={[
        { label: cityMatch.city.name },
        { label: categoryMatch.name },
      ]}
    />
  )
}

export default ExpertCitySpecialtyPage
