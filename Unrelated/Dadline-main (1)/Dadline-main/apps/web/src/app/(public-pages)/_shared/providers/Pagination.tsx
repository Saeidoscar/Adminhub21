import Link from "next/link"
import { TbChevronRight, TbChevronLeft } from "react-icons/tb"

type Props = {
  /** مسیر پایه، مثلاً /lawyer */
  basePath: string
  /** پارامترهای فعلی URL بدون page — برای حفظ فیلترها هنگام تغییر صفحه */
  currentParams: Record<string, string | undefined>
  meta: { current_page: number last_page: number }
}

const buildHref = (
  basePath: string,
  currentParams: Record<string, string | undefined>,
  page: number,
) => {
  const params = new URLSearchParams()
  Object.entries(currentParams).forEach(([key, value]) => {
    if (value) params.set(key, value)
  })
  if (page > 1) params.set("page", String(page))
  const qs = params.toString()
  return qs ? `${basePath}?${qs}` : basePath
}

const getPageWindow = (current: number, last: number): (number | "gap")[] => {
  const pages: (number | "gap")[] = []
  const window = 1

  const start = Math.max(2, current - window)
  const end = Math.min(last - 1, current + window)

  pages.push(1)
  if (start > 2) pages.push("gap")
  for (let i = start; i <= end; i++) pages.push(i)
  if (end < last - 1) pages.push("gap")
  if (last > 1) pages.push(last)

  return pages
}

const Pagination = ({ basePath, currentParams, meta }: Props) => {
  if (meta.last_page <= 1) return null

  const pages = getPageWindow(meta.current_page, meta.last_page)

  return (
    <nav
      className="flex items-center justify-center gap-1.5 mt-10"
      aria-label="صفحه‌بندی"
    >
      <Link
        href={buildHref(
          basePath,
          currentParams,
          Math.max(1, meta.current_page - 1),
        )}
        aria-disabled={meta.current_page <= 1}
        className={`flex items-center justify-center w-9 h-9 rounded-lg border text-sm transition-colors ${
          meta.current_page <= 1
            ? "pointer-events-none opacity-40 border-gray-200 dark:border-gray-800"
            : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-primary hover:text-primary"
        }`}
      >
        <TbChevronRight size={16} />
      </Link>

      {pages.map((p, i) =>
        p === "gap" ? (
          <span
            key={`gap-${i}`}
            className="w-9 h-9 flex items-center justify-center text-sm text-gray-400"
          >
            …
          </span>
        ) : (
          <Link
            key={p}
            href={buildHref(basePath, currentParams, p)}
            className={`flex items-center justify-center w-9 h-9 rounded-lg border text-sm font-medium transition-colors ${
              p === meta.current_page
                ? "bg-primary text-white border-primary"
                : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-primary hover:text-primary"
            }`}
          >
            {p.toLocaleString("fa-IR")}
          </Link>
        ),
      )}

      <Link
        href={buildHref(
          basePath,
          currentParams,
          Math.min(meta.last_page, meta.current_page + 1),
        )}
        aria-disabled={meta.current_page >= meta.last_page}
        className={`flex items-center justify-center w-9 h-9 rounded-lg border text-sm transition-colors ${
          meta.current_page >= meta.last_page
            ? "pointer-events-none opacity-40 border-gray-200 dark:border-gray-800"
            : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-primary hover:text-primary"
        }`}
      >
        <TbChevronLeft size={16} />
      </Link>
    </nav>
  )
}

export default Pagination
