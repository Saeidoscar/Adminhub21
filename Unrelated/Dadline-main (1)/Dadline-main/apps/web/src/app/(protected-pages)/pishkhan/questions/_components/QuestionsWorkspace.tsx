"use client"

import type {
  DashboardQuestion,
  DashboardQuestionMeta,
  DashboardQuestionPagination,
} from "@/@types/dashboardQuestions"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import Dialog from "@/components/ui/Dialog"
import classNames from "@/components/ui/utils/classNames"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useMemo, useState } from "react"
import {
  TbArrowLeft,
  TbHelpCircle,
  TbLock,
  TbMessage2,
  TbPlus,
  TbWorld,
} from "react-icons/tb"
import QuestionCreateForm from "./QuestionCreateForm"
import { formatQuestionDate, questionStatusClasses } from "./question-ui"

type Props = {
  questions: DashboardQuestion[]
  meta: DashboardQuestionMeta
  pagination: DashboardQuestionPagination
  error: string | null
  initialCreateOpen?: boolean
}

const QuestionsWorkspace = ({
  questions,
  meta,
  pagination,
  error,
  initialCreateOpen = false,
}: Props) => {
  const [createOpen, setCreateOpen] = useState(initialCreateOpen)

  const stats = useMemo(
    () => ({
      total: pagination.total,
      public: questions.filter((question) => !question.isPrivate).length,
      private: questions.filter((question) => question.isPrivate).length,
      answered: questions.filter((question) => question.answersCount > 0)
        .length,
    }),
    [pagination.total, questions],
  )

  return (
    <div className="space-y-6 pb-8">
      <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="relative overflow-hidden bg-linear-to-l from-primary/10 via-white to-white px-5 py-6 dark:from-primary/20 dark:via-gray-900 dark:to-gray-900 sm:px-7 sm:py-8">
          <div className="absolute -left-16 -top-20 size-56 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-3xl text-white shadow-lg shadow-primary/20">
                <TbHelpCircle />
              </span>
              <div>
                <h1 className="text-2xl font-black text-gray-950 dark:text-white sm:text-3xl">
                  پرسش‌های حقوقی من
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-7 text-gray-600 dark:text-gray-300">
                  مسئله حقوقی خود را ثبت کنید تا وکلا و کارشناسان مرتبط با همان
                  حوزه تخصصی به آن پاسخ دهند.
                </p>
              </div>
            </div>
            <Button
              variant="solid"
              icon={<TbPlus />}
              onClick={() => setCreateOpen(true)}
            >
              پرسش جدید
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 border-t border-gray-100 dark:border-gray-800 sm:grid-cols-4">
          <StatItem label="کل پرسش‌ها" value={stats.total} />
          <StatItem label="عمومی در این صفحه" value={stats.public} />
          <StatItem label="خصوصی در این صفحه" value={stats.private} />
          <StatItem label="پاسخ‌داده‌شده" value={stats.answered} />
        </div>
      </section>

      {error && (
        <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </div>
      )}

      {questions.length === 0 ? (
        <Card className="border-dashed" bodyClass="py-14 text-center">
          <span className="mx-auto flex size-16 items-center justify-center rounded-3xl bg-gray-100 text-3xl text-gray-400 dark:bg-gray-800">
            <TbMessage2 />
          </span>
          <h2 className="mt-5 text-lg font-black text-gray-900 dark:text-white">
            هنوز پرسشی ثبت نکرده‌اید
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-7 text-gray-500">
            سؤال خود را با جزئیات کافی بنویسید و دسته‌بندی مناسب را انتخاب کنید
            تا به متخصصان مرتبط نمایش داده شود.
          </p>
          <Button
            className="mt-5"
            variant="solid"
            icon={<TbPlus />}
            onClick={() => setCreateOpen(true)}
          >
            ثبت اولین پرسش
          </Button>
        </Card>
      ) : (
        <section>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-gray-900 dark:text-white">
                فهرست پرسش‌ها
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                برای مشاهده پاسخ‌ها و ثبت دیدگاه، وارد جزئیات هر پرسش شوید.
              </p>
            </div>
            <span className="text-xs text-gray-500">
              {pagination.total.toLocaleString("fa-IR")} پرسش
            </span>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {questions.map((question) => (
              <QuestionCard key={question.uuid} question={question} />
            ))}
          </div>
          {pagination.lastPage > 1 && (
            <QuestionsPagination pagination={pagination} />
          )}
        </section>
      )}

      <Dialog
        isOpen={createOpen}
        width={760}
        onClose={() => setCreateOpen(false)}
        onRequestClose={() => setCreateOpen(false)}
        contentClassName="max-h-[90vh] overflow-y-auto p-5 sm:p-7"
      >
        <div className="mb-6 pl-8">
          <h2 className="text-xl font-black text-gray-900 dark:text-white">
            ثبت پرسش حقوقی جدید
          </h2>
          <p className="mt-1 text-sm leading-7 text-gray-500">
            اطلاعات را دقیق وارد کنید؛ عنوان سؤال مبنای ساخت نشانی عمومی آن
            خواهد بود.
          </p>
        </div>
        <QuestionCreateForm
          meta={meta}
          onCreated={() => setCreateOpen(false)}
        />
      </Dialog>
    </div>
  )
}

