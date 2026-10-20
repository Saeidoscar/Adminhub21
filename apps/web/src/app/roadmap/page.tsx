import type { Metadata } from "next"
import Link from "next/link"

import { HOSTING, NON_GOALS, PHASES } from "@/lib/roadmap"

export const metadata: Metadata = {
  title: "نقشه‌ی راه",
  description:
    "مسیر AdminHub21 از نسخه ۱.۰ تا تیم، اولین درآمد، زیرساخت ایران و دستیار هوشمند — با معیار خروج هر فاز.",
  alternates: { canonical: "/roadmap" },
}

const STATUS: Record<string, { label: string; className: string }> = {
  done: { label: "انجام‌شده", className: "bg-emerald/10 text-emerald" },
  active: { label: "در جریان", className: "bg-amber/15 text-amber" },
  next: { label: "پیشِ رو", className: "bg-subtle text-muted" },
}

export default function RoadmapPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <nav className="text-xs text-muted" aria-label="مسیر">
        <Link href="/" className="hover:text-foreground">
          خانه
        </Link>
        <span className="mx-2">/</span>
        <span>نقشه‌ی راه</span>
      </nav>

      <header className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-amber">Roadmap</p>
        <h1 className="mt-2 text-3xl font-extrabold text-foreground md:text-4xl">نقشه‌ی راه</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
          نسخه ۱.۰ منتشر شده است. از اینجا به بعد هر فاز یک معیار خروج دارد و تا آن معیار محقق نشود،
          فاز بعد شروع نمی‌شود. ترتیب مهم است: تیم و اعتماد قبل از درآمد، درآمد قبل از زیرساخت سنگین.
        </p>
      </header>

      <ol className="mt-12 space-y-6">
        {PHASES.map((phase, index) => {
          const status = STATUS[phase.status]
          return (
            <li
              key={phase.id}
              className="relative rounded-2xl border border-border bg-card p-6 shadow-sm"
            >
              <div className="flex flex-wrap items-center gap-3">
                <span className="grid size-11 place-items-center rounded-xl bg-navy text-sm font-extrabold text-white">
                  {phase.id}
                </span>
                <div className="flex-1">
                  <h2 className="text-lg font-extrabold text-foreground">{phase.title}</h2>
                  <p className="text-xs text-muted">{phase.window}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${status.className}`}>
                  {status.label}
                </span>
              </div>

              <p className="mt-4 text-sm leading-7 text-foreground">{phase.goal}</p>

              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {phase.items.map((item) => (
                  <li key={item.label} className="flex items-start gap-2 text-sm">
                    <span
                      aria-hidden
                      className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full text-[11px] font-bold ${
                        item.done ? "bg-emerald/15 text-emerald" : "bg-subtle text-muted"
                      }`}
                    >
                      {item.done ? "✓" : "•"}
                    </span>
                    <span className={item.done ? "text-muted" : "text-foreground"}>
                      {item.label}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-5 rounded-xl border border-border bg-subtle px-4 py-3 text-sm">
                <span className="font-bold text-foreground">معیار خروج: </span>
                <span className="text-muted">{phase.exit}</span>
              </div>

              {index < PHASES.length - 1 && (
                <span
                  aria-hidden
                  className="absolute -bottom-6 right-11 hidden h-6 w-px bg-border sm:block"
                />
              )}
            </li>
          )
        })}
      </ol>

      <section className="mt-16" aria-labelledby="hosting">
        <h2 id="hosting" className="text-2xl font-extrabold text-foreground">
          پیشنهاد زیرساخت
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">{HOSTING.note}</p>

        <div className="mt-5 overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-right text-sm">
            <thead className="bg-subtle text-xs text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">سرویس</th>
                <th className="px-4 py-3 font-semibold">مشخصات</th>
                <th className="px-4 py-3 font-semibold">ماهانه (تومان)</th>
              </tr>
            </thead>
            <tbody>
              {HOSTING.rows.map((row) => (
                <tr key={row.service} className="border-t border-border">
                  <td className="px-4 py-3 font-semibold text-foreground">{row.service}</td>
                  <td className="px-4 py-3 text-muted">{row.spec}</td>
                  <td className="px-4 py-3 tabular-nums text-foreground">{row.price}</td>
                </tr>
              ))}
              <tr className="border-t border-border bg-subtle">
                <td className="px-4 py-3 font-extrabold text-foreground" colSpan={2}>
                  جمع
                </td>
                <td className="px-4 py-3 font-extrabold tabular-nums text-foreground">
                  ≈ {HOSTING.total}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs leading-6 text-muted">
          قیمت‌ها بر اساس تعرفه‌ی ابر آروان در زمان انتشار. Redis مدیریت‌شده وجود ندارد، ایمیل تراکنشی
          روی پورت ۲۵/۴۶۵ بسته است و APM ندارد؛ هر سه در طراحی لحاظ شده‌اند.
        </p>
      </section>

      <section className="mt-16" aria-labelledby="non-goals">
        <h2 id="non-goals" className="text-2xl font-extrabold text-foreground">
          چیزی که عمداً نمی‌سازیم
        </h2>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {NON_GOALS.map((item) => (
            <li key={item.idea} className="rounded-xl border border-border bg-card p-4">
              <p className="text-sm font-bold text-foreground">{item.idea}</p>
              <p className="mt-1 text-xs leading-6 text-muted">{item.why}</p>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-16 rounded-2xl bg-navy px-6 py-8 text-white">
        <h2 className="text-xl font-extrabold">سؤال یا پیشنهاد دارید؟</h2>
        <p className="mt-2 max-w-xl text-sm leading-7 text-white/70">
          نقشه‌ی راه یک قول نیست؛ یک ترتیب است. اگر داده چیز دیگری گفت، ترتیب عوض می‌شود — ولی دلیلش
          نوشته می‌شود.
        </p>
        <Link
          href="/about"
          className="mt-5 inline-block rounded-xl bg-amber px-5 py-2.5 text-sm font-bold text-navy-dark transition hover:brightness-105"
        >
          درباره‌ی AdminHub21
        </Link>
      </div>
    </div>
  )
}
