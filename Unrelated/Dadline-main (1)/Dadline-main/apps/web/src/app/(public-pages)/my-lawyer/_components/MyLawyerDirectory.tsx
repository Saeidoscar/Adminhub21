import type { ProviderType } from "@/@types/vendors"
import { getLegalCategories } from "@/server/actions/legal/getLegalCategories"
import { getLocations } from "@/server/actions/locations/getLocations"
import { getSubscriptionProviders } from "@/server/actions/subscriptions/getSubscriptionProviders"
import Link from "next/link"
import { TbAlertTriangle, TbUserHeart } from "react-icons/tb"
import Pagination from "../../_shared/providers/Pagination"
import ProviderFilters, {
  type ProviderTypeOption,
} from "../../_shared/providers/ProviderFilters"
import ServiceProviderCard from "../../_shared/providers/ServiceProviderCard"

export type MyLawyerSearchParams = {
  search?: string
  type?: string
  category?: string
  province?: string
  city?: string
  online?: string
  page?: string
}

const providerTypeOptions = [
  { value: "lawyer", label: "وکیل پایه‌یک" },
  { value: "expert", label: "کارشناس حقوقی" },
] satisfies ProviderTypeOption[]

export default async function MyLawyerDirectory({
  searchParams,
}: {
  searchParams: Promise<MyLawyerSearchParams>
}) {
  const params = await searchParams
  const filters = normalizeFilters(params)

  const [result, categoryResult, locationsResult] = await Promise.all([
    getSubscriptionProviders({
      search: filters.search,
      type: filters.type,
      category: filters.category,
      province: filters.province,
      city: filters.city,
      online: filters.online,
      page: filters.page,
      perPage: 12,
    }),
    getLegalCategories(),
    getLocations({ hasProviders: true }),
  ])

  const hasFilters = Boolean(
    filters.search ||
      filters.type ||
      filters.category ||
      filters.province ||
      filters.city ||
      filters.online,
  )

  return (
    <section>
      <ProviderFilters
        basePath="/my-lawyer"
        categories={categoryResult.categories}
        provinces={locationsResult.data ?? []}
        initial={{
          search: filters.search,
          type: filters.type,
          category: filters.category,
          province: filters.province,
          city: filters.city,
          online: filters.online ? "true" : undefined,
        }}
        providerTypeOptions={providerTypeOptions}
        searchPlaceholder="جستجوی نام وکیل یا کارشناس"
      />

      {result.error ? (
        <div
          className="flex flex-col items-center py-20 text-center text-gray-400"
          role="alert"
        >
          <TbAlertTriangle size={34} className="mb-3 text-amber-500" />
          <p className="text-base text-gray-700 dark:text-gray-200">
            دریافت فهرست وکلای مشاور با مشکل مواجه شد
          </p>
          <p className="mt-1 text-sm">{result.error}</p>
        </div>
      ) : result.providers.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white py-20 text-center dark:border-gray-800 dark:bg-gray-900">
          <TbUserHeart size={34} className="mx-auto mb-3 text-gray-300" />
          <p className="text-gray-600 dark:text-gray-300">
            ارائه‌دهنده‌ای با اشتراک فعال و این مشخصات پیدا نشد.
          </p>
          {hasFilters && (
            <Link
              href="/my-lawyer"
              className="mt-3 inline-block text-sm text-primary hover:underline"
            >
              مشاهده همه وکلای مشاور
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="mb-5 flex items-center justify-between gap-3">
            <h6
              id="subscription-providers-title"
              className="font-bold text-gray-900 dark:text-white"
            >
              وکلای پایه یک و مشاورین حقوقی
            </h6>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {result.pagination.total.toLocaleString("fa-IR")} نفر
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {result.providers.map((provider) => (
              <ServiceProviderCard key={provider.id} provider={provider} />
            ))}
          </div>

          <Pagination
            basePath="/my-lawyer"
            currentParams={{
              search: filters.search || undefined,
              type: filters.type,
              category: filters.category || undefined,
              province: filters.province || undefined,
              city: filters.city || undefined,
              online: filters.online ? "true" : undefined,
            }}
            meta={result.pagination}
          />
        </>
      )}
    </section>
  )
}

function normalizeFilters(params: MyLawyerSearchParams) {
  return {
    search: params.search?.trim().slice(0, 100) ?? "",
    type: normalizeProviderType(params.type),
    category: params.category?.trim().slice(0, 191) ?? "",
    province: params.province?.trim().slice(0, 191) ?? "",
    city: params.city?.trim().slice(0, 191) ?? "",
    online: params.online === "true",
    page: normalizePage(params.page),
  }
}

function normalizeProviderType(value?: string): ProviderType | undefined {
  return value === "lawyer" || value === "expert" ? value : undefined
}

function normalizePage(value?: string) {
  const page = Number.parseInt(value ?? "1", 10)
  return Number.isFinite(page) && page > 0 ? page : 1
}
