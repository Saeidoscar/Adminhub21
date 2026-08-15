"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { TbChevronDown, TbSearch } from "react-icons/tb"
import {
  PRODUCT_TYPES,
  SORT_OPTIONS,
  productTypeLabel,
  type ProductFilters,
  type ProductListItem,
  type ProductPagination,
  type ProductSort,
  type ProductType,
} from "@/server/actions/products/products.types"
import Pagination from "../../_shared/providers/Pagination"
import DocumentCard from "./DocumentCard"

type Props = {
  products: ProductListItem[]
  filters: ProductFilters
  pagination: ProductPagination
  error: string | null
  initialType?: string
  initialCategory?: string
  initialVendor?: string
  initialSearch?: string
  initialSort?: string
}

const isValidType = (value?: string): value is ProductType =>
  !!value && PRODUCT_TYPES.includes(value as ProductType)

const isValidSort = (value?: string): value is ProductSort =>
  !!value && SORT_OPTIONS.some((option) => option.slug === value)

const DocumentPageContent = ({
  products,
  filters,
  pagination,
  error,
  initialType,
  initialCategory,
  initialVendor,
  initialSearch,
  initialSort,
}: Props) => {
  const router = useRouter()
  const type = isValidType(initialType) ? initialType : ""
  const category = initialCategory ?? ""
  const vendor = initialVendor ?? ""
  const search = initialSearch ?? ""
  const sort = isValidSort(initialSort) ? initialSort : "best-selling"

  const buildUrl = ({
    nextType = type,
    nextCategory = category,
    nextVendor = vendor,
    nextSearch = search,
    nextSort = sort,
    page,
  }: {
    nextType?: ProductType | ""
    nextCategory?: string
    nextVendor?: string
    nextSearch?: string
    nextSort?: ProductSort
    page?: number
  } = {}): string => {
    const params = new URLSearchParams()

    if (nextType) params.set("type", nextType)
    if (nextCategory) params.set("category", nextCategory)
    if (nextVendor) params.set("vendor", nextVendor)
    if (nextSearch) params.set("search", nextSearch)
    if (nextSort !== "best-selling") params.set("sort", nextSort)
    if (page && page > 1) params.set("page", String(page))

    const query = params.toString()

    return query ? `/document?${query}` : "/document"
  }

  const typeCounts = new Map(
    filters.types.map((item) => [item.type, item.count]),
  )

  return (
    <main className="min-h-screen px-4 pt-24 pb-16">
      <div className="mx-auto max-w-7xl">
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Link href="/" className="hover:text-primary">
            دادلاین
          </Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-white">
            بانک مستندات حقوقی
          </span>
        </nav>

        <div className="mb-8">
          <h1 className="mb-2 text-2xl font-bold text-gray-900 md:text-3xl dark:text-white">
            بانک مستندات حقوقی دادلاین
          </h1>
          <p className="max-w-3xl text-sm leading-relaxed text-gray-500 dark:text-gray-400">
            تمامی مستندات حقوقی موجود در بانک دادلاین توسط وکلای پایه یک
            دادگستری و کارشناسان حقوقی متخصص تدوین شده‌اند.
          </p>
        </div>

        <div className="-mx-1 mb-4 flex items-center gap-2 overflow-x-auto px-1 pb-1">
          <button
            type="button"
            onClick={() => router.push(buildUrl({ nextType: "", page: 1 }))}
            className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
              type === ""
                ? "border-primary bg-primary text-white"
                : "hover:border-primary hover:text-primary border-gray-200 bg-white text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400"
            }`}
          >
            همه محصولات
            <span
              className={`rounded-md px-1.5 py-0.5 text-xs ${
                type === "" ? "bg-white/20" : "bg-gray-100 dark:bg-gray-800"
              }`}
            >
              {filters.total.toLocaleString("fa-IR")}
            </span>
          </button>

          {PRODUCT_TYPES.map((productType) => (
            <button
              type="button"
              key={productType}
              onClick={() =>
                router.push(
                  buildUrl({
                    nextType: productType,
                    page: 1,
                  }),
                )
              }
              className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                type === productType
                  ? "border-primary bg-primary text-white"
                  : "hover:border-primary hover:text-primary border-gray-200 bg-white text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400"
              }`}
            >
              {productTypeLabel(productType)}
              <span
                className={`rounded-md px-1.5 py-0.5 text-xs ${
                  type === productType
                    ? "bg-white/20"
                    : "bg-gray-100 dark:bg-gray-800"
                }`}
              >
                {(typeCounts.get(productType) ?? 0).toLocaleString("fa-IR")}
              </span>
            </button>
          ))}
        </div>

        <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex flex-col gap-3 sm:flex-row">
            <form action="/document" method="get" className="relative flex-1">
              {type && <input type="hidden" name="type" value={type} />}
              {category && (
                <input type="hidden" name="category" value={category} />
              )}
              {vendor && <input type="hidden" name="vendor" value={vendor} />}
              {sort !== "best-selling" && (
                <input type="hidden" name="sort" value={sort} />
              )}
              <TbSearch
                size={16}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400"
              />
              <input
                type="search"
                name="search"
                defaultValue={search}
                placeholder="جستجو در عنوان سند..."
                className="focus:border-primary w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pr-9 pl-3 text-sm text-gray-700 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              />
            </form>

            <div className="relative sm:w-56">
              <select
                value={category}
                onChange={(event) =>
                  router.push(
                    buildUrl({
                      nextCategory: event.target.value,
                      page: 1,
                    }),
                  )
                }
                className="focus:border-primary w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              >
                <option value="">همه حوزه‌ها</option>
                {filters.categories.map((item) => (
                  <option key={item.slug} value={item.slug}>
                    {item.name} ({item.count.toLocaleString("fa-IR")})
                  </option>
                ))}
              </select>
              <TbChevronDown
                size={16}
                className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
              />
            </div>

            <div className="relative sm:w-52">
              <select
                value={sort}
                onChange={(event) =>
                  router.push(
                    buildUrl({
                      nextSort: event.target.value as ProductSort,
                      page: 1,
                    }),
                  )
                }
                className="focus:border-primary w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.slug} value={option.slug}>
                    {option.label}
                  </option>
                ))}
              </select>
              <TbChevronDown
                size={16}
                className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
              />
            </div>
          </div>
        </div>

        {error ? (
          <div className="py-20 text-center text-red-500">
            <p>{error}</p>
            <Link
              href="/document"
              className="text-primary mt-2 inline-block text-sm hover:underline"
            >
              تلاش مجدد
            </Link>
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center text-gray-400">
            <p className="text-lg">سندی با این مشخصات پیدا نشد</p>
            <Link
              href="/document"
              className="text-primary mt-2 inline-block text-sm hover:underline"
            >
              مشاهده همه محصولات
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <DocumentCard key={product.slug} product={product} />
              ))}
            </div>

            {pagination.lastPage > 1 && (
              <Pagination
                basePath="/document"
                currentParams={{
                  type: type || undefined,
                  category: category || undefined,
                  vendor: vendor || undefined,
                  search: search || undefined,
                  sort: sort === "best-selling" ? undefined : sort,
                }}
                meta={{
                  current_page: pagination.currentPage,
                  last_page: pagination.lastPage,
                }}
              />
            )}
          </>
        )}
      </div>
    </main>
  )
}

export default DocumentPageContent
