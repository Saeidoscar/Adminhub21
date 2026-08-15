import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getExperts } from "@/server/actions/provider/getProviders"
import { getLegalCategories } from "@/server/actions/legal/getLegalCategories"
import { getLocations } from "@/server/actions/locations/getLocations"
import { findCategoryBySlug } from "../../../_shared/providers/lookup"
import ExpertPageContent from "../../_components/ExpertPageContent"

const PER_PAGE = 12

type Props = {
  params: Promise<{ specialty: string }>
  searchParams: Promise<{ page?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { specialty } = await params
  const { categories } = await getLegalCategories()
  const match = findCategoryBySlug(categories, specialty)
  if (!match) return { title: "صفحه یافت نشد | دادلاین" }
  return {
    title: `کارشناس حقوقی متخصص ${match.name} | دادلاین`,
    description: `بهترین کارشناسان حقوقی متخصص در حوزه ${match.name} را با دادلاین پیدا کنید`,
  }
}

const ExpertSpecialtyPage = async ({ params, searchParams }: Props) => {
  const { specialty } = await params
  const { page: pageParam } = await searchParams
  const page = Number(pageParam) > 0 ? Number(pageParam) : 1

  const [categoriesResult, locationsResult] = await Promise.all([
    getLegalCategories(),
    getLocations({ hasProviders: true, type: "expert" }),
  ])

  const match = findCategoryBySlug(categoriesResult.categories, specialty)
  if (!match) notFound()

  const expertsResult = await getExperts({
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
      searchParams={{ category: specialty, page: String(page) }}
      titleOverride={`کارشناس حقوقی متخصص ${match.name}`}
      breadcrumbExtra={[{ label: match.name }]}
    />
  )
}

export default ExpertSpecialtyPage
