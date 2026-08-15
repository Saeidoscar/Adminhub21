export const PRODUCT_TYPES = [
  "petition",
  "statement",
  "bill",
  "complaint",
  "contract",
  "letter",
] as const

export type ProductType = typeof PRODUCT_TYPES[number]

export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  petition: "دادخواست",
  statement: "اظهارنامه",
  bill: "لایحه",
  complaint: "شکواییه",
  contract: "قرارداد",
  letter: "عریضه",
}

export const SORT_OPTIONS = [
  { slug: "best-selling", label: "پرفروش‌ترین" },
  { slug: "price-desc", label: "بیشترین قیمت" },
  { slug: "price-asc", label: "کمترین قیمت" },
] as const

export type ProductSort = typeof SORT_OPTIONS[number]["slug"]

export type ProductVendorType = "lawyer" | "expert" | "judge"

export type ProductListItem = {
  slug: string
  title: string
  type: ProductType
  description: string | null
  price: number
  salesCount: number
  viewsCount: number
  publishedAt: string | null
  updatedAt: string | null
  vendor: {
    name: string
    role: string
    slug: string | null
    type: ProductVendorType | null
    avatarUrl: string | null
  } | null
  category: {
    name: string
    slug: string
  } | null
}

export type ProductFilters = {
  total: number
  types: Array<{ type: ProductType count: number }>
  categories: Array<{ name: string slug: string count: number }>
}

export type ProductPagination = {
  currentPage: number
  lastPage: number
  perPage: number
  total: number
}

export type ProductListParams = {
  type?: string
  category?: string
  vendor?: string
  search?: string
  sort?: string
  page?: number
  perPage?: number
}

export const productTypeLabel = (type: ProductType): string =>
  PRODUCT_TYPE_LABELS[type]
