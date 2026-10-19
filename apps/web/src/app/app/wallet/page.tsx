import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"

import { requireSessionToken } from "@/lib/session"
import {
  formatDateTime,
  formatMoney,
  getBalance,
  listGateways,
  listTransactions,
  statusMeta,
  typeLabel,
} from "@/lib/wallet"

import { depositAction, transferAction, withdrawAction } from "./actions"

export const metadata: Metadata = {
  title: "کیف پول",
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

const TABS = [
  { id: "transactions", label: "تراکنش‌ها" },
  { id: "deposit", label: "شارژ" },
  { id: "withdraw", label: "برداشت" },
  { id: "transfer", label: "انتقال" },
] as const

type SearchParams = Promise<{ tab?: string; ok?: string; error?: string; page?: string }>

export default async function WalletPage({ searchParams }: { searchParams: SearchParams }) {
  const { tab = "transactions", ok, error, page = "1" } = await searchParams
  const token = await requireSessionToken("/app/wallet")

  const [balanceResult, transactionsResult, gatewaysResult] = await Promise.all([
    getBalance(token),
    listTransactions(token, page),
    listGateways(token),
  ])

  if (!balanceResult.ok && balanceResult.status === 401) {
    redirect("/sign-in?redirectUrl=%2Fapp%2Fwallet")
  }

  if (!balanceResult.ok) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16">
        <h1 className="text-2xl font-extrabold text-foreground">کیف پول</h1>
        <p
          role="alert"
          className="mt-6 rounded-xl border border-rose/30 bg-rose/10 p-4 text-sm text-rose"
        >
          {balanceResult.message}
        </p>
      </div>
    )
  }

  const balance = balanceResult.data
  const transactions = transactionsResult.ok ? transactionsResult.data : null
  const gateways = gatewaysResult.ok ? gatewaysResult.data : []
  const activeTab = TABS.some((item) => item.id === tab) ? tab : "transactions"

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <nav aria-label="مسیر" className="text-xs text-muted">
        <Link href="/app" className="hover:text-foreground">
          میزکار
        </Link>{" "}
        / کیف پول
      </nav>

      <h1 className="mt-2 text-3xl font-extrabold text-foreground">کیف پول</h1>

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

      <section className="mt-6 grid gap-4 sm:grid-cols-3" aria-label="موجودی">
        <div className="rounded-2xl border border-border bg-navy p-6 text-white">
          <p className="text-xs text-white/60">موجودی کل</p>
          <p className="mt-2 text-2xl font-extrabold">
            {formatMoney(balance.balance)} <span className="text-sm font-medium">ریال</span>
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <p className="text-xs text-muted">قابل برداشت</p>
          <p className="mt-2 text-2xl font-extrabold text-navy">
            {formatMoney(balance.withdrawable_balance)}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <p className="text-xs text-muted">مسدود</p>
          <p className="mt-2 text-2xl font-extrabold text-amber">
            {formatMoney(balance.blocked_balance)}
          </p>
        </div>
      </section>

      <nav className="mt-8 flex flex-wrap gap-2" aria-label="بخش‌های کیف پول">
        {TABS.map((item) => (
          <Link
            key={item.id}
            href={`/app/wallet?tab=${item.id}`}
            aria-current={activeTab === item.id ? "page" : undefined}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
              activeTab === item.id
                ? "border-navy bg-navy text-white"
                : "border-border bg-card text-muted hover:text-foreground"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {activeTab === "transactions" && (
        <section className="mt-6" aria-labelledby="statement">
          <h2 id="statement" className="text-lg font-bold text-foreground">
            صورت‌حساب
          </h2>

          {!transactions ? (
            <p className="mt-3 rounded-xl border border-rose/30 bg-rose/10 p-4 text-sm text-rose">
              صورت‌حساب در دسترس نیست.
            </p>
          ) : transactions.data.length === 0 ? (
            <p className="mt-3 rounded-xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted">
              هنوز تراکنشی ثبت نشده است.
            </p>
          ) : (
            <>
              <ul className="mt-3 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
                {transactions.data.map((transaction) => {
                  const meta = statusMeta(transaction.status)
                  const incoming = transaction.direction === "deposit"

                  return (
                    <li
                      key={transaction.id}
                      className="flex items-center justify-between gap-4 p-4"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-foreground">
                          {typeLabel(transaction.type)}
                        </p>
                        <p className="mt-0.5 text-xs text-muted">
                          {formatDateTime(transaction.created_at)}
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${meta.className}`}
                        >
                          {meta.label}
                        </span>
                        <span
                          className={`min-w-28 text-end text-sm font-extrabold ${
                            incoming ? "text-emerald" : "text-rose"
                          }`}
                        >
                          {incoming ? "+" : "−"} {formatMoney(transaction.amount)}
                        </span>
                      </div>
                    </li>
                  )
                })}
              </ul>

              {transactions.last_page > 1 && (
                <nav className="mt-4 flex items-center justify-center gap-3" aria-label="صفحه‌بندی">
                  {transactions.current_page > 1 && (
                    <Link
                      href={`/app/wallet?tab=transactions&page=${transactions.current_page - 1}`}
                      className="rounded-lg border border-border bg-card px-4 py-2 text-sm"
                    >
                      قبلی
                    </Link>
                  )}
                  <span className="text-xs text-muted">
                    صفحه {transactions.current_page.toLocaleString("fa-IR")} از{" "}
                    {transactions.last_page.toLocaleString("fa-IR")}
                  </span>
                  {transactions.current_page < transactions.last_page && (
                    <Link
                      href={`/app/wallet?tab=transactions&page=${transactions.current_page + 1}`}
                      className="rounded-lg border border-border bg-card px-4 py-2 text-sm"
                    >
                      بعدی
                    </Link>
                  )}
                </nav>
              )}
            </>
          )}
        </section>
      )}

      {activeTab === "deposit" && (
        <section className="mt-6 max-w-xl" aria-labelledby="deposit">
          <h2 id="deposit" className="text-lg font-bold text-foreground">
            شارژ کیف پول
          </h2>
          <p className="mt-2 text-sm leading-7 text-muted">
            با انتخاب درگاه، تراکنش در وضعیت «در انتظار» ثبت می‌شود. موجودی فقط پس از تأیید درگاه
            افزایش می‌یابد.
          </p>

          {gateways.length === 0 ? (
            <p className="mt-4 rounded-xl border border-dashed border-border bg-card p-6 text-sm text-muted">
              هیچ درگاه فعالی ثبت نشده است.
            </p>
          ) : (
            <form
              action={depositAction}
              className="mt-4 space-y-4 rounded-2xl border border-border bg-card p-5"
            >
              <div>
                <label htmlFor="deposit-amount" className="text-sm font-semibold text-foreground">
                  مبلغ (ریال)
                </label>
                <input
                  id="deposit-amount"
                  name="amount"
                  inputMode="numeric"
                  required
                  placeholder="۵۰۰۰۰۰"
                  className="mt-1 h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-navy"
                />
              </div>

              <fieldset>
                <legend className="text-sm font-semibold text-foreground">درگاه</legend>
                <div className="mt-2 space-y-2">
                  {gateways.map((gateway, index) => (
                    <label
                      key={gateway.id}
                      className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-sm"
                    >
                      <input
                        type="radio"
                        name="gateway"
                        value={gateway.code}
                        defaultChecked={index === 0}
                        className="accent-navy"
                      />
                      <span className="font-semibold text-foreground">{gateway.name}</span>
                      <span className="text-xs text-muted">{gateway.code}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <button
                type="submit"
                className="h-11 w-full rounded-xl bg-navy text-sm font-bold text-white transition hover:bg-navy-light"
              >
                ثبت درخواست شارژ
              </button>
            </form>
          )}
        </section>
      )}

      {activeTab === "withdraw" && (
        <section className="mt-6 max-w-xl" aria-labelledby="withdraw">
          <h2 id="withdraw" className="text-lg font-bold text-foreground">
            برداشت
          </h2>
          <p className="mt-2 text-sm leading-7 text-muted">
            مبلغ از موجودی قابل برداشت کسر و تراکنش در وضعیت «در انتظار بررسی» ثبت می‌شود.
          </p>

          <form
            action={withdrawAction}
            className="mt-4 space-y-4 rounded-2xl border border-border bg-card p-5"
          >
            <div>
              <label htmlFor="withdraw-amount" className="text-sm font-semibold text-foreground">
                مبلغ (ریال)
              </label>
              <input
                id="withdraw-amount"
                name="amount"
                inputMode="numeric"
                required
                className="mt-1 h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-navy"
              />
              <p className="mt-1 text-xs text-muted">
                حداکثر: {formatMoney(balance.withdrawable_balance)} ریال
              </p>
            </div>

            <button
              type="submit"
              className="h-11 w-full rounded-xl bg-navy text-sm font-bold text-white transition hover:bg-navy-light"
            >
              ثبت درخواست برداشت
            </button>
          </form>
        </section>
      )}

      {activeTab === "transfer" && (
        <section className="mt-6 max-w-xl" aria-labelledby="transfer">
          <h2 id="transfer" className="text-lg font-bold text-foreground">
            انتقال به کاربر دیگر
          </h2>
          <p className="mt-2 text-sm leading-7 text-muted">
            انتقال فوری است: مبلغ از موجودی قابل برداشت شما کسر و به موجودی گیرنده اضافه می‌شود.
          </p>

          <form
            action={transferAction}
            className="mt-4 space-y-4 rounded-2xl border border-border bg-card p-5"
          >
            <div>
              <label htmlFor="transfer-email" className="text-sm font-semibold text-foreground">
                ایمیل گیرنده
              </label>
              <input
                id="transfer-email"
                name="email"
                type="email"
                required
                className="mt-1 h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-navy"
              />
            </div>

            <div>
              <label htmlFor="transfer-amount" className="text-sm font-semibold text-foreground">
                مبلغ (ریال)
              </label>
              <input
                id="transfer-amount"
                name="amount"
                inputMode="numeric"
                required
                className="mt-1 h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-navy"
              />
            </div>

            <button
              type="submit"
              className="h-11 w-full rounded-xl bg-amber text-sm font-bold text-navy-dark transition hover:brightness-105"
            >
              انتقال
            </button>
          </form>
        </section>
      )}
    </div>
  )
}
