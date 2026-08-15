import Link from "next/link"
import { TbAlertTriangle } from "react-icons/tb"
import ProviderCard from "../../_shared/providers/ProviderCard"
import ProviderFilters from "../../_shared/providers/ProviderFilters"
import Pagination from "../../_shared/providers/Pagination"
import type {
  LegalCategory,
  Province,
  Provider,
} from "../../_shared/providers/types"

type SearchParams = {
  search?: string
  city?: string
  province?: string
  category?: string
  online?: string
  page?: string
}

type Props = {
  lawyers: Provider[]
  pagination: {
    current_page: number
    last_page: number
    total: number
    per_page: number
  }
  fetchError: string | null
  categories: LegalCategory[]
  provinces: Province[]
  searchParams: SearchParams
  /** برای صفحات /city/[city] و /specialty/[specialty] که همین کامپوننت رو با عنوان اختصاصی استفاده می‌کنن */
  titleOverride?: string
  breadcrumbExtra?: { label: string }[]
}

const LawyerPageContent = ({
  lawyers,
  pagination,
  fetchError,
  categories,
  provinces,
  searchParams,
  titleOverride,
  breadcrumbExtra = [],
}: Props) => {
  const title = titleOverride ?? "وکیل‌های پایه یک ایران"

  return (
    <main className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* بردکرامب */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6 flex-wrap">
          <Link href="/" className="hover:text-primary">
            دادلاین
          </Link>
          <span>/</span>
          <Link href="/lawyer" className="hover:text-primary">
            وکیل پایه یک
          </Link>
          {breadcrumbExtra.map((item) => (
            <span key={item.label} className="flex items-center gap-2">
              <span>/</span>
              <span className="text-gray-900 dark:text-white">
                {item.label}
              </span>
            </span>
          ))}
        </nav>

        {/* عنوان */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {title}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            بهترین وکیل‌های پایه یک را بر اساس تخصص، عملکرد و تجربه جستجو کنید
          </p>
        </div>

        {/* فیلترها */}
        <ProviderFilters
          basePath="/lawyer"
          categories={categories}
          provinces={provinces}
          initial={searchParams}
          searchPlaceholder="جستجوی نام وکیل"
        />

        {/* خطای دریافت داده */}
        {fetchError ? (
          <div className="flex flex-col items-center text-center py-20 text-gray-400">
            <TbAlertTriangle size={32} className="text-amber-500 mb-3" />
            <p className="text-lg text-gray-600 dark:text-gray-300">
              مشکلی در دریافت لیست وکلا پیش آمد
            </p>
            <p className="text-sm mt-1">{fetchError}</p>
          </div>
        ) : lawyers.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg">وکیلی با این مشخصات پیدا نشد</p>
            <Link
              href="/lawyer"
              className="text-sm text-primary mt-2 inline-block hover:underline"
            >
              مشاهده همه وکلا
            </Link>
          </div>
        ) : (
          <>
            {/* <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
                            {pagination.total.toLocaleString('fa-IR')} وکیل یافت شد
                        </p> */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {lawyers.map((lawyer) => (
                <ProviderCard
                  key={lawyer.id}
                  provider={lawyer}
                  basePath="/lawyer"
                />
              ))}
            </div>
            <Pagination
              basePath="/lawyer"
              currentParams={{
                search: searchParams.search,
                province: searchParams.province,
                city: searchParams.city,
                category: searchParams.category,
                online: searchParams.online,
              }}
              meta={pagination}
            />
          </>
        )}
      </div>
    </main>
  )
}

export default LawyerPageContent
