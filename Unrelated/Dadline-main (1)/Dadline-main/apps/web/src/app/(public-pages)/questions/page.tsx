import type { Metadata } from "next"
import { getLegalCategories } from "@/server/actions/legal/getLegalCategories"
import { getLawyers } from "@/server/actions/provider/getProviders"
import { getQuestions } from "@/server/actions/questions/getQuestions"
import QuestionsPage from "./_components/QuestionsPage"
import type { QuestionsSearchParams } from "@/server/actions/questions/getQuestions"

export const metadata: Metadata = {
  title: "پرسش و پاسخ حقوقی | دادلاین",
  description:
    "پاسخ به سوالات حقوقی شما توسط وکلای مجرب، قضات خبره و کارشناسان حقوقی متخصص",
}

const PER_PAGE = 12

type Props = {
  searchParams: Promise<QuestionsSearchParams>
}

const Page = async ({ searchParams }: Props) => {
  const params = await searchParams
  const page = Number(params.page) > 0 ? Number(params.page) : 1

  const [questionsResult, categoriesResult, urgentProvidersResult] =
    await Promise.all([
      getQuestions({
        search: params.search,
        category: params.category,
        page,
        per_page: PER_PAGE,
      }),
      getLegalCategories(),
      getUrgentProviders(params.category),
    ])

  return (
    <QuestionsPage
      questions={questionsResult.questions}
      pagination={questionsResult.pagination}
      fetchError={questionsResult.error}
      categories={categoriesResult.categories}
      urgentProviders={urgentProvidersResult}
      searchParams={params}
      activeCategory={params.category}
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

export default Page
