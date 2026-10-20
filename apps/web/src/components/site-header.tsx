import Link from "next/link"

const NAV = [
  { href: "/marketplace", label: "بازار" },
  { href: "/pricing", label: "تعرفه‌ها" },
  { href: "/roadmap", label: "نقشه‌ی راه" },
  { href: "/changelog", label: "تغییرات" },
  { href: "/about", label: "درباره ما" },
]

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2" aria-label="AdminHub21 — خانه">
          <span className="grid size-9 place-items-center rounded-xl bg-navy text-sm font-extrabold text-white">
            AH
          </span>
          <span className="text-base font-extrabold tracking-tight text-foreground">
            AdminHub21
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="ناوبری اصلی">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted transition hover:bg-subtle hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/sign-in"
            className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-foreground transition hover:bg-subtle sm:block"
          >
            ورود
          </Link>
          <Link
            href="/sign-in?redirectUrl=%2Fapp"
            className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white transition hover:bg-navy-light"
          >
            شروع کار
          </Link>

          {/* No-JS mobile menu: <details> keeps the header a server component. */}
          <details className="group relative lg:hidden">
            <summary
              className="grid size-9 cursor-pointer list-none place-items-center rounded-lg border border-border text-foreground transition hover:bg-subtle [&::-webkit-details-marker]:hidden"
              aria-label="منو"
            >
              <span className="sr-only">منو</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </summary>
            <nav
              className="absolute left-0 top-11 w-52 rounded-xl border border-border bg-card p-2 shadow-lg"
              aria-label="ناوبری موبایل"
            >
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-muted transition hover:bg-subtle hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/sign-in"
                className="mt-1 block rounded-lg border-t border-border px-3 py-2 text-sm font-semibold text-foreground sm:hidden"
              >
                ورود
              </Link>
            </nav>
          </details>
        </div>
      </div>
    </header>
  )
}
