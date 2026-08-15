import Link from "next/link"
import { DOCUMENT_TYPES_LIST } from "../../_data/legal-documents"
import type { DocType } from "../../_data/legal-documents"

const DocTypeSiblings = ({ current }: { current: DocType }) => {
  const others = DOCUMENT_TYPES_LIST.filter((t) => t.slug !== current)

  return (
    <section className="py-14 px-4">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 mb-5">
          سایر انواع اسناد قابل تنظیم در دادلاین
        </h3>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {others.map((t) => (
            <Link
              key={t.slug}
              href={`/legal-documents/${t.slug}`}
              className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 text-sm font-medium text-gray-600 dark:text-gray-300 hover:border-primary hover:text-primary transition-colors"
            >
              تنظیم {t.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export default DocTypeSiblings
