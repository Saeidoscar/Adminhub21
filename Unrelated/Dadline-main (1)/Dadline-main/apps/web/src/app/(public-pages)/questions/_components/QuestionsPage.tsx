import type { Question } from "@/@types/questions"
import type { Provider } from "@/@types/vendors"
import Faq from "@/components/template/Faq"
import type {
  QuestionsPagination,
  QuestionsSearchParams,
} from "@/server/actions/questions/getQuestions"
import Link from "next/link"
import {
  TbAlertTriangle,
  TbChevronLeft,
  TbClock,
  TbMessageCircle,
  TbPlus,
  TbSearch,
  TbStar,
} from "react-icons/tb"
import Pagination from "../../_shared/providers/Pagination"
import type { LegalCategory } from "../../_shared/providers/types"

type Props = {
  questions: Question[]
  pagination: QuestionsPagination
  fetchError: string | null
  categories: LegalCategory[]
  urgentProviders: Provider[]
  searchParams: QuestionsSearchParams
  basePath?: string
  activeCategory?: string
  titleOverride?: string
}

export const questionFaqs = [
  {
    id: "who-answers-legal-questions",
    q: "پرسش حقوقی توسط چه کسی پاسخ داده می‌شود؟",
    a: "پرسش‌های عمومی توسط وکلا و کارشناسان حقوقی فعال در دادلاین بررسی و پاسخ داده می‌شوند. در هر پاسخ، نام و نقش پاسخ‌دهنده نمایش داده می‌شود.",
  },
  {
    id: "public-or-private-question",
    q: "آیا همه پرسش‌ها در سایت نمایش داده می‌شوند؟",
    a: "فقط پرسش‌های عمومی و تاییدشده در این صفحه نمایش داده می‌شوند. پرسش‌های خصوصی در آرشیو عمومی قرار نمی‌گیرند.",
  },
  {
    id: "ask-new-question",
    q: "چطور پرسش جدید ثبت کنم؟",
    a: "با ورود به حساب کاربری و انتخاب گزینه ثبت پرسش، موضوع حقوقی خود را بنویسید و حوزه مرتبط را انتخاب کنید تا درخواست شما برای بررسی ارسال شود.",
  },
]

export const getInitials = (name: string | null | undefined) => {
  const parts = (name || "دادلاین").trim().split(" ").filter(Boolean)
  return parts.length >= 2
    ? `${parts[0][0]}${parts[1][0]}`
    : (parts[0] || "د").slice(0, 2)
}

// export const formatQuestionDate = (value: string | null) => {
//     if (!value) return 'تاریخ نامشخص'

//     return new Intl.DateTimeFormat('fa-IR', {
//         year: 'numeric',
//         month: 'long',
//         day: 'numeric',
//     }).format(new Date(value))
// }

const buildHref = (
  basePath: string,
  params: Record<string, string | undefined>,
) => {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value) query.set(key, value)
  })
  const qs = query.toString()
  return qs ? `${basePath}?${qs}` : basePath
}

const flattenCategories = (categories: LegalCategory[]): LegalCategory[] =>
  categories.flatMap((category) => [
    category,
    ...flattenCategories(category.children ?? []),
  ])

const categoryHref = (category: LegalCategory, search?: string) =>
  buildHref(`/questions/category/${category.slug}`, { search })

const providerHref = (provider: Provider) =>
  provider.type === "expert"
    ? `/expert/${provider.slug}`
    : `/lawyer/${provider.slug}`

const QuestionsPage = ({
  questions,
  pagination,
  fetchError,
  categories,
  urgentProviders,
  searchParams,
  basePath = "/questions",
  activeCategory,
  titleOverride,
}: Props) => {
  const flatCategories = flattenCategories(categories)
  const activeCategoryItem = flatCategories.find(
    (category) => category.slug === activeCategory,
  )
  const title =
    titleOverride ??
    (activeCategoryItem
      ? `پرسش‌های حقوقی ${activeCategoryItem.name}`
      : "پرسش و پاسخ حقوقی آنلاین")

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
          {activeCategoryItem ? (
            <>
              <span>/</span>
              <span className="text-gray-900 dark:text-white">
                {activeCategoryItem.name}
              </span>
            </>
          ) : null}
        </nav>

        <div className="mb-8">
          <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">
            {title}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            پاسخ به سوالات حقوقی شما توسط وکلای مجرب پایه‌یک، قضات خبره و
            کارشناسان حقوقی متخصص
          </p>
        </div>

        <QuestionFilters
          basePath={basePath}
          categories={flatCategories}
          activeCategory={activeCategory}
          search={searchParams.search}
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          <section className="lg:col-span-3">
            {fetchError ? (
              <div className="flex flex-col items-center py-20 text-center text-gray-400">
                <TbAlertTriangle size={32} className="mb-3 text-amber-500" />
                <p className="text-lg text-gray-600 dark:text-gray-300">
                  مشکلی در دریافت پرسش‌ها پیش آمد
                </p>
                <p className="mt-1 text-sm">{fetchError}</p>
              </div>
            ) : questions.length === 0 ? (
              <div className="py-20 text-center text-gray-400">
                <p className="text-lg">پرسشی با این مشخصات پیدا نشد</p>
                <Link
                  href="/questions"
                  className="mt-2 inline-block text-sm text-primary hover:underline"
                >
                  مشاهده همه پرسش‌ها
                </Link>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-3">
                  {questions.map((question) => (
                    <QuestionCard key={question.slug} question={question} />
                  ))}
                </div>
                <Pagination
                  basePath={basePath}
                  currentParams={{
                    search: searchParams.search,
                  }}
                  meta={pagination}
                />
              </>
            )}
          </section>

          <aside className="lg:col-span-1">
            <div className="sticky top-24 flex flex-col gap-5">
              <UrgentConsultation providers={urgentProviders} />
              <Faq
                faqs={questionFaqs}
                title="سوالات متداول"
                description="آنچه باید درباره پرسش حقوقی بدانید"
              />
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}

