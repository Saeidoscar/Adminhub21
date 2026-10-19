import type { Metadata } from "next"
import Link from "next/link"

import { requireSessionToken } from "@/lib/session"
import { createTicketAction } from "../actions"

export const metadata: Metadata = {
  title: "تیکت جدید",
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

const PRIORITIES = [
  { value: "low", label: "کم" },
  { value: "medium", label: "معمولی" },
  { value: "high", label: "زیاد" },
  { value: "urgent", label: "فوری" },
] as const

type SearchParams = Promise<{ error?: string }>

export default async function NewTicketPage({ searchParams }: { searchParams: SearchParams }) {
  const { error } = await searchParams
  await requireSessionToken("/app/tickets/new")

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <nav aria-label="مسیر" className="text-xs text-muted">
        <Link href="/app" className="hover:text-foreground">
          میزکار
        </Link>{" "}
        /{" "}
        <Link href="/app/tickets" className="hover:text-foreground">
          تیکت‌ها
        </Link>{" "}
        / تیکت جدید
      </nav>

      <h1 className="mt-2 text-3xl font-extrabold text-foreground">تیکت جدید</h1>
      <p className="mt-2 text-sm text-muted">
        موضوع و توضیحات را کامل بنویسید تا کارشناس پشتیبانی سریع‌تر پاسخ دهد.
      </p>

      {error && (
        <p
          role="alert"
          className="mt-5 rounded-xl border border-rose/30 bg-rose/10 p-3 text-sm text-rose"
        >
          {error}
        </p>
      )}

      <form
        action={createTicketAction}
        className="mt-8 space-y-5 rounded-2xl border border-border bg-card p-6"
      >
        <div>
          <label htmlFor="subject" className="block text-sm font-semibold text-foreground">
            موضوع
          </label>
          <input
            id="subject"
            name="subject"
            required
            maxLength={255}
            className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-navy"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-foreground">
            توضیحات
          </label>
          <textarea
            id="description"
            name="description"
            required
            rows={6}
            className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm leading-7 text-foreground outline-none focus:border-navy"
          />
        </div>

        <fieldset>
          <legend className="text-sm font-semibold text-foreground">اولویت</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {PRIORITIES.map((item) => (
              <label
                key={item.value}
                className="flex cursor-pointer items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm text-muted has-checked:border-navy has-checked:text-foreground"
              >
                <input
                  type="radio"
                  name="priority"
                  value={item.value}
                  defaultChecked={item.value === "medium"}
                  className="accent-navy"
                />
                {item.label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="rounded-xl bg-navy px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-navy/90"
          >
            ثبت تیکت
          </button>
          <Link href="/app/tickets" className="text-sm text-muted hover:text-foreground">
            انصراف
          </Link>
        </div>
      </form>
    </div>
  )
}
