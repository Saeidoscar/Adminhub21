import type { Metadata } from "next"
import Link from "next/link"

import { requireSessionToken } from "@/lib/session"

import { createContractAction } from "../actions"

export const metadata: Metadata = {
  title: "قرارداد جدید",
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

type SearchParams = Promise<{ error?: string }>

export default async function NewContractPage({ searchParams }: { searchParams: SearchParams }) {
  const { error } = await searchParams
  await requireSessionToken("/app/contracts/new")

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <nav aria-label="مسیر" className="text-xs text-muted">
        <Link href="/app/contracts" className="hover:text-foreground">
          قراردادها
        </Link>{" "}
        / قرارداد جدید
      </nav>

      <h1 className="mt-2 text-3xl font-extrabold text-foreground">قرارداد جدید</h1>
      <p className="mt-2 text-sm text-muted">
        قرارداد به‌صورت پیش‌نویس ساخته می‌شود؛ پس از ثبت، هر دو طرف می‌توانند متن را ببینند و امضا کنند.
      </p>

      {error && (
        <p
          role="alert"
          className="mt-6 rounded-xl border border-rose/30 bg-rose/10 p-3 text-sm text-rose"
        >
          {error}
        </p>
      )}

      <form
        action={createContractAction}
        className="mt-8 space-y-5 rounded-2xl border border-border bg-card p-6"
      >
        <div>
          <label htmlFor="title" className="text-sm font-semibold text-foreground">
            عنوان قرارداد
          </label>
          <input
            id="title"
            name="title"
            required
            maxLength={255}
            placeholder="مثلاً قرارداد طراحی لندینگ"
            className="mt-1 h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-navy"
          />
        </div>

        <div>
          <label htmlFor="client_email" className="text-sm font-semibold text-foreground">
            ایمیل طرف مقابل
          </label>
          <input
            id="client_email"
            name="client_email"
            type="email"
            required
            placeholder="client@example.com"
            className="mt-1 h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-navy"
          />
          <p className="mt-1 text-xs text-muted">
            فقط ایمیل دقیق جست‌وجو می‌شود؛ فهرست کاربران در دسترس نیست.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
          <div>
            <label htmlFor="amount" className="text-sm font-semibold text-foreground">
              مبلغ
            </label>
            <input
              id="amount"
              name="amount"
              type="number"
              min="1"
              step="0.01"
              required
              className="mt-1 h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-navy"
            />
          </div>

          <div>
            <label htmlFor="currency" className="text-sm font-semibold text-foreground">
              واحد
            </label>
            <select
              id="currency"
              name="currency"
              defaultValue="IRR"
              className="mt-1 h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm outline-none focus:border-navy"
            >
              <option value="IRR">ریال</option>
              <option value="USD">دلار</option>
              <option value="EUR">یورو</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="description" className="text-sm font-semibold text-foreground">
            توضیحات <span className="font-normal text-muted">(اختیاری)</span>
          </label>
          <textarea
            id="description"
            name="description"
            rows={5}
            className="mt-1 w-full rounded-xl border border-border bg-surface p-4 text-sm leading-7 outline-none focus:border-navy"
          />
        </div>

        <div className="flex flex-wrap gap-2 border-t border-border pt-5">
          <button
            type="submit"
            className="h-11 rounded-xl bg-navy px-6 text-sm font-bold text-white transition hover:bg-navy-light"
          >
            ساخت پیش‌نویس
          </button>
          <Link
            href="/app/contracts"
            className="grid h-11 place-items-center rounded-xl border border-border px-6 text-sm font-semibold text-foreground transition hover:bg-subtle"
          >
            انصراف
          </Link>
        </div>
      </form>
    </div>
  )
}
