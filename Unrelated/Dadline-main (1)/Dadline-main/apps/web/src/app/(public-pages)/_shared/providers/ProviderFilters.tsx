"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { TbChevronDown, TbSearch, TbX } from "react-icons/tb"
import type {
  LegalCategory,
  Province,
  ProviderFilterParams,
  ProviderType,
} from "./types"

export type ProviderTypeOption = {
  value: ProviderType
  label: string
}

type Props = {
  basePath: string
  categories: LegalCategory[]
  provinces: Province[]
  initial: ProviderFilterParams
  providerTypeOptions?: ProviderTypeOption[]
  searchPlaceholder?: string
}

const ProviderFilters = ({
  basePath,
  categories,
  provinces,
  initial,
  providerTypeOptions,
  searchPlaceholder = "جستجوی نام وکیل یا کارشناس",
}: Props) => {
  const router = useRouter()

  const [search, setSearch] = useState(initial.search ?? "")
  const [type, setType] = useState<ProviderType | "">(initial.type ?? "")
  const [province, setProvince] = useState(initial.province ?? "")
  const [city, setCity] = useState(initial.city ?? "")
  const [category, setCategory] = useState(initial.category ?? "")
  const [online, setOnline] = useState(initial.online === "true")

  const isFirstRender = useRef(true)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const navigate = (
    next: Partial<{
      search: string
      type: ProviderType | ""
      province: string
      city: string
      category: string
      online: boolean
    }>,
  ) => {
    const merged = {
      search: next.search ?? search,
      type: next.type ?? type,
      province: next.province ?? province,
      city: next.city ?? city,
      category: next.category ?? category,
      online: next.online ?? online,
    }
    const params = new URLSearchParams()
    if (merged.search) params.set("search", merged.search)
    if (merged.type) params.set("type", merged.type)
    if (merged.province) params.set("province", merged.province)
    if (merged.city) params.set("city", merged.city)
    if (merged.category) params.set("category", merged.category)
    if (merged.online) params.set("online", "true")
    const qs = params.toString()
    router.push(qs ? `${basePath}?${qs}` : basePath)
  }

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      navigate({ search })
    }, 1000)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [search])

  const handleProvinceChange = (val: string) => {
    setProvince(val)
    setCity("")
    navigate({ province: val, city: "" })
  }

  const handleTypeChange = (value: string) => {
    const next = value === "lawyer" || value === "expert" ? value : ""
    setType(next)
    navigate({ type: next })
  }

  const handleCityChange = (val: string) => {
    setCity(val)
    navigate({ city: val })
  }

  const handleCategoryChange = (val: string) => {
    setCategory(val)
    navigate({ category: val })
  }

  const handleOnlineToggle = () => {
    const next = !online
    setOnline(next)
    navigate({ online: next })
  }

  const handleReset = () => {
    setSearch("")
    setType("")
    setProvince("")
    setCity("")
    setCategory("")
    setOnline(false)
    router.push(basePath)
  }

  const hasFilter = search || type || province || city || category || online

  const selectedProvince = provinces.find((p) => p.slug === province)
  const cityGroups = selectedProvince ? [selectedProvince] : provinces
  const categoryOptions = flattenCategories(categories)

  return (
    <section className="mb-8 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <div
        className={`grid gap-3 sm:grid-cols-2 lg:grid-cols-3 ${
          providerTypeOptions?.length ? "xl:grid-cols-7" : "xl:grid-cols-6"
        }`}
      >
        <label className="relative sm:col-span-2 lg:col-span-3 xl:col-span-2">
          <span className="sr-only">جستجوی نام</span>
          <TbSearch
            size={17}
            className="absolute inset-s-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pe-4 ps-10 text-sm text-gray-700 outline-none transition focus:border-primary dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          />
        </label>

        <FilterSelect label="دسته‌بندی حقوقی">
          <select
            value={category}
            onChange={(event) => handleCategoryChange(event.target.value)}
            className={selectClassName}
          >
            <option value="">همه دسته‌بندی‌ها</option>
            {categoryOptions.map((option) => (
              <option key={option.category.id} value={option.category.slug}>
                {"— ".repeat(option.depth)}
                {option.category.name}
              </option>
            ))}
          </select>
        </FilterSelect>

        <FilterSelect label="استان">
          <select
            value={province}
            onChange={(event) => handleProvinceChange(event.target.value)}
            className={selectClassName}
          >
            <option value="">همه استان‌ها</option>
            {provinces.map((item) => (
              <option key={item.id} value={item.slug}>
                {item.name}
              </option>
            ))}
          </select>
        </FilterSelect>

        <FilterSelect label="شهر">
          <select
            value={city}
            onChange={(event) => handleCityChange(event.target.value)}
            className={selectClassName}
          >
            <option value="">همه شهرها</option>
            {cityGroups.map((item) => (
              <optgroup key={item.id} label={item.name}>
                {item.cities.map((cityItem) => (
                  <option key={cityItem.id} value={cityItem.slug}>
                    {cityItem.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </FilterSelect>

        {providerTypeOptions?.length ? (
          <FilterSelect label="نوع ارائه‌دهنده">
            <select
              value={type}
              onChange={(event) => handleTypeChange(event.target.value)}
              className={selectClassName}
            >
              <option value="">همه ارائه‌دهندگان</option>
              {providerTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FilterSelect>
        ) : null}

        <div className="flex gap-2 sm:col-span-2 lg:col-span-3 xl:col-span-1">
          <button
            type="button"
            onClick={handleOnlineToggle}
            aria-pressed={online}
            className={`h-11 flex-1 whitespace-nowrap rounded-xl border px-4 text-sm font-medium transition ${
              online
                ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400"
                : "border-gray-200 text-gray-600 hover:border-primary hover:text-primary dark:border-gray-700 dark:text-gray-400"
            }`}
          >
            فقط آنلاین‌ها
          </button>
          {hasFilter && (
            <button
              type="button"
              onClick={handleReset}
              aria-label="پاک کردن فیلترها"
              className="flex h-11 items-center gap-1.5 rounded-xl border border-gray-200 px-3 text-sm text-gray-600 transition hover:border-red-300 hover:text-red-500 dark:border-gray-700 dark:text-gray-400"
            >
              <TbX size={15} />
              <span className="hidden 2xl:inline">بازنشانی</span>
            </button>
          )}
        </div>
      </div>
    </section>
  )
}

const selectClassName =
  "h-11 w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 px-3 pe-9 text-sm text-gray-700 outline-none transition focus:border-primary dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"

function FilterSelect({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <label className="relative min-w-0">
      <span className="sr-only">{label}</span>
      {children}
      <TbChevronDown
        size={16}
        className="pointer-events-none absolute inset-e-3 top-1/2 -translate-y-1/2 text-gray-400"
      />
    </label>
  )
}

function flattenCategories(
  categories: LegalCategory[],
  depth = 0,
): Array<{ category: LegalCategory depth: number }> {
  return categories.flatMap((category) => [
    { category, depth },
    ...flattenCategories(category.children ?? [], depth + 1),
  ])
}

export default ProviderFilters
