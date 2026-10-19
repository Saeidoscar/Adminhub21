import type { Metadata } from "next"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"

import { formatAmount, formatDate, getContract, statusMeta } from "@/lib/contracts"
import { requireSessionToken } from "@/lib/session"

import { signContractAction, transitionAction } from "../actions"

export const metadata: Metadata = {
  title: "قرارداد",
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

type Params = Promise<{ id: string }>
type SearchParams = Promise<{ ok?: string; error?: string }>

const TRANSITIONS = {
  activate: { label: "فعال‌سازی قرارداد", className: "bg-navy text-white hover:bg-navy-light" },
  complete: { label: "ثبت اتمام", className: "bg-emerald text-white hover:brightness-105" },
  cancel: { label: "لغو قرارداد", className: "border border-rose/40 text-rose hover:bg-rose/10" },
} as const

export default async function ContractDetailPage({
  params,
  searchParams,
}: {
  params: Params
  searchParams: SearchParams
}) {
  const { id } = await params
  const { ok, error } = await searchParams
  const token = await requireSessionToken(`/app/contracts/${id}`)

  const result = await getContract(token, id)

  if (!result.ok) {
    if (result.status === 404) notFound()
    if (result.status === 401)
      redirect(`/sign-in?redirectUrl=${encodeURIComponent(`/app/contracts/${id}`)}`)

    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <p
          role="alert"
          className="rounded-xl border border-rose/30 bg-rose/10 p-4 text-sm text-rose"
        >
          {result.message}
        </p>
      </div>
    )
  }

  const contract = result.data
  const meta = statusMeta(contract.status)
  const signatures = contract.signatures ?? []
  const clauses = contract.clauses ?? []
  const signed = signatures.length > 0

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <nav aria-label="مسیر" className="text-xs text-muted">
        <Link href="/app" className="hover:text-foreground">
          میزکار
        </Link>{" "}
        /{" "}
        <Link href="/app/contracts" className="hover:text-foreground">
          قراردادها
        </Link>{" "}
        / {contract.title}
      </nav>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground">{contract.title}</h1>
          <p className="mt-2 text-sm text-muted">
            {contract.user?.name ?? "—"} و {contract.client?.name ?? "—"} · ایجاد{" "}
            {formatDate(contract.created_at)}
          </p>
        </div>
        <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${meta.className}`}>
          {meta.label}
        </span>
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

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs text-muted">مبلغ</p>
          <p className="mt-1 text-lg font-extrabold text-navy">
            {formatAmount(contract.amount, contract.currency)}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs text-muted">شروع</p>
          <p className="mt-1 text-sm font-bold text-foreground">{formatDate(contract.starts_at)}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs text-muted">پایان</p>
          <p className="mt-1 text-sm font-bold text-foreground">{formatDate(contract.ends_at)}</p>
        </div>
      </section>

      {contract.description && (
        <section className="mt-8" aria-labelledby="description">
          <h2 id="description" className="text-lg font-bold text-foreground">
            توضیحات
          </h2>
          <p className="mt-2 whitespace-pre-line text-sm leading-8 text-muted">
            {contract.description}
          </p>
        </section>
      )}

      <section className="mt-8" aria-labelledby="clauses">
        <h2 id="clauses" className="text-lg font-bold text-foreground">
          بندهای قرارداد
        </h2>
        {clauses.length === 0 ? (
          <p className="mt-2 rounded-xl border border-dashed border-border bg-card p-4 text-sm text-muted">
            بندی برای این قرارداد ثبت نشده است.
          </p>
        ) : (
          <ol className="mt-3 space-y-3">
            {clauses.map((clause) => (
              <li key={clause.id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-bold text-foreground">{clause.title}</h3>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                      clause.is_accepted ? "bg-emerald/15 text-emerald" : "bg-amber/15 text-amber"
                    }`}
                  >
                    {clause.is_accepted ? "پذیرفته‌شده" : "در انتظار پذیرش"}
                  </span>
                </div>
                <p className="mt-2 whitespace-pre-line text-sm leading-7 text-muted">
                  {clause.content}
                </p>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="mt-8" aria-labelledby="signatures">
        <h2 id="signatures" className="text-lg font-bold text-foreground">
          امضاها
        </h2>
        {signatures.length === 0 ? (
          <p className="mt-2 rounded-xl border border-dashed border-border bg-card p-4 text-sm text-muted">
            هنوز امضایی ثبت نشده است.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {signatures.map((signature, index) => (
              <li
                key={`${signature.signed_at}-${index}`}
                className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-sm"
              >
                <span className="font-semibold text-foreground">{signature.name}</span>
                <span className="text-xs text-muted">{formatDate(signature.signed_at)}</span>
              </li>
            ))}
          </ul>
        )}

        {["draft", "pending"].includes(contract.status) && (
          <form
            action={signContractAction}
            className="mt-4 rounded-xl border border-border bg-card p-4"
          >
            <input type="hidden" name="contractId" value={contract.id} />
            <label htmlFor="signature-name" className="text-sm font-semibold text-foreground">
              نام و نام خانوادگی امضاکننده
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              <input
                id="signature-name"
                name="name"
                required
                maxLength={255}
                className="h-11 flex-1 rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-navy"
              />
              <button
                type="submit"
                className="h-11 rounded-xl bg-amber px-5 text-sm font-bold text-navy-dark transition hover:brightness-105"
              >
                امضای الکترونیکی
              </button>
            </div>
            <p className="mt-2 text-xs text-muted">
              با امضا، نام و زمان ثبت می‌شود و قرارداد به وضعیت «در انتظار» می‌رود.
            </p>
          </form>
        )}
      </section>

      <section className="mt-8" aria-labelledby="actions">
        <h2 id="actions" className="text-lg font-bold text-foreground">
          عملیات
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {contract.status === "pending" && signed && (
            <form action={transitionAction}>
              <input type="hidden" name="contractId" value={contract.id} />
              <input type="hidden" name="transition" value="activate" />
              <button
                type="submit"
                className={`h-11 rounded-xl px-5 text-sm font-bold transition ${TRANSITIONS.activate.className}`}
              >
                {TRANSITIONS.activate.label}
              </button>
            </form>
          )}

          {contract.status === "active" && (
            <form action={transitionAction}>
              <input type="hidden" name="contractId" value={contract.id} />
              <input type="hidden" name="transition" value="complete" />
              <button
                type="submit"
                className={`h-11 rounded-xl px-5 text-sm font-bold transition ${TRANSITIONS.complete.className}`}
              >
                {TRANSITIONS.complete.label}
              </button>
            </form>
          )}

          {["draft", "pending", "active"].includes(contract.status) && (
            <form action={transitionAction}>
              <input type="hidden" name="contractId" value={contract.id} />
              <input type="hidden" name="transition" value="cancel" />
              <button
                type="submit"
                className={`h-11 rounded-xl px-5 text-sm font-bold transition ${TRANSITIONS.cancel.className}`}
              >
                {TRANSITIONS.cancel.label}
              </button>
            </form>
          )}

          <a
            href={`/app/contracts/${contract.id}/pdf`}
            className="grid h-11 place-items-center rounded-xl border border-border px-5 text-sm font-semibold text-foreground transition hover:bg-subtle"
          >
            دانلود PDF
          </a>
        </div>
      </section>
    </div>
  )
}
