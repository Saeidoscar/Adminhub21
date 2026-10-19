import type { Metadata } from "next"
import Link from "next/link"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { apiBaseUrl } from "@/lib/api"

export const metadata: Metadata = {
  title: "میزکار",
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

type Me = {
  id: number
  name: string
  email: string
  role?: string
}

async function loadMe(token: string): Promise<Me | null> {
  try {
    const response = await fetch(`${apiBaseUrl()}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      cache: "no-store",
    })
    if (!response.ok) return null
    return (await response.json()) as Me
  } catch {
    return null
  }
}

const MODULES: { label: string; note: string; href?: string }[] = [
  {
    label: "قراردادها",
    note: "ساخت، امضا و چرخه وضعیت",
    href: "/app/contracts",
  },
  { label: "بازار و سفارش‌ها", note: "مرور، سفارش و پیگیری" },
  { label: "کیف پول", note: "موجودی، تراکنش و تسویه" },
  { label: "تیکت‌ها", note: "پشتیبانی و مکالمه" },
]

export default async function WorkspacePage() {
  const token = (await cookies()).get("ah_token")?.value

  // The auth boundary: unauthenticated deep links round-trip through sign-in
  // and come back here, exactly one hop.
  if (!token) redirect("/sign-in?redirectUrl=%2Fapp")

  const me = await loadMe(token)

  if (!me) redirect("/sign-in?redirectUrl=%2Fapp")

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <p className="text-xs text-muted">میزکار</p>
      <h1 className="mt-2 text-3xl font-extrabold text-foreground">سلام {me.name}</h1>
      <p className="mt-2 text-sm text-muted">
        {me.role ? `نقش: ${me.role}` : me.email} · این میزکار با نشست کوکی امن سرو می‌شود.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {MODULES.map((module) =>
          module.href ? (
            <Link
              key={module.label}
              href={module.href}
              className="rounded-2xl border border-border bg-card p-6 transition hover:border-navy/30 hover:shadow-md"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-bold text-foreground">{module.label}</h2>
                <span className="rounded-full bg-emerald/15 px-2 py-0.5 text-[11px] font-semibold text-emerald">
                  فعال
                </span>
              </div>
              <p className="mt-1 text-sm text-muted">{module.note}</p>
            </Link>
          ) : (
            <section
              key={module.label}
              aria-disabled="true"
              className="rounded-2xl border border-border bg-card p-6 opacity-70"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-bold text-foreground">{module.label}</h2>
                <span className="rounded-full bg-subtle px-2 py-0.5 text-[11px] font-semibold text-muted">
                  در حال انتقال
                </span>
              </div>
              <p className="mt-1 text-sm text-muted">{module.note}</p>
            </section>
          ),
        )}
      </div>

      <p className="mt-10 rounded-xl border border-dashed border-border bg-card p-4 text-xs leading-6 text-muted">
        این پوسته‌ی Next.js مسیر ورود، نشست و صفحات عمومی را در اختیار دارد؛ ماژول‌های میزکار هنوز در
        اپ فعلی (Vite) اجرا می‌شوند و یکی‌یکی به این‌جا منتقل می‌شوند. تا آن زمان از مسیر{" "}
        <Link href="/marketplace" className="font-semibold text-navy hover:underline">
          بازار
        </Link>{" "}
        برای مرور بسته‌ها استفاده کنید.
      </p>
    </div>
  )
}
