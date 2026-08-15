import type { Metadata } from "next"
import { notFound } from "next/navigation"
import {
  getLegalCategories,
  type LegalCategory,
} from "@/server/actions/legal/getLegalCategories"
import { getLawyers } from "@/server/actions/provider/getProviders"
import {
  getQuestions,
  type QuestionsSearchParams,
} from "@/server/actions/questions/getQuestions"
import QuestionsPage from "../../_components/QuestionsPage"

const PER_PAGE = 12

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<Omit<QuestionsSearchParams, "category">>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const categoriesResult = await getLegalCategories()
  const category = flattenCategories(categoriesResult.categories).find(
    (item) => item.slug === slug,
  )

  if (!category) {
    return {
      title: "دسته‌بندی پرسش‌ها پیدا نشد | دادلاین",
    }
  }

  return {
    title: `پرسش‌های حقوقی ${category.name} | دادلاین`,
    description: `پرسش و پاسخ حقوقی حوزه ${category.name} در دادلاین`,
  }
}

const QuestionsCategoryPage = async ({ params, searchParams }: Props) => {
  const [{ slug }, queryParams] = await Promise.all([params, searchParams])
  const page = Number(queryParams.page) > 0 ? Number(queryParams.page) : 1

  const [questionsResult, categoriesResult, urgentProviders] =
    await Promise.all([
      getQuestions({
        search: queryParams.search,
        category: slug,
        page,
        per_page: PER_PAGE,
      }),
      getLegalCategories(),
      getUrgentProviders(slug),
    ])

  const category = flattenCategories(categoriesResult.categories).find(
    (item) => item.slug === slug,
  )

  if (!category) notFound()

  return (
    <QuestionsPage
      questions={questionsResult.questions}
      pagination={questionsResult.pagination}
      fetchError={questionsResult.error}
      categories={categoriesResult.categories}
      urgentProviders={urgentProviders}
      searchParams={queryParams}
      basePath={`/questions/category/${slug}`}
      activeCategory={slug}
      titleOverride={`پرسش‌های حقوقی ${category.name}`}
    />
  )
}

async function getUrgentProviders(category?: string) {
  const onlineResult = await getLawyers({
    category,
    online: true,
    per_page: 5,
  })

  if (onlineResult.lawyers.length > 0) return onlineResult.lawyers

  const recentResult = await getLawyers({
    category,
    per_page: 5,
  })

  return recentResult.lawyers
}

function flattenCategories(categories: LegalCategory[]): LegalCategory[] {
  return categories.flatMap((category) => [
    category,
    ...flattenCategories(category.children ?? []),
  ])
}

export default QuestionsCategoryPage
