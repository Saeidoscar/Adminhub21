import Link from "next/link"

const NAV = [
  { href: "/marketplace", label: "بازار" },
  { href: "/pricing", label: "تعرفه‌ها" },
  { href: "/changelog", label: "تغییرات" },
]

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-xl bg-navy text-sm font-extrabold text-white">
            AH
          </span>
          <span className="text-base font-extrabold tracking-tight text-foreground">
            AdminHub21
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="ناوبری اصلی">
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
            className="rounded-lg px-3 py-2 text-sm font-semibold text-foreground transition hover:bg-subtle"
          >
            ورود
          </Link>
          <Link
            href="/sign-in?redirectUrl=%2Fapp"
            className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white transition hover:bg-navy-light"
          >
            شروع کار
          </Link>
        </div>
      </div>
    </header>
  )
}
