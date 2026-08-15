import Card from "@/components/ui/Card"
import Container from "@/components/shared/Container"
import classNames from "@/components/ui/utils/classNames"
import { getDashboardQuestion } from "@/server/actions/dashboard-questions/getDashboardQuestions"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import {
  TbArrowRight,
  TbExternalLink,
  TbLock,
  TbMessage2,
  TbWorld,
} from "react-icons/tb"
import QuestionAnswerReview from "../_components/QuestionAnswerReview"
import QuestionAnswerVendorAvatar from "../_components/QuestionAnswerVendorAvatar"
import {
  formatQuestionDate,
  questionStatusClasses,
} from "../_components/question-ui"

type PageProps = {
  params: Promise<{ uuid: string }>
}

export default async function QuestionDetailsPage({ params }: PageProps) {
  const { uuid } = await params
  const result = await getDashboardQuestion(uuid)

  if (result.status === 401) {
    redirect(
      `/sign-in?redirectUrl=/pishkhan/questions/${encodeURIComponent(uuid)}`,
    )
  }

  if (result.status === 404 || !result.question) notFound()

  const question = result.question

  return (
    <Container>
      <div className="space-y-6 pb-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/pishkhan/questions"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-primary"
          >
            <TbArrowRight className="text-lg" /> بازگشت به پرسش‌ها
          </Link>
          {!question.isPrivate && question.slug && (
            <Link
              href={`/questions/${question.slug}`}
              target="_blank"
              className="inline-flex items-center gap-2 rounded-xl bg-primary/10 px-3 py-2 text-xs font-bold text-primary hover:bg-primary/15"
            >
              مشاهده صفحه عمومی <TbExternalLink />
            </Link>
          )}
        </div>

        <Card bodyClass="p-5 sm:p-7">
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={classNames(
                  "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold",
                  question.isPrivate
                    ? "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-200"
                    : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200",
                )}
              >
                {question.isPrivate ? <TbLock /> : <TbWorld />}
                {question.isPrivate ? "پرسش خصوصی" : "پرسش عمومی"}
              </span>
              <span
                className={classNames(
                  "rounded-full px-3 py-1 text-xs ring-1 ring-inset",
                  questionStatusClasses[question.status],
                )}
              >
                {question.statusLabel}
              </span>
              {question.category && (
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  {question.category.name}
                </span>
              )}
            </div>

            <div>
              <h1 className="text-2xl font-black leading-10 text-gray-950 dark:text-white sm:text-3xl">
                {question.title}
              </h1>
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-500">
                <span>{formatQuestionDate(question.createdAt)}</span>
                <span className="inline-flex items-center gap-1">
                  <TbMessage2 /> {question.answersCount.toLocaleString("fa-IR")}{" "}
                  پاسخ
                </span>
              </div>
            </div>

            <div className="whitespace-pre-wrap rounded-2xl bg-gray-50 p-4 text-sm leading-8 text-gray-700 dark:bg-gray-800/60 dark:text-gray-200 sm:p-5">
              {question.body}
            </div>

            <div
              className={`rounded-2xl px-4 py-3 text-xs leading-7 ${
                question.isPrivate
                  ? "bg-violet-50 text-violet-700 dark:bg-violet-950/30 dark:text-violet-200"
                  : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-200"
              }`}
            >
              {question.isPrivate
                ? "این پرسش در صفحات عمومی دادلاین و نتایج گوگل نمایش داده نمی‌شود و فقط برای شما و ارائه‌دهندگان مرتبط قابل مشاهده است."
                : "این پرسش در بخش عمومی دادلاین منتشر شده و می‌تواند توسط موتورهای جست‌وجو ایندکس شود."}
            </div>
          </div>
        </Card>

        <section>
          <div className="mb-4">
            <h2 className="text-xl font-black text-gray-900 dark:text-white">
              پاسخ وکلا و کارشناسان
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              برای هر پاسخ می‌توانید یک امتیاز و دیدگاه مستقل ثبت یا ویرایش کنید.
            </p>
          </div>

          {question.answers.length === 0 ? (
            <Card bodyClass="py-12 text-center">
              <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-gray-100 text-2xl text-gray-400 dark:bg-gray-800">
                <TbMessage2 />
              </span>
              <h3 className="mt-4 font-black text-gray-900 dark:text-white">
                هنوز پاسخی ثبت نشده است
              </h3>
              <p className="mx-auto mt-2 max-w-lg text-sm leading-7 text-gray-500">
                پرسش شما برای ارائه‌دهندگان دارای تخصص مرتبط قابل مشاهده است. پس
                از دریافت پاسخ، این بخش به‌روزرسانی می‌شود.
              </p>
            </Card>
          ) : (
            <div className="space-y-5">
              {question.answers.map((answer, index) => {
                const vendorContent = (
                  <div className="flex min-w-0 items-center gap-3">
                    <QuestionAnswerVendorAvatar
                      name={answer.vendor?.name ?? "ارائه‌دهنده حقوقی دادلاین"}
                      avatarUrl={answer.vendor?.avatar}
                    />
                    <div className="min-w-0">
                      <p className="truncate font-black text-gray-900 dark:text-white">
                        {answer.vendor?.name ?? "ارائه‌دهنده حقوقی دادلاین"}
                      </p>
                      <p className="mt-1 line-clamp-1 text-xs text-gray-500">
                        {answer.vendor?.role ?? "وکیل یا کارشناس حقوقی"}
                      </p>
                    </div>
                  </div>
                )

                return (
                  <Card key={answer.id} bodyClass="p-5 sm:p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      {answer.vendor?.profilePath ? (
                        <Link href={answer.vendor.profilePath}>
                          {vendorContent}
                        </Link>
                      ) : (
                        vendorContent
                      )}
                      <div className="text-left text-xs text-gray-400">
                        <span className="block font-semibold text-primary">
                          پاسخ {index + 1}
                        </span>
                        <span className="mt-1 block">
                          {formatQuestionDate(answer.createdAt)}
                        </span>
                      </div>
                    </div>

                    <div className="my-5 whitespace-pre-wrap border-y border-gray-100 py-5 text-sm leading-8 text-gray-700 dark:border-gray-800 dark:text-gray-200">
                      {answer.body}
                    </div>

                    <QuestionAnswerReview
                      questionUuid={question.uuid}
                      answerId={answer.id}
                      initialReview={answer.review}
                    />
                  </Card>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </Container>
  )
}
