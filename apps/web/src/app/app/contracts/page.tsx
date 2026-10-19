import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"

import { formatAmount, formatDate, listContracts, statusMeta } from "@/lib/contracts"
import { requireSessionToken } from "@/lib/session"

export const metadata: Metadata = {
  title: "قراردادها",
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

const FILTERS: { value: string; label: string }[] = [
  { value: "", label: "همه" },
  { value: "draft", label: "پیش‌نویس" },
  { value: "pending", label: "در انتظار امضا" },
  { value: "active", label: "فعال" },
  { value: "completed", label: "تمام‌شده" },
  { value: "cancelled", label: "لغو‌شده" },
]

type SearchParams = Promise<{ status?: string; page?: string; error?: string }>

export default async function ContractsPage({ searchParams }: { searchParams: SearchParams }) {
  const { status = "", page = "1", error } = await searchParams
  const token = await requireSessionToken("/app/contracts")

  const result = await listContracts(token, { status, page })

  // A cookie that the API no longer accepts means the session is gone: send the
  // visitor back through sign-in rather than showing an empty list.
  if (!result.ok && result.status === 401) {
    redirect("/sign-in?redirectUrl=%2Fapp%2Fcontracts")
  }

  if (!result.ok) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16">
        <h1 className="text-2xl font-extrabold text-foreground">قراردادها</h1>
        <p
          role="alert"
          className="mt-6 rounded-xl border border-rose/30 bg-rose/10 p-4 text-sm text-rose"
        >
          {result.message}
        </p>
      </div>
    )
  }

  const { data: contracts, total, current_page, last_page } = result.data

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <nav aria-label="مسیر" className="text-xs text-muted">
            <Link href="/app" className="hover:text-foreground">
              میزکار
            </Link>{" "}
            / قراردادها
          </nav>
          <h1 className="mt-2 text-3xl font-extrabold text-foreground">قراردادهای من</h1>
          <p className="mt-2 text-sm text-muted">
            {total.toLocaleString("fa-IR")} قرارداد به این حساب مربوط است.
          </p>
        </div>

        <Link
          href="/app/contracts/new"
          className="rounded-xl bg-navy px-5 py-3 text-sm font-bold text-white transition hover:bg-navy-light"
        >
          قرارداد جدید
        </Link>
      </div>

      {error && (
        <p
          role="alert"
          className="mt-6 rounded-xl border border-rose/30 bg-rose/10 p-3 text-sm text-rose"
        >
          {error}
        </p>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-2" role="group" aria-label="فیلتر وضعیت">
        {FILTERS.map((filter) => {
          const active = status === filter.value
          return (
            <Link
              key={filter.value || "all"}
              href={`/app/contracts${filter.value ? `?status=${filter.value}` : ""}`}
              aria-current={active ? "true" : undefined}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                active
                  ? "border-navy bg-navy text-white"
                  : "border-border bg-card text-muted hover:text-foreground"
              }`}
            >
              {filter.label}
            </Link>
          )
        })}
      </div>

      {contracts.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-border bg-card p-10 text-center">
          <p className="text-sm text-muted">
            {status ? "قراردادی با این وضعیت نیست." : "هنوز قراردادی ندارید."}
          </p>
          <Link
            href="/app/contracts/new"
            className="mt-4 inline-block rounded-xl bg-navy px-5 py-2.5 text-sm font-bold text-white transition hover:bg-navy-light"
          >
            ساخت اولین قرارداد
          </Link>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {contracts.map((contract) => {
            const meta = statusMeta(contract.status)
            const counterparty =
              contract.client && contract.client.id !== contract.user_id
                ? contract.client.name
                : (contract.user?.name ?? "—")

            return (
              <li key={contract.id}>
                <Link
                  href={`/app/contracts/${contract.id}`}
                  className="block rounded-2xl border border-border bg-card p-5 transition hover:border-navy/30 hover:shadow-md"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-base font-bold text-foreground">{contract.title}</h2>
                      <p className="mt-1 text-xs text-muted">
                        طرف مقابل: {counterparty} · به‌روزرسانی {formatDate(contract.updated_at)}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${meta.className}`}
                    >
                      {meta.label}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 text-sm">
                    <span className="font-extrabold text-navy">
                      {formatAmount(contract.amount, contract.currency)}
                    </span>
                    <span className="text-xs text-muted">
                      {(contract.signatures?.length ?? 0).toLocaleString("fa-IR")} امضا ·{" "}
                      {contract.clauses?.length ?? 0} بند
                    </span>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      )}

      {last_page > 1 && (
        <nav className="mt-8 flex items-center justify-center gap-3" aria-label="صفحه‌بندی">
          {current_page > 1 && (
            <Link
              href={`/app/contracts?page=${current_page - 1}${status ? `&status=${status}` : ""}`}
              className="rounded-lg border border-border bg-card px-4 py-2 text-sm"
            >
              قبلی
            </Link>
          )}
          <span className="text-xs text-muted">
            صفحه {current_page.toLocaleString("fa-IR")} از {last_page.toLocaleString("fa-IR")}
          </span>
          {current_page < last_page && (
            <Link
              href={`/app/contracts?page=${current_page + 1}${status ? `&status=${status}` : ""}`}
              className="rounded-lg border border-border bg-card px-4 py-2 text-sm"
            >
              بعدی
            </Link>
          )}
        </nav>
      )}
    </div>
  )
}
