import Link from "next/link"

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="text-sm font-bold text-amber">۴۰۴</p>
      <h1 className="mt-2 text-3xl font-extrabold text-foreground">این صفحه پیدا نشد</h1>
      <p className="mt-3 text-sm leading-7 text-muted">
        ممکن است بسته حذف یا آدرس جابه‌جا شده باشد. از بازار شروع کنید.
      </p>
      <Link
        href="/marketplace"
        className="mt-8 inline-block rounded-xl bg-navy px-6 py-3 text-sm font-bold text-white transition hover:bg-navy-light"
      >
        رفتن به بازار
      </Link>
    </div>
  )
}
