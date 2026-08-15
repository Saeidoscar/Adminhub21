import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getLawyers } from "@/server/actions/provider/getProviders"
import { getLegalCategories } from "@/server/actions/legal/getLegalCategories"
import { getLocations } from "@/server/actions/locations/getLocations"
import {
  findCategoryBySlug,
  findCityBySlug,
} from "../../../../../_shared/providers/lookup"
import LawyerPageContent from "../../../../_components/LawyerPageContent"

const PER_PAGE = 12

type Props = {
  params: Promise<{ city: string specialty: string }>
  searchParams: Promise<{ page?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city, specialty } = await params
  const [categoriesResult, locationsResult] = await Promise.all([
    getLegalCategories(),
    getLocations({ hasProviders: true, type: "lawyer" }),
  ])
  const categoryMatch = findCategoryBySlug(
    categoriesResult.categories,
    specialty,
  )
  const cityMatch = findCityBySlug(locationsResult.data ?? [], city)
  if (!categoryMatch || !cityMatch) return { title: "صفحه یافت نشد | دادلاین" }
  return {
    title: `وکیل پایه یک ${categoryMatch.name} در ${cityMatch.city.name} | دادلاین`,
    description: `بهترین وکیل‌های متخصص ${categoryMatch.name} در ${cityMatch.city.name} را با دادلاین پیدا کنید`,
  }
}

const LawyerCitySpecialtyPage = async ({ params, searchParams }: Props) => {
  const { city, specialty } = await params
  const { page: pageParam } = await searchParams
  const page = Number(pageParam) > 0 ? Number(pageParam) : 1

  const [categoriesResult, locationsResult] = await Promise.all([
    getLegalCategories(),
    getLocations({ hasProviders: true, type: "lawyer" }),
  ])

  const categoryMatch = findCategoryBySlug(
    categoriesResult.categories,
    specialty,
  )
  const cityMatch = findCityBySlug(locationsResult.data ?? [], city)
  if (!categoryMatch || !cityMatch) notFound()

  const lawyersResult = await getLawyers({
    city,
    category: specialty,
    page,
    per_page: PER_PAGE,
  })

  return (
    <LawyerPageContent
      lawyers={lawyersResult.lawyers}
      pagination={lawyersResult.pagination}
      fetchError={lawyersResult.error}
      categories={categoriesResult.categories}
      provinces={locationsResult.data ?? []}
      searchParams={{ city, category: specialty, page: String(page) }}
      titleOverride={`وکیل پایه یک ${categoryMatch.name} در ${cityMatch.city.name}`}
      breadcrumbExtra={[
        { label: cityMatch.city.name },
        { label: categoryMatch.name },
      ]}
    />
  )
}

export default LawyerCitySpecialtyPage
