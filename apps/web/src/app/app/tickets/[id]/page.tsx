import type { Metadata } from "next"
import Link from "next/link"

import { getMe, isStaff, requireSessionToken } from "@/lib/session"
import {
  formatDateTime,
  getTicket,
  priorityMeta,
  statusMeta,
  type TicketRow,
  type TicketStatus,
} from "@/lib/tickets"

import { replyAction, statusAction } from "../actions"

export const metadata: Metadata = {
  title: "تیکت",
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

const STATUS_CHOICES: { value: TicketStatus; label: string }[] = [
  { value: "open", label: "باز" },
  { value: "in_progress", label: "در حال بررسی" },
  { value: "resolved", label: "حل‌شده" },
  { value: "closed", label: "بسته" },
]

type Params = Promise<{ id: string }>
type SearchParams = Promise<{ ok?: string; error?: string }>

export default async function TicketPage({
  params,
  searchParams,
}: {
  params: Params
  searchParams: SearchParams
}) {
  const { id } = await params
  const { ok, error } = await searchParams
  const token = await requireSessionToken(`/app/tickets/${id}`)

  const [me, result] = await Promise.all([getMe(token), getTicket(token, id)])

  if (!result.ok) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-2xl font-extrabold text-foreground">تیکت #{id}</h1>
        <p
          role="alert"
          className="mt-6 rounded-xl border border-rose/30 bg-rose/10 p-4 text-sm text-rose"
        >
          {result.status === 404 || result.status === 403
            ? "این تیکت در دسترس شما نیست."
            : result.message}
        </p>
        <Link
          href="/app/tickets"
          className="mt-6 inline-block text-sm text-muted hover:text-foreground"
        >
          بازگشت به فهرست تیکت‌ها
        </Link>
      </div>
    )
  }

  const ticket = result.data as TicketRow
  const staff = isStaff(me)
  const statusInfo = statusMeta(ticket.status)
  const priorityInfo = priorityMeta(ticket.priority)
  const messages = ticket.messages ?? []
  const closed = ticket.status === "closed"

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
        / #{ticket.id}
      </nav>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusInfo.className}`}
        >
          {statusInfo.label}
        </span>
        <span
          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${priorityInfo.className}`}
        >
          اولویت {priorityInfo.label}
        </span>
        <span className="text-xs text-muted">ایجاد {formatDateTime(ticket.created_at)}</span>
        {ticket.assignee && (
          <span className="text-xs text-muted">· کارشناس: {ticket.assignee.name}</span>
        )}
      </div>

      <h1 className="mt-2 text-3xl font-extrabold text-foreground">{ticket.subject}</h1>
      <p className="mt-3 rounded-2xl border border-border bg-card p-5 text-sm leading-7 whitespace-pre-line text-foreground">
        {ticket.description}
      </p>

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

      <section className="mt-8" aria-label="گفتگو">
        <h2 className="text-sm font-bold text-foreground">گفتگو ({messages.length})</h2>

        {messages.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-dashed border-border bg-card p-6 text-center text-sm text-muted">
            هنوز پیامی ثبت نشده است.
          </p>
        ) : (
          <ol className="mt-4 space-y-3">
            {messages.map((message) => (
              <li
                key={message.id}
                className={`rounded-2xl border p-4 ${
                  message.is_internal ? "border-amber/40 bg-amber/10" : "border-border bg-card"
                }`}
              >
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                  <span className="font-semibold text-foreground">
                    {message.user?.name ?? "کاربر"}
                  </span>
                  <span>· {formatDateTime(message.created_at)}</span>
                  {message.is_internal && (
                    <span className="rounded-full bg-amber/20 px-2 py-0.5 text-[10px] font-semibold text-amber">
                      یادداشت داخلی
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm leading-7 whitespace-pre-line text-foreground">
                  {message.body}
                </p>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="mt-8" aria-label="پاسخ">
        {closed ? (
          <p className="rounded-xl border border-border bg-subtle p-4 text-sm text-muted">
            این تیکت بسته شده است. برای پیگیری، تیکت جدیدی ثبت کنید.
          </p>
        ) : (
          <form
            action={replyAction}
            className="space-y-3 rounded-2xl border border-border bg-card p-5"
          >
            <input type="hidden" name="ticketId" value={ticket.id} />
            <label htmlFor="body" className="block text-sm font-semibold text-foreground">
              پاسخ شما
            </label>
            <textarea
              id="body"
              name="body"
              required
              rows={4}
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm leading-7 text-foreground outline-none focus:border-navy"
            />
            {staff && (
              <label className="flex items-center gap-2 text-sm text-muted">
                <input type="checkbox" name="is_internal" value="1" className="accent-amber" />
                یادداشت داخلی (برای کاربر نمایش داده نمی‌شود)
              </label>
            )}
            <button
              type="submit"
              className="rounded-xl bg-navy px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-navy/90"
            >
              ارسال پاسخ
            </button>
          </form>
        )}
      </section>

      <section className="mt-6" aria-label="تغییر وضعیت">
        <form action={statusAction} className="flex flex-wrap items-end gap-3">
          <input type="hidden" name="ticketId" value={ticket.id} />
          <div>
            <label htmlFor="status" className="block text-xs font-semibold text-muted">
              وضعیت تیکت
            </label>
            <select
              id="status"
              name="status"
              defaultValue={ticket.status}
              className="mt-1.5 rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-navy"
            >
              {STATUS_CHOICES.map((choice) => (
                <option key={choice.value} value={choice.value}>
                  {choice.label}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-muted transition hover:text-foreground"
          >
            ثبت وضعیت
          </button>
        </form>
      </section>
    </div>
  )
}