const StatItem = ({ label, value }: { label: string value: number }) => (
  <div className="border-l border-gray-100 px-4 py-4 text-center last:border-l-0 dark:border-gray-800 sm:px-6">
    <p className="text-xl font-black text-gray-900 dark:text-white">
      {value.toLocaleString("fa-IR")}
    </p>
    <p className="mt-1 text-xs text-gray-500">{label}</p>
  </div>
)

const QuestionCard = ({ question }: { question: DashboardQuestion }) => (
  <Card
    className="group h-full transition duration-200 hover:-translate-y-1 hover:shadow-lg"
    bodyClass="flex h-full flex-col p-5"
  >
    <div className="flex items-start justify-between gap-3">
      <span
        className={classNames(
          "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
          question.isPrivate
            ? "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-200"
            : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200",
        )}
      >
        {question.isPrivate ? <TbLock /> : <TbWorld />}
        {question.isPrivate ? "خصوصی" : "عمومی"}
      </span>
      <span
        className={classNames(
          "rounded-full px-2.5 py-1 text-[11px] ring-1 ring-inset",
          questionStatusClasses[question.status],
        )}
      >
        {question.statusLabel}
      </span>
    </div>

    <div className="mt-4 min-h-0 flex-1">
      {question.category && (
        <span className="text-xs font-semibold text-primary">
          {question.category.name}
        </span>
      )}
      <h3 className="mt-2 line-clamp-2 text-base font-black leading-7 text-gray-900 transition group-hover:text-primary dark:text-white">
        {question.title}
      </h3>
      <p className="mt-2 line-clamp-3 text-sm leading-7 text-gray-500">
        {question.excerpt}
      </p>
    </div>

    <div className="mt-5 border-t border-gray-100 pt-4 text-xs text-gray-500 dark:border-gray-800">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span>{formatQuestionDate(question.createdAt)}</span>
        <span className="inline-flex items-center gap-1 font-semibold">
          <TbMessage2 /> {question.answersCount.toLocaleString("fa-IR")} پاسخ
        </span>
      </div>
      <div className="mt-3 flex items-center justify-end">
        <Link
          href={`/pishkhan/questions/${question.uuid}`}
          className="inline-flex items-center gap-1 font-bold text-primary hover:text-primary-mild"
        >
          مشاهده جزئیات <TbArrowLeft />
        </Link>
      </div>
    </div>
  </Card>
)

const QuestionsPagination = ({
  pagination,
}: {
  pagination: DashboardQuestionPagination
}) => {
  const searchParams = useSearchParams()
  const pageLink = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", String(page))
    return `/pishkhan/questions?${params.toString()}`
  }

  return (
    <div className="mt-6 flex items-center justify-center gap-4 rounded-2xl border border-gray-200 bg-white p-3 text-sm dark:border-gray-800 dark:bg-gray-900">
      <Link
        href={pageLink(Math.max(1, pagination.currentPage - 1))}
        className={classNames(
          "rounded-xl px-4 py-2 font-semibold",
          pagination.currentPage <= 1
            ? "pointer-events-none text-gray-300"
            : "text-primary hover:bg-primary/10",
        )}
      >
        قبلی
      </Link>
      <span className="text-gray-500">
        صفحه {pagination.currentPage.toLocaleString("fa-IR")} از{" "}
        {pagination.lastPage.toLocaleString("fa-IR")}
      </span>
      <Link
        href={pageLink(
          Math.min(pagination.lastPage, pagination.currentPage + 1),
        )}
        className={classNames(
          "rounded-xl px-4 py-2 font-semibold",
          pagination.currentPage >= pagination.lastPage
            ? "pointer-events-none text-gray-300"
            : "text-primary hover:bg-primary/10",
        )}
      >
        بعدی
      </Link>
    </div>
  )
}

export default QuestionsWorkspace
