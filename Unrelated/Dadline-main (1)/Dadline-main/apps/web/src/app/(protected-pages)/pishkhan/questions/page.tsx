import Container from "@/components/shared/Container"
import {
  getDashboardQuestionMeta,
  getDashboardQuestions,
} from "@/server/actions/dashboard-questions/getDashboardQuestions"
import { redirect } from "next/navigation"
import QuestionsWorkspace from "./_components/QuestionsWorkspace"

type PageProps = {
  searchParams: Promise<{ page?: string new?: string }>
}

export default async function QuestionsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const page = Math.max(1, Number(params.page) || 1)
  const [list, metadata] = await Promise.all([
    getDashboardQuestions(page),
    getDashboardQuestionMeta(),
  ])

  if (list.status === 401 || metadata.status === 401) {
    redirect("/sign-in?redirectUrl=/pishkhan/questions")
  }

  if (!metadata.meta) redirect("/pishkhan")

  return (
    <Container>
      <QuestionsWorkspace
        questions={list.questions}
        meta={metadata.meta}
        pagination={list.pagination}
        error={list.error ?? metadata.error}
        initialCreateOpen={params.new === "1"}
      />
    </Container>
  )
}
