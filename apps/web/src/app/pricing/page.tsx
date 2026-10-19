import type { Metadata } from "next"
import Link from "next/link"

import { listPackages } from "@/lib/api"

export const metadata: Metadata = {
  title: "تعرفه‌ها",
  description:
    "قیمت شفاف خدمات AdminHub21: بازار متخصصان، قرارداد الکترونیکی، کیف پول و میزکار. بدون مذاکره‌ی قیمت.",
  alternates: { canonical: "/pricing" },
}

export const revalidate = 120

const PLANS = [
  {
    name: "پایه",
    price: "رایگان",
    note: "برای شروع",
    features: ["ساخت پروفایل", "مرور بازار", "پرسش و پاسخ عمومی"],
    cta: { href: "/sign-in?redirectUrl=%2Fapp", label: "ساخت حساب" },
    highlight: false,
  },
  {
    name: "حرفه‌ای",
    price: "۱۵٪ کارمزد",
    note: "پرفروش‌ترین",
    features: ["فروش بسته در بازار", "قرارداد الکترونیکی", "کیف پول و تسویه", "پروفایل تأییدشده"],
    cta: { href: "/sign-in?redirectUrl=%2Fapp", label: "شروع فروش" },
    highlight: true,
  },
  {
    name: "سازمانی",
    price: "تماس بگیرید",
    note: "برای تیم‌ها",
    features: ["میزکار مشترک", "نقش‌های سازمانی", "گزارش و خروجی", "پشتیبانی اختصاصی"],
    cta: {
      href: "/sign-in?redirectUrl=%2Fapp%2Fadmin-workspace",
      label: "درخواست",
    },
    highlight: false,
  },
]

export default async function PricingPage() {
  const { data: packages } = await listPackages({ sort: "price-asc" })
  const cheapest = packages.slice(0, 3)

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-extrabold text-foreground">تعرفه‌ها</h1>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
        هزینه‌ها همان‌جا که تصمیم می‌گیرید مشخص است: کارمزد پلتفرم، قیمت بسته‌ها و هزینه‌ی قرارداد.
      </p>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {PLANS.map((plan) => (
          <section
            key={plan.name}
            className={`flex flex-col rounded-2xl border p-6 ${
              plan.highlight
                ? "border-navy bg-navy text-white shadow-xl"
                : "border-border bg-card text-foreground"
            }`}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">{plan.name}</h2>
              {plan.highlight && (
                <span className="rounded-full bg-amber px-2.5 py-1 text-[11px] font-bold text-navy-dark">
                  {plan.note}
                </span>
              )}
            </div>
            <p className="mt-4 text-3xl font-extrabold">{plan.price}</p>
            <ul
              className={`mt-6 flex-1 space-y-2 text-sm ${
                plan.highlight ? "text-white/80" : "text-muted"
              }`}
            >
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <span className={plan.highlight ? "text-emerald" : "text-navy"} aria-hidden>
                    ✓
                  </span>
                  {feature}
                </li>
              ))}
            </ul>
            <Link
              href={plan.cta.href}
              className={`mt-6 rounded-xl px-5 py-3 text-center text-sm font-bold transition ${
                plan.highlight
                  ? "bg-amber text-navy-dark hover:brightness-105"
                  : "border border-border hover:bg-subtle"
              }`}
            >
              {plan.cta.label}
            </Link>
          </section>
        ))}
      </div>

      <section className="mt-16" aria-labelledby="package-prices">
        <h2 id="package-prices" className="text-xl font-extrabold text-foreground">
          ارزان‌ترین بسته‌های بازار
        </h2>
        {cheapest.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-border bg-card p-6 text-sm text-muted">
            هنوز بسته‌ای منتشر نشده است.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-border rounded-2xl border border-border bg-card">
            {cheapest.map((pkg) => (
              <li key={pkg.id} className="flex items-center justify-between gap-4 p-4">
                <Link
                  href={`/marketplace/${pkg.slug ?? pkg.id}`}
                  className="font-semibold hover:text-navy"
                >
                  {pkg.title}
                </Link>
                <span className="shrink-0 text-sm font-extrabold text-navy">
                  {Number(pkg.price).toLocaleString("fa-IR")} {pkg.currency}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
