import Link from "next/link"
import { TbClock } from "react-icons/tb"
import {
  productTypeLabel,
  type ProductListItem,
} from "@/server/actions/products/products.types"
import VendorAvatar from "./VendorAvatar"

const typeColorMap: Record<ProductListItem["type"], string> = {
  contract: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
  petition:
    "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
  bill: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
  complaint: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
  statement:
    "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
  letter: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400",
}

const formatDate = (date: string | null): string =>
  date
    ? new Intl.DateTimeFormat("fa-IR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(new Date(date))
    : "—"

const DocumentCard = ({ product }: { product: ProductListItem }) => {
  const vendorName = product.vendor?.name || "دادلاین"

  return (
    <Link
      href={`/document/${encodeURIComponent(product.slug)}`}
      className="group flex flex-col gap-3 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-primary dark:hover:border-primary hover:shadow-md transition-all duration-200"
    >
      {/* تگ‌های نوع و حوزه */}
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className={`px-2 py-0.5 rounded-md text-xs font-medium ${typeColorMap[product.type]}`}
        >
          {productTypeLabel(product.type)}
        </span>
        {product.category && (
          <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs">
            {product.category.name}
          </span>
        )}
      </div>

      {/* عنوان */}
      <h2 className="font-bold text-gray-900 dark:text-white text-sm leading-relaxed line-clamp-2 group-hover:text-primary transition-colors min-h-10">
        {product.title}
      </h2>

      {/* نویسنده */}
      <div className="flex items-center gap-2">
        <VendorAvatar
          name={vendorName}
          avatarUrl={product.vendor?.avatarUrl}
          size={32}
          shape="round"
          className="bg-primary/10 text-primary shrink-0"
        />
        <div className="min-w-0">
          <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
            {vendorName}
          </p>
          <p className="text-[11px] text-gray-400 truncate">
            {product.vendor?.role ?? "ناشر حقوقی"}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
        <span className="flex items-center gap-1 text-xs text-gray-400">
          <TbClock size={12} />
          بروزرسانی: {formatDate(product.updatedAt)}
        </span>
        <span className="text-sm font-bold text-gray-900 dark:text-white">
          {product.price.toLocaleString("fa-IR")}
          <span className="text-xs font-normal text-gray-400 mr-1">تومان</span>
        </span>
      </div>
    </Link>
  )
}

export default DocumentCard
