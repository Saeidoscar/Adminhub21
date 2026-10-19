import type { Metadata } from "next"
import Link from "next/link"

import { getMe, isStaff, requireSessionToken, type SessionUser } from "@/lib/session"
import {
  formatDateTime,
  listTickets,
  priorityMeta,
  statusMeta,
  type TicketPage,
} from "@/lib/tickets"

export const metadata: Metadata = {
  title: "تیکت‌ها",
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

const FILTERS = [
  { id: "", label: "همه" },
  { id: "open", label: "باز" },
  { id: "in_progress", label: "در حال بررسی" },
  { id: "resolved", label: "حل‌شده" },
  { id: "closed", label: "بسته" },
] as const

type SearchParams = Promise<{ status?: string; page?: string; ok?: string; error?: string }>

export default async function TicketsPage({ searchParams }: { searchParams: SearchParams }) {
  const { status = "", page = "1", ok, error } = await searchParams
  const token = await requireSessionToken("/app/tickets")

  const [me, result] = await Promise.all([getMe(token), listTickets(token, { status, page })])

  if (!result.ok) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16">
        <h1 className="text-2xl font-extrabold text-foreground">تیکت‌ها</h1>
        <p
          role="alert"
          className="mt-6 rounded-xl border border-rose/30 bg-rose/10 p-4 text-sm text-rose"
        >
          {result.message}
        </p>
      </div>
    )
  }

  const tickets = result.data as TicketPage
  const rows = tickets.data ?? []
  const staff = isStaff(me as SessionUser | null)

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <nav aria-label="مسیر" className="text-xs text-muted">
        <Link href="/app" className="hover:text-foreground">
          میزکار
        </Link>{" "}
        / تیکت‌ها
      </nav>

      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground">تیکت‌ها</h1>
          <p className="mt-2 text-sm text-muted">
            {staff
              ? "همه تیکت‌های ارجاع‌شده به شما و درخواست‌های خودتان."
              : "درخواست‌های پشتیبانی شما."}
          </p>
        </div>
        <Link
          href="/app/tickets/new"
          className="rounded-xl bg-navy px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-navy/90"
        >
          تیکت جدید
        </Link>
      </div>

      {ok && (
        <p
          role="status"
          className="mt-5 rounded-xl border border-emerald/30 bg-emerald/10 p-3 text-sm text-emerald"
        >
          {ok}
        </p>
      )}
      {error && (
        <p
          role="alert"
          className="mt-5 rounded-xl border border-rose/30 bg-rose/10 p-3 text-sm text-rose"
        >
          {error}
        </p>
      )}

      <nav className="mt-6 flex flex-wrap gap-2" aria-label="فیلتر وضعیت">
        {FILTERS.map((item) => (
          <Link
            key={item.id || "all"}
            href={`/app/tickets${item.id ? `?status=${item.id}` : ""}`}
            aria-current={status === item.id ? "page" : undefined}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
              status === item.id
                ? "border-navy bg-navy text-white"
                : "border-border bg-card text-muted hover:text-foreground"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {rows.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted">
          تیکتی با این فیلتر پیدا نشد.
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {rows.map((ticket) => {
            const statusInfo = statusMeta(ticket.status)
            const priorityInfo = priorityMeta(ticket.priority)

            return (
              <li key={ticket.id}>
                <Link
                  href={`/app/tickets/${ticket.id}`}
                  className="block rounded-2xl border border-border bg-card p-5 transition hover:border-navy/30 hover:shadow-md"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusInfo.className}`}
                    >
                      {statusInfo.label}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${priorityInfo.className}`}
                    >
                      اولویت {priorityInfo.label}
                    </span>
                    <span className="text-xs text-muted">#{ticket.id}</span>
                    {staff && ticket.user && (
                      <span className="text-xs text-muted">· {ticket.user.name}</span>
                    )}
                    <span className="ms-auto text-xs text-muted">
                      {formatDateTime(ticket.last_message_at ?? ticket.updated_at)}
                    </span>
                  </div>
                  <h2 className="mt-2 font-bold text-foreground">{ticket.subject}</h2>
                  <p className="mt-1 line-clamp-2 text-sm text-muted">{ticket.description}</p>
                </Link>
              </li>
            )
          })}
        </ul>
      )}

      {tickets.last_page > 1 && (
        <nav className="mt-8 flex items-center justify-center gap-3" aria-label="صفحه‌بندی">
          {tickets.current_page > 1 && (
            <Link
              href={`/app/tickets?${new URLSearchParams({ ...(status ? { status } : {}), page: String(tickets.current_page - 1) })}`}
              className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-muted hover:text-foreground"
            >
              قبلی
            </Link>
          )}
          <span className="text-sm text-muted">
            صفحه {tickets.current_page} از {tickets.last_page}
          </span>
          {tickets.current_page < tickets.last_page && (
            <Link
              href={`/app/tickets?${new URLSearchParams({ ...(status ? { status } : {}), page: String(tickets.current_page + 1) })}`}
              className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-muted hover:text-foreground"
            >
              بعدی
            </Link>
          )}
        </nav>
      )}
    </div>
  )
}
