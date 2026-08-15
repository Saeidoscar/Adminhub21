import Link from 'next/link'
import type { PaginationMeta } from '@/server/admin/admin.schemas'

type Props = {
    meta: PaginationMeta
    pathname: string
    params: URLSearchParams
}

const Pagination = ({ meta, pathname, params }: Props) => {
    if (meta.lastPage <= 1) return null

    const pageLink = (page: number) => {
        const next = new URLSearchParams(params)
        next.set('page', String(page))
        return `${pathname}?${next.toString()}`
    }

    return (
        <div className="flex items-center justify-between gap-4 border-t border-gray-100 px-5 py-4 text-sm dark:border-gray-800">
            <span className="text-gray-500">
                صفحه {new Intl.NumberFormat('fa-IR').format(meta.currentPage)} از{' '}
                {new Intl.NumberFormat('fa-IR').format(meta.lastPage)}
            </span>
            <div className="flex gap-2">
                <Link
                    aria-disabled={meta.currentPage <= 1}
                    className="rounded-xl border border-gray-200 px-4 py-2 font-bold text-gray-700 aria-disabled:pointer-events-none aria-disabled:opacity-40 dark:border-gray-700 dark:text-gray-200"
                    href={pageLink(Math.max(1, meta.currentPage - 1))}
                >
                    قبلی
                </Link>
                <Link
                    aria-disabled={meta.currentPage >= meta.lastPage}
                    className="rounded-xl border border-gray-200 px-4 py-2 font-bold text-gray-700 aria-disabled:pointer-events-none aria-disabled:opacity-40 dark:border-gray-700 dark:text-gray-200"
                    href={pageLink(Math.min(meta.lastPage, meta.currentPage + 1))}
                >
                    بعدی
                </Link>
            </div>
        </div>
    )
}

export default Pagination
