import type { Metadata } from "next"
import Link from "next/link"

import { listPackages } from "@/lib/api"

export const metadata: Metadata = {
  title: "بازار متخصصان",
  description:
    "بسته‌های منتشرشده‌ی متخصصان محتوا، ادیتورها و توسعه‌دهندگان ابزار را با فیلتر تخصص، قیمت و مرتب‌سازی مرور کنید.",
  alternates: { canonical: "/marketplace" },
}

const SORTS = [
  { value: "popular", label: "محبوب‌ترین" },
  { value: "newest", label: "جدیدترین" },
  { value: "price-asc", label: "ارزان‌ترین" },
  { value: "price-desc", label: "گران‌ترین" },
]

type SearchParams = Promise<Record<string, string | string[] | undefined>>

function asString(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

function buildHref(
  current: Record<string, string | undefined>,
  patch: Record<string, string | undefined>,
) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries({ ...current, ...patch })) {
    if (value) params.set(key, value)
  }
  const suffix = params.toString()
  return `/marketplace${suffix ? `?${suffix}` : ""}`
}

export default async function MarketplacePage({ searchParams }: { searchParams: SearchParams }) {
  const raw = await searchParams
  const query = {
    search: asString(raw.search),
    sort: asString(raw.sort) ?? "popular",
    min_price: asString(raw.min_price),
    max_price: asString(raw.max_price),
  }

  const { data: packages, total, current_page, last_page } = await listPackages(query)

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <header>
        <nav aria-label="مسیر" className="text-xs text-muted">
          <Link href="/" className="hover:text-foreground">
            خانه
          </Link>{" "}
          / بازار
        </nav>
        <h1 className="mt-3 text-3xl font-extrabold text-foreground">بازار متخصصان</h1>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-muted">
          {total.toLocaleString("fa-IR")} بسته‌ی منتشرشده. فیلترها بخشی از آدرس صفحه‌اند، پس هر
          نتیجه‌ای قابل اشتراک‌گذاری و ایندکس‌شدن است.
        </p>
      </header>

      <form
        action="/marketplace"
        method="get"
        className="mt-8 rounded-2xl border border-border bg-card p-4"
      >
        <div className="grid gap-3 md:grid-cols-[1fr_auto_auto_auto]">
          <label className="sr-only" htmlFor="search">
            جستجو
          </label>
          <input
            id="search"
            name="search"
            defaultValue={query.search ?? ""}
            placeholder="جستجوی عنوان بسته…"
            className="h-11 rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-navy"
          />

          <label className="sr-only" htmlFor="min_price">
            حداقل قیمت
          </label>
          <input
            id="min_price"
            name="min_price"
            inputMode="numeric"
            defaultValue={query.min_price ?? ""}
            placeholder="از قیمت"
            className="h-11 w-32 rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-navy"
          />

          <label className="sr-only" htmlFor="max_price">
            حداکثر قیمت
          </label>
          <input
            id="max_price"
            name="max_price"
            inputMode="numeric"
            defaultValue={query.max_price ?? ""}
            placeholder="تا قیمت"
            className="h-11 w-32 rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-navy"
          />

          <button
            type="submit"
            className="h-11 rounded-xl bg-navy px-6 text-sm font-bold text-white transition hover:bg-navy-light"
          >
            اعمال فیلتر
          </button>
        </div>
      </form>

      <div className="mt-6 flex flex-wrap items-center gap-2" role="group" aria-label="مرتب‌سازی">
        <span className="text-xs text-muted">مرتب‌سازی:</span>
        {SORTS.map((sort) => {
          const active = query.sort === sort.value
          return (
            <Link
              key={sort.value}
              href={buildHref(query, { sort: sort.value })}
              aria-current={active ? "true" : undefined}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                active
                  ? "border-navy bg-navy text-white"
                  : "border-border bg-card text-muted hover:text-foreground"
              }`}
            >
              {sort.label}
            </Link>
          )
        })}
        {(query.search || query.min_price || query.max_price) && (
          <Link
            href="/marketplace"
            className="ms-auto text-xs font-semibold text-rose hover:underline"
          >
            پاک کردن فیلترها
          </Link>
        )}
      </div>

      {packages.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted">
          بسته‌ای با این فیلترها پیدا نشد.
        </p>
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg) => (
            <li key={pkg.id}>
              <Link
                href={`/marketplace/${pkg.slug ?? pkg.id}`}
                className="flex h-full flex-col rounded-2xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:border-navy/30 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="line-clamp-2 text-base font-bold text-foreground">{pkg.title}</h2>
                  <span className="shrink-0 rounded-md bg-emerald/10 px-2 py-1 text-[11px] font-bold text-emerald">
                    تأییدشده
                  </span>
                </div>
                <p className="mt-2 line-clamp-3 flex-1 text-sm leading-6 text-muted">
                  {pkg.description ?? "—"}
                </p>
                <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-sm">
                  <span className="font-extrabold text-navy">
                    {Number(pkg.price).toLocaleString("fa-IR")} {pkg.currency}
                  </span>
                  <span className="text-xs text-muted">
                    {pkg.user?.name ?? "متخصص"} ·{" "}
                    {Number(pkg.sales ?? 0) > 0
                      ? `${Number(pkg.sales).toLocaleString("fa-IR")} فروش`
                      : "بسته‌ی جدید"}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {last_page > 1 && (
        <nav className="mt-10 flex items-center justify-center gap-2" aria-label="صفحه‌بندی">
          {current_page > 1 && (
            <Link
              href={buildHref(query, { page: String(current_page - 1) })}
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
              href={buildHref(query, { page: String(current_page + 1) })}
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
