import Link from "next/link"

const PRODUCT = [
  { href: "/marketplace", label: "بازار" },
  { href: "/pricing", label: "تعرفه‌ها" },
  { href: "/changelog", label: "تغییرات" },
  { href: "/roadmap", label: "نقشه‌ی راه" },
]

const COMPANY = [
  { href: "/about", label: "درباره ما" },
  { href: "https://github.com/Saeidoscar/Adminhub21", label: "مخزن کد", external: true },
  { href: "mailto:hello@adminhub21.com", label: "تماس", external: true },
]

const LEGAL = [
  { href: "/terms", label: "شرایط استفاده" },
  { href: "/privacy", label: "حریم خصوصی" },
]

function Column({
  title,
  links,
}: {
  title: string
  links: { href: string; label: string; external?: boolean }[]
}) {
  return (
    <div>
      <h2 className="text-sm font-bold text-foreground">{title}</h2>
      <ul className="mt-3 space-y-2 text-sm text-muted">
        {links.map((link) => (
          <li key={link.href}>
            {link.external ? (
              <a className="transition hover:text-foreground" href={link.href}>
                {link.label}
              </a>
            ) : (
              <Link className="transition hover:text-foreground" href={link.href}>
                {link.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function SiteFooter() {
  const year = new Intl.DateTimeFormat("fa-IR", { year: "numeric" }).format(new Date())

  return (
    <footer className="mt-24 border-t border-border bg-card">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 md:grid-cols-4">
        <div className="sm:col-span-2">
          <Link href="/" className="flex items-center gap-2" aria-label="AdminHub21">
            <span className="grid size-8 place-items-center rounded-lg bg-navy text-xs font-extrabold text-white">
              AH
            </span>
            <span className="font-extrabold text-foreground">AdminHub21</span>
          </Link>
          <p className="mt-3 max-w-md text-sm leading-6 text-muted">
            بازار متخصصان محتوا، ادیتورها، ابزارها و قراردادهای الکترونیکی؛ با پروفایل تأییدشده،
            بسته‌های قیمت‌گذاری‌شده و کیف پول یکپارچه.
          </p>
          <p className="mt-4 text-sm text-muted" dir="ltr">
            hello@adminhub21.com
          </p>
        </div>

        <Column title="محصول" links={PRODUCT} />
        <div className="grid gap-8 sm:grid-cols-1">
          <Column title="شرکت" links={COMPANY} />
          <Column title="قانونی" links={LEGAL} />
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} AdminHub21 — همه‌ی حقوق محفوظ است.</p>
          <p>ساخته‌شده در ایران · Next.js و Laravel · آماده‌ی مقیاس</p>
        </div>
      </div>
    </footer>
  )
}