const QuestionFilters = ({
  basePath,
  categories,
  activeCategory,
  search,
}: {
  basePath: string
  categories: LegalCategory[]
  activeCategory?: string
  search?: string
}) => (
  <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
    <form action={basePath} className="flex flex-col gap-3 sm:flex-row">
      <div className="relative flex-1">
        <TbSearch
          size={16}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="search"
          name="search"
          defaultValue={search}
          placeholder="جستجو در پرسش‌های حقوقی..."
          className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-4 pr-9 text-sm text-gray-700 focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-950 dark:text-gray-300"
        />
      </div>
      <button
        type="submit"
        className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 transition-colors hover:border-primary hover:text-primary dark:border-gray-700 dark:text-gray-300"
      >
        جستجو
      </button>
      <Link
        href="/pishkhan/questions?new=1"
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
      >
        <TbPlus size={18} />
        پرسش حقوقی بپرسید
      </Link>
    </form>

    <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
      <Link
        href={buildHref("/questions", { search })}
        className={`shrink-0 rounded-full border px-3 py-1.5 text-xs transition-colors ${
          !activeCategory
            ? "border-primary bg-primary text-white"
            : "border-gray-200 text-gray-600 hover:border-primary hover:text-primary dark:border-gray-700 dark:text-gray-300"
        }`}
      >
        همه حوزه‌ها
      </Link>
      {categories.map((category) => (
        <Link
          key={category.slug}
          href={categoryHref(category, search)}
          className={`shrink-0 rounded-full border px-3 py-1.5 text-xs transition-colors ${
            activeCategory === category.slug
              ? "border-primary bg-primary text-white"
              : "border-gray-200 text-gray-600 hover:border-primary hover:text-primary dark:border-gray-700 dark:text-gray-300"
          }`}
        >
          {category.name}
        </Link>
      ))}
    </div>
  </div>
)

const QuestionCard = ({ question }: { question: Question }) => {
  const remainingAnswers = Math.max(
    0,
    question.answersCount - question.latestResponders.length,
  )

  return (
    <Link
      href={`/questions/${question.slug}`}
      className="group block rounded-2xl border border-gray-200 bg-white p-5 transition-all hover:border-primary hover:shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:hover:border-primary"
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {question.category ? (
          <span className="rounded-md bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
            {question.category.name}
          </span>
        ) : null}
      </div>
      <h2 className="text-sm font-bold leading-7 text-gray-900 transition-colors group-hover:text-primary dark:text-white">
        {question.title}
      </h2>
      <p className="mt-2 line-clamp-2 text-xs leading-6 text-gray-500 dark:text-gray-400">
        {question.excerpt}
      </p>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {question.latestResponders.length > 0 ? (
            <div className="flex -space-x-2 rtl:space-x-reverse">
              {question.latestResponders.map((responder, index) => (
                <span
                  key={`${responder.profilePath}-${responder.name}-${index}`}
                  title={responder.name ?? "متخصص حقوقی"}
                  className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-blue-50 text-[10px] font-bold text-primary dark:border-gray-900 dark:bg-blue-900/20"
                >
                  {responder.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={responder.avatar}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    getInitials(responder.name)
                  )}
                </span>
              ))}
            </div>
          ) : null}
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <TbMessageCircle size={13} />
            {remainingAnswers > 0
              ? `+${remainingAnswers.toLocaleString("fa-IR")} پاسخ`
              : `${question.answersCount.toLocaleString("fa-IR")} پاسخ`}
          </span>
        </div>
        <span className="flex items-center gap-1 text-xs text-gray-400">
          <TbClock size={13} />
          {question.createdAt}
        </span>
      </div>
    </Link>
  )
}

const UrgentConsultation = ({ providers }: { providers: Provider[] }) => {
  if (providers.length === 0) return null

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <h3 className="mb-1 text-sm font-bold text-gray-900 dark:text-white">
        مشاوره حقوقی فوری
      </h3>
      <p className="mb-4 text-xs leading-6 text-gray-500 dark:text-gray-400">
        وکلا و کارشناسان مرتبط
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
              {provider.rating > 0 ? (
                <div className="mt-0.5 flex items-center gap-1">
                  <TbStar
                    size={11}
                    className="fill-yellow-400 text-yellow-400"
                  />
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {provider.rating.toLocaleString("fa-IR")} /{" "}
                    {provider.reviewCount.toLocaleString("fa-IR")} نظر
                  </span>
                </div>
              ) : null}
            </div>
            <TbChevronLeft size={14} className="shrink-0 text-gray-400" />
          </Link>
        ))}
      </div>
    </div>
  )
}

export default QuestionsPage
