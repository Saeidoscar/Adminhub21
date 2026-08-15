import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getLawyers } from "@/server/actions/provider/getProviders"
import { getLegalCategories } from "@/server/actions/legal/getLegalCategories"
import { getLocations } from "@/server/actions/locations/getLocations"
import { findCategoryBySlug } from "../../../_shared/providers/lookup"
import LawyerPageContent from "../../_components/LawyerPageContent"

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
    title: `وکیل پایه یک متخصص ${match.name} | دادلاین`,
    description: `بهترین وکیل‌های متخصص در حوزه ${match.name} را با دادلاین پیدا کنید`,
  }
}

const LawyerSpecialtyPage = async ({ params, searchParams }: Props) => {
  const { specialty } = await params
  const { page: pageParam } = await searchParams
  const page = Number(pageParam) > 0 ? Number(pageParam) : 1

  const [categoriesResult, locationsResult] = await Promise.all([
    getLegalCategories(),
    getLocations({ hasProviders: true, type: "lawyer" }),
  ])

  const match = findCategoryBySlug(categoriesResult.categories, specialty)
  if (!match) notFound()

  const lawyersResult = await getLawyers({
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
      searchParams={{ category: specialty, page: String(page) }}
      titleOverride={`وکیل پایه یک متخصص ${match.name}`}
      breadcrumbExtra={[{ label: match.name }]}
    />
  )
}

export default LawyerSpecialtyPage
