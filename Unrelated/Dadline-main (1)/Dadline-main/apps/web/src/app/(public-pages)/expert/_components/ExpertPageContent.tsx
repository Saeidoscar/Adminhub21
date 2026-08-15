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
  experts: Provider[]
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
  titleOverride?: string
  breadcrumbExtra?: { label: string }[]
}

const ExpertPageContent = ({
  experts,
  pagination,
  fetchError,
  categories,
  provinces,
  searchParams,
  titleOverride,
  breadcrumbExtra = [],
}: Props) => {
  const title = titleOverride ?? "کارشناسان حقوقی ایران"

  return (
    <main className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* بردکرامب */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6 flex-wrap">
          <Link href="/" className="hover:text-primary">
            دادلاین
          </Link>
          <span>/</span>
          <Link href="/expert" className="hover:text-primary">
            کارشناس حقوقی
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
            بهترین کارشناسان حقوقی را بر اساس تخصص، عملکرد و تجربه جستجو کنید
          </p>
        </div>

        {/* فیلترها */}
        <ProviderFilters
          basePath="/expert"
          categories={categories}
          provinces={provinces}
          initial={searchParams}
          searchPlaceholder="جستجوی نام کارشناس"
        />

        {/* خطای دریافت داده */}
        {fetchError ? (
          <div className="flex flex-col items-center text-center py-20 text-gray-400">
            <TbAlertTriangle size={32} className="text-amber-500 mb-3" />
            <p className="text-lg text-gray-600 dark:text-gray-300">
              مشکلی در دریافت لیست کارشناسان پیش آمد
            </p>
            <p className="text-sm mt-1">{fetchError}</p>
          </div>
        ) : experts.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg">کارشناسی با این مشخصات پیدا نشد</p>
            <Link
              href="/expert"
              className="text-sm text-primary mt-2 inline-block hover:underline"
            >
              مشاهده همه کارشناسان
            </Link>
          </div>
        ) : (
          <>
            {/* <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
                            {pagination.total.toLocaleString('fa-IR')} کارشناس یافت شد
                        </p> */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {experts.map((expert) => (
                <ProviderCard
                  key={expert.id}
                  provider={expert}
                  basePath="/expert"
                />
              ))}
            </div>
            <Pagination
              basePath="/expert"
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

export default ExpertPageContent
