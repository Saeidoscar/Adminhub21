"use client"

import type { DashboardQuestionReview } from "@/@types/dashboardQuestions"
import ServiceReviewForm from "@/components/shared/reviews/ServiceReviewForm"
import { reviewDashboardQuestionAnswer } from "@/server/actions/dashboard-questions/mutateDashboardQuestions"
import { useRouter } from "next/navigation"

type Props = {
  questionUuid: string
  answerId: number
  initialReview: DashboardQuestionReview | null
}

const QuestionAnswerReview = ({
  questionUuid,
  answerId,
  initialReview,
}: Props) => {
  const router = useRouter()

  return (
    <ServiceReviewForm
      initialReview={initialReview}
      title="ارزیابی این پاسخ"
      description="برای همین پاسخ به وکیل یا کارشناس امتیاز دهید و تجربه خود را بنویسید."
      onSubmit={async (value) => {
        const result = await reviewDashboardQuestionAnswer(
          questionUuid,
          answerId,
          value,
        )
        if (result.ok) router.refresh()
        return result
      }}
    />
  )
}

export default QuestionAnswerReview
