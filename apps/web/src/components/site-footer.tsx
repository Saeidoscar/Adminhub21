import Link from "next/link"

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-card">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg bg-navy text-xs font-extrabold text-white">
              AH
            </span>
            <span className="font-extrabold text-foreground">AdminHub21</span>
          </div>
          <p className="mt-3 max-w-md text-sm leading-6 text-muted">
            بازار متخصصان محتوا، ادیتورها، ابزارها و قراردادهای الکترونیکی؛ با پروفایل تأییدشده،
            بسته‌های قیمت‌گذاری‌شده و کیف پول یکپارچه.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-bold text-foreground">محصول</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li>
              <Link className="hover:text-foreground" href="/marketplace">
                بازار
              </Link>
            </li>
            <li>
              <Link className="hover:text-foreground" href="/pricing">
                تعرفه‌ها
              </Link>
            </li>
            <li>
              <Link className="hover:text-foreground" href="/changelog">
                تغییرات
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-bold text-foreground">حساب</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li>
              <Link className="hover:text-foreground" href="/sign-in">
                ورود
              </Link>
            </li>
            <li>
              <Link className="hover:text-foreground" href="/sign-in?redirectUrl=%2Fapp">
                ساخت حساب
              </Link>
            </li>
            <li>
              <Link className="hover:text-foreground" href="/app">
                میزکار
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border py-5 text-center text-xs text-muted">
        © {new Date().getFullYear()} AdminHub21 · نسخه{" "}
        {process.env.NEXT_PUBLIC_APP_VERSION ?? "1.0.0"}
      </div>
    </footer>
  )
}
