import Link from "next/link"

import { listPackages } from "@/lib/api"

export const revalidate = 60

const SERVICES = [
  {
    href: "/marketplace",
    title: "بازار متخصصان",
    body: "ادیتور، تولیدکننده ابزار و توسعه‌دهنده را بر اساس تخصص، امتیاز و سطح تأیید پیدا کنید.",
  },
  {
    href: "/pricing",
    title: "بسته‌های قیمت‌گذاری‌شده",
    body: "هر خدمت با قیمت شفاف و دامنه تحویل مشخص، به‌جای مذاکره‌ی بی‌پایان.",
  },
  {
    href: "/sign-in?redirectUrl=%2Fapp",
    title: "قرارداد و کیف پول",
    body: "سفارش، قرارداد الکترونیکی، امضا و تسویه در یک مسیر قابل پیگیری.",
  },
]

export default async function HomePage() {
  const { data: packages, total } = await listPackages({ sort: "popular" })
  const featured = packages.slice(0, 6)

  return (
    <>
      <section className="border-b border-border bg-gradient-to-b from-navy to-navy-dark text-white">
        <div className="mx-auto max-w-6xl px-4 py-20 md:py-28">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium">
            <span className="size-1.5 rounded-full bg-emerald" aria-hidden />
            نسخه ۱٬۰ منتشر شد
          </p>

          <h1 className="mt-6 max-w-3xl text-4xl font-extrabold leading-tight md:text-6xl">
            متخصص را پیدا کنید، سفارش را دقیق بسپارید، قرارداد را آنلاین امضا کنید.
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-8 text-white/75 md:text-lg">
            AdminHub21 بازار دوطرفه‌ی خدمات محتوا و ابزار است: پروفایل تأییدشده‌ی متخصصان، بسته‌های
            قیمت‌گذاری‌شده، قرارداد الکترونیکی و کیف پول — همه در یک جا.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href="/marketplace"
              className="rounded-xl bg-amber px-6 py-3 text-sm font-bold text-navy-dark transition hover:brightness-105"
            >
              دیدن بازار
            </Link>
            <Link
              href="/pricing"
              className="rounded-xl border border-white/25 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
            >
              تعرفه‌ها
            </Link>
          </div>

          <dl className="mt-14 grid max-w-2xl grid-cols-3 gap-6 border-t border-white/15 pt-8">
            <div>
              <dt className="text-xs text-white/60">بسته فعال</dt>
              <dd className="mt-1 text-2xl font-extrabold">{total.toLocaleString("fa-IR")}</dd>
            </div>
            <div>
              <dt className="text-xs text-white/60">مسیرهای API</dt>
              <dd className="mt-1 text-2xl font-extrabold">۱۸۶</dd>
            </div>
            <div>
              <dt className="text-xs text-white/60">وضعیت سرویس</dt>
              <dd className="mt-1 text-2xl font-extrabold text-emerald">سبز</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16" aria-labelledby="services">
        <h2 id="services" className="text-2xl font-extrabold text-foreground">
          چه کاری از AdminHub21 برمی‌آید
        </h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {SERVICES.map((service) => (
            <Link
              key={service.href}
              href={service.href}
              className="group rounded-2xl border border-border bg-card p-6 transition hover:-translate-y-0.5 hover:border-navy/30 hover:shadow-lg"
            >
              <h3 className="text-lg font-bold text-foreground">{service.title}</h3>
              <p className="mt-2 text-sm leading-7 text-muted">{service.body}</p>
              <span className="mt-4 inline-block text-sm font-semibold text-navy group-hover:underline">
                بیشتر ←
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16" aria-labelledby="featured">
        <div className="flex items-end justify-between">
          <h2 id="featured" className="text-2xl font-extrabold text-foreground">
            بسته‌های منتخب
          </h2>
          <Link href="/marketplace" className="text-sm font-semibold text-navy hover:underline">
            همه بسته‌ها
          </Link>
        </div>

        {featured.length === 0 ? (
          <p className="mt-6 rounded-xl border border-dashed border-border bg-card p-6 text-sm text-muted">
            هنوز بسته‌ی منتشرشده‌ای ثبت نشده است. به‌محض انتشار اولین بسته‌ها، همین‌جا نمایش داده می‌شوند.
          </p>
        ) : (
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((pkg) => (
              <li key={pkg.id}>
                <Link
                  href={`/marketplace/${pkg.slug ?? pkg.id}`}
                  className="flex h-full flex-col rounded-2xl border border-border bg-card p-5 transition hover:border-navy/30 hover:shadow-md"
                >
                  <h3 className="line-clamp-2 text-base font-bold text-foreground">{pkg.title}</h3>
                  <p className="mt-2 line-clamp-2 flex-1 text-sm leading-6 text-muted">
                    {pkg.description ?? "—"}
                  </p>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="font-extrabold text-navy">
                      {Number(pkg.price).toLocaleString("fa-IR")} {pkg.currency}
                    </span>
                    <span className="text-xs text-muted">{pkg.user?.name ?? "متخصص"}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}
