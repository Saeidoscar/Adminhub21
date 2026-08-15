// ─────────────────────────────────────────────────────────────
// تایپ‌های مشترک بخش «ارائه‌دهندگان خدمات حقوقی» — قابل استفاده
// هم برای /lawyer و هم برای /expert (که بعداً از روی همین ساخته می‌شود).
// ─────────────────────────────────────────────────────────────

import type { ProviderType } from "@/@types/vendors"

export type {
  Provider,
  ProviderType,
  Expertise,
  LocationRef,
  ProviderReview,
} from "@/@types/vendors"
export type { LegalCategory } from "@/server/actions/legal/getLegalCategories"
export type { Province, City } from "@/server/actions/locations/getLocations"
export type { PaginatedResponse } from "@/@types/pagination"

// پارامترهای فیلتر که از URL (searchParams) خونده می‌شن و به سرور اکشن پاس داده می‌شن
export type ProviderFilterParams = {
  search?: string
  type?: ProviderType
  province?: string
  city?: string
  category?: string
  online?: string // 'true' | undefined — چون از URLSearchParams همیشه string میاد
  page?: string
}

// مقداری که ProviderFilters به‌عنوان state داخلی نگه می‌داره
export type ProviderFilterState = {
  search: string
  type: ProviderType | ""
  province: string
  city: string
  category: string
  online: boolean
}
