import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import type { Question } from "@/@types/questions"
import type { Provider } from "@/@types/vendors"
import Faq from "@/components/template/Faq"
import { getLawyers } from "@/server/actions/provider/getProviders"
import {
  getQuestion,
  getQuestions,
} from "@/server/actions/questions/getQuestions"
import { getInitials, questionFaqs } from "../_components/QuestionsPage"
import {
  TbAlertTriangle,
  TbArrowRight,
  TbClock,
  TbMessageCircle,
  TbPlus,
  TbSearch,
  TbStar,
} from "react-icons/tb"

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const result = await getQuestion(slug)

  if (!result.question) {
    return {
      title: "پرسش حقوقی پیدا نشد | دادلاین",
    }
  }

  return {
    title: `${result.question.title} | پرسش حقوقی دادلاین`,
    description: result.question.excerpt,
  }
}

const QuestionDetailPage = async ({ params }: Props) => {
  const { slug } = await params
  const { question, notFound: isNotFound, error } = await getQuestion(slug)

  if (isNotFound) notFound()

  if (error || !question) {
    return (
      <main className="min-h-screen px-4 pb-16 pt-24">
        <div className="mx-auto max-w-4xl">
          <div className="flex flex-col items-center py-20 text-center text-gray-400">
            <TbAlertTriangle size={32} className="mb-3 text-amber-500" />
            <p className="text-lg text-gray-600 dark:text-gray-300">
              مشکلی در دریافت این پرسش پیش آمد
            </p>
            <p className="mt-1 text-sm">{error}</p>
            <Link
              href="/questions"
              className="mt-5 text-sm text-primary hover:underline"
            >
              بازگشت به پرسش‌ها
            </Link>
          </div>
        </div>
      </main>
    )
  }

  const [relatedQuestionsResult, urgentProviders] = await Promise.all([
    getQuestions({
      category: question.category?.slug,
      per_page: 12,
    }),
    getUrgentProviders(question.category?.slug),
  ])
  const relatedQuestions = pickRelatedQuestions(
    question,
    relatedQuestionsResult.questions,
  )

  return (
    <main className="min-h-screen px-4 pb-16 pt-24">
      <div className="mx-auto max-w-7xl">
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Link href="/" className="hover:text-primary">
            دادلاین
          </Link>
          <span>/</span>
          <Link href="/questions" className="hover:text-primary">
            پرسش و پاسخ حقوقی
          </Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-white">
            {question.title}
          </span>
        </nav>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          <section className="lg:col-span-3">
            <Link
              href="/questions"
              className="mb-5 inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <TbArrowRight size={16} />
              بازگشت به پرسش‌ها
            </Link>

            <article className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                {question.category ? (
                  <Link
                    href={`/questions/category/${question.category.slug}`}
                    className="rounded-md bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-600 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400"
                  >
                    {question.category.name}
                  </Link>
                ) : null}
                <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                  پرسش عمومی
                </span>
              </div>

              <h1 className="text-2xl font-bold leading-10 text-gray-900 dark:text-white md:text-3xl">
                {question.title}
              </h1>

              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <TbClock size={14} />
                  {question.createdAt}
                </span>
                <span className="flex items-center gap-1">
                  <TbMessageCircle size={14} />
                  {question.answersCount.toLocaleString("fa-IR")} پاسخ
                </span>
              </div>

              <div className="mt-6 whitespace-pre-line text-sm leading-8 text-gray-700 dark:text-gray-300">
                {question.body}
              </div>
            </article>

            <section className="mt-8">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  پاسخ متخصصان
                </h2>
                <span className="text-sm text-gray-500">
                  {question.answersCount.toLocaleString("fa-IR")} پاسخ
                </span>
              </div>

              {question.answers && question.answers.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {question.answers.map((answer, index) => (
                    <article
                      key={`${answer.createdAt}-${index}`}
                      className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"
                    >
                      <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-blue-50 text-sm font-bold text-primary dark:bg-blue-900/20">
                          {answer.vendor?.avatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={answer.vendor.avatar}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            getInitials(answer.vendor?.name)
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          {answer.vendor?.profilePath ? (
                            <Link
                              href={answer.vendor.profilePath}
                              className="block truncate text-sm font-bold text-gray-900 hover:text-primary dark:text-white"
                            >
                              {answer.vendor.name}
                            </Link>
                          ) : (
                            <div className="truncate text-sm font-bold text-gray-900 dark:text-white">
                              {answer.vendor?.name ?? "متخصص حقوقی دادلاین"}
                            </div>
                          )}
                          <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                            <span>
                              {answer.vendor?.role ?? "پاسخ‌دهنده حقوقی"}
                            </span>
                            {answer.vendor ? (
                              <span className="flex items-center gap-1">
                                <TbStar
                                  size={12}
                                  className="fill-yellow-400 text-yellow-400"
                                />
                                {answer.vendor.rating.toLocaleString("fa-IR")}{" "}
                                از{" "}
                                {answer.vendor.reviewCount.toLocaleString(
                                  "fa-IR",
                                )}{" "}
                                نظر
                              </span>
                            ) : null}
                          </div>
                        </div>
                        <span className="shrink-0 text-xs text-gray-400">
                          {answer.createdAt}
                        </span>
                      </div>
                      <div className="whitespace-pre-line text-sm leading-8 text-gray-700 dark:text-gray-300">
                        {answer.body}
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-900">
                  هنوز پاسخی برای این پرسش ثبت نشده است.
                </div>
              )}
            </section>
          </section>

          <aside className="lg:col-span-1">
            <QuestionSidebar
              relatedQuestions={relatedQuestions}
              urgentProviders={urgentProviders}
            />
          </aside>
        </div>
      </div>
    </main>
  )
}

const QuestionSidebar = ({
  relatedQuestions,
  urgentProviders,
}: {
  relatedQuestions: Question[]
  urgentProviders: Provider[]
}) => (
  <div className="sticky top-24 flex flex-col gap-5">
    <Link
      href="/pishkhan/questions?new=1"
      className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
    >
      <TbPlus size={18} />
      سوال حقوقی بپرسید
    </Link>

    <form
      action="/questions"
      className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
    >
      <label
        htmlFor="single-question-search"
        className="mb-2 block text-sm font-bold text-gray-900 dark:text-white"
      >
        جستجو در پرسش‌ها
      </label>
      <div className="relative">
        <TbSearch
          size={16}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          id="single-question-search"
          type="search"
          name="search"
          placeholder="عنوان یا متن پرسش..."
          className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-4 pr-9 text-sm text-gray-700 focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-950 dark:text-gray-300"
        />
      </div>
    </form>

    {relatedQuestions.length > 0 ? (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-4 text-sm font-bold text-gray-900 dark:text-white">
          پرسش‌های مرتبط
        </h2>
        <div className="flex flex-col gap-3">
          {relatedQuestions.map((item) => (
            <Link
              key={item.slug}
              href={`/questions/${item.slug}`}
              className="group border-b border-gray-100 pb-3 last:border-b-0 last:pb-0 dark:border-gray-800"
            >
              <div className="line-clamp-2 text-sm font-medium leading-6 text-gray-800 group-hover:text-primary dark:text-gray-200">
                {item.title}
              </div>
              <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                <TbMessageCircle size={12} />
                {item.answersCount.toLocaleString("fa-IR")} پاسخ
              </div>
            </Link>
          ))}
        </div>
      </div>
    ) : null}

    <UrgentConsultation providers={urgentProviders} />

    <Faq
      faqs={questionFaqs}
      title="سؤالات پرتکرار"
      description="درباره ثبت پرسش و نمایش پاسخ‌ها"
    />
  </div>
)

const UrgentConsultation = ({ providers }: { providers: Provider[] }) => {
  if (providers.length === 0) return null

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <h2 className="mb-1 text-sm font-bold text-gray-900 dark:text-white">
        مشاوره حقوقی فوری
      </h2>
      <p className="mb-4 text-xs leading-6 text-gray-500 dark:text-gray-400">
        متخصصان مرتبط با حوزه این پرسش
      </p>
      <div className="flex flex-col gap-3">
        {providers.map((provider) => (
          <Link
            key={provider.slug}
            href={providerHref(provider)}
            className="group flex items-center gap-3"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-blue-50 text-sm font-bold text-primary dark:bg-blue-900/20">
              {provider.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={provider.avatar}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                getInitials(provider.name)
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-gray-900 transition-colors group-hover:text-primary dark:text-white">
                {provider.name}
              </div>
              <div className="truncate text-xs text-gray-500 dark:text-gray-400">
                {provider.role}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
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

function pickRelatedQuestions(question: Question, candidates: Question[]) {
  return candidates
    .filter((candidate) => candidate.slug !== question.slug)
    .map((candidate) => ({
      question: candidate,
      score: similarityScore(question.title, candidate.title),
    }))
    .sort((first, second) => second.score - first.score)
    .slice(0, 5)
    .map((item) => item.question)
}

function similarityScore(source: string, target: string) {
  const sourceWords = tokenizeTitle(source)
  const targetWords = tokenizeTitle(target)

  if (sourceWords.length === 0 || targetWords.length === 0) return 0

  const targetSet = new Set(targetWords)
  const overlap = sourceWords.filter((word) => targetSet.has(word)).length

  return overlap / Math.max(sourceWords.length, targetWords.length)
}

function tokenizeTitle(title: string) {
  return title
    .replace(/[^\u0600-\u06FF\w\s]/g, " ")
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length > 2)
}

function providerHref(provider: Provider) {
  return provider.type === "expert"
    ? `/expert/${provider.slug}`
    : `/lawyer/${provider.slug}`
}

export default QuestionDetailPage
