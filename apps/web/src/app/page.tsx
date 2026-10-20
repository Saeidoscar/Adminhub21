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

const STEPS = [
  {
    title: "انتخاب بسته",
    body: "قیمت، دامنه‌ی تحویل و زمان را قبل از سفارش می‌بینید.",
  },
  {
    title: "قرارداد الکترونیکی",
    body: "قرارداد با مشخصات سفارش ساخته و آنلاین امضا می‌شود.",
  },
  {
    title: "تحویل و پیگیری",
    body: "وضعیت سفارش در میزکار قابل پیگیری است؛ سؤال‌ها در تیکت.",
  },
  {
    title: "تسویه‌ی کنترل‌شده",
    body: "پول در کیف پول می‌ماند تا تحویل تأیید شود، سپس آزاد می‌شود.",
  },
]

const TRUST = [
  {
    title: "قیمت پنهان نداریم",
    body: "هر بسته قیمت و دامنه‌ی تحویل مشخص دارد. کارمزد ۱۵٪ از قبل اعلام می‌شود.",
  },
  {
    title: "پول تا تحویل می‌ماند",
    body: "پرداخت در کیف پول نگه داشته می‌شود؛ برداشت با بررسی و تأیید انسانی انجام می‌شود.",
  },
  {
    title: "هر تیکت یک مالک دارد",
    body: "صف پشتیبانی با زمان پاسخ مشخص و اولویت‌بندی واقعی مدیریت می‌شود.",
  },
  {
    title: "کد و تاریخچه قابل بررسی",
    body: "مخزن، changelog و نقشه‌ی راه عمومی‌اند؛ ادعا بدون سند نمی‌کنیم.",
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
            نسخه ۱.۰ منتشر شد
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
              <dt className="text-xs text-white/60">کارمزد شفاف</dt>
              <dd className="mt-1 text-2xl font-extrabold">۱۵٪</dd>
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

      <section className="border-y border-border bg-card" aria-labelledby="how">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 id="how" className="text-2xl font-extrabold text-foreground">
            از انتخاب تا تسویه، در چهار گام
          </h2>
          <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, index) => (
              <li key={step.title} className="rounded-2xl border border-border bg-surface p-5">
                <span className="grid size-8 place-items-center rounded-full bg-navy text-sm font-extrabold text-white">
                  {index + 1}
                </span>
                <h3 className="mt-3 text-sm font-bold text-foreground">{step.title}</h3>
                <p className="mt-1 text-xs leading-6 text-muted">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16" aria-labelledby="trust">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <h2 id="trust" className="text-2xl font-extrabold text-foreground">
              چرا به AdminHub21 اعتماد کنید
            </h2>
            <ul className="mt-6 space-y-4">
              {TRUST.map((item) => (
                <li key={item.title} className="flex gap-3">
                  <span
                    aria-hidden
                    className="mt-1 grid size-6 shrink-0 place-items-center rounded-full bg-emerald/15 text-xs font-bold text-emerald"
                  >
                    ✓
                  </span>
                  <div>
                    <p className="text-sm font-bold text-foreground">{item.title}</p>
                    <p className="mt-1 text-sm leading-7 text-muted">{item.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="text-base font-extrabold text-foreground">شفافیت، مکتوب</h3>
            <p className="mt-2 text-sm leading-7 text-muted">
              شرایط استفاده، حریم خصوصی، تاریخ انتشار نسخه‌ها و نقشه‌ی راه همه منتشر شده‌اند. اگر
              چیزی را نمی‌فهمید، همان‌جا می‌توانید بپرسید.
            </p>
            <div className="mt-5 flex flex-wrap gap-2 text-xs">
              {[
                { href: "/about", label: "درباره ما" },
                { href: "/roadmap", label: "نقشه‌ی راه" },
                { href: "/changelog", label: "تغییرات" },
                { href: "/terms", label: "شرایط استفاده" },
                { href: "/privacy", label: "حریم خصوصی" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-lg border border-border px-3 py-1.5 font-medium text-muted transition hover:bg-subtle hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="rounded-3xl bg-navy px-6 py-12 text-center text-white md:px-12">
          <h2 className="text-2xl font-extrabold md:text-3xl">اولین سفارش را دقیق بسپارید.</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-white/70">
            بسته‌ای با قیمت شفاف انتخاب کنید، قرارداد را آنلاین امضا کنید و تحویل را از میزکار
            پیگیری کنید. اگر مطمئن نیستید کدام بسته مناسب است، از بازار شروع کنید.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href="/marketplace"
              className="rounded-xl bg-amber px-6 py-3 text-sm font-bold text-navy-dark transition hover:brightness-105"
            >
              دیدن بازار
            </Link>
            <Link
              href="/sign-in?redirectUrl=%2Fapp"
              className="rounded-xl border border-white/25 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
            >
              ساخت حساب
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
