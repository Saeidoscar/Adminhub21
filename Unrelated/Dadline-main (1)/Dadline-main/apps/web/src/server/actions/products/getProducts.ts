"use server"

import { apiGet } from "@/lib/apiClient"
import {
  productItemResponseSchema,
  productListResponseSchema,
} from "./products.schemas"
import {
  PRODUCT_TYPES,
  type ProductFilters,
  type ProductListItem,
  type ProductListParams,
  type ProductPagination,
} from "./products.types"

const emptyPagination: ProductPagination = {
  currentPage: 1,
  lastPage: 1,
  perPage: 24,
  total: 0,
}

const emptyFilters: ProductFilters = {
  total: 0,
  types: PRODUCT_TYPES.map((type) => ({ type, count: 0 })),
  categories: [],
}

export async function getProducts(params: ProductListParams) {
  const query = new URLSearchParams({
    per_page: String(params.perPage ?? 24),
  })

  if (params.type) query.set("type", params.type)
  if (params.category) query.set("category", params.category)
  if (params.vendor) query.set("vendor", params.vendor)
  if (params.search) query.set("search", params.search)
  if (params.sort) query.set("sort", params.sort)
  if (params.page && params.page > 1) query.set("page", String(params.page))

  const response = await apiGet<unknown>(
    `/public/products?${query.toString()}`,
    undefined,
    {
      revalidate: 300,
      tags: ["products:list"],
    },
  )

  if (!response.ok || !response.data) {
    return {
      products: [] as ProductListItem[],
      pagination: emptyPagination,
      filters: emptyFilters,
      error: response.error,
    }
  }

  const parsed = productListResponseSchema.safeParse(response.data)

  if (!parsed.success) {
    return {
      products: [] as ProductListItem[],
      pagination: emptyPagination,
      filters: emptyFilters,
      error: "پاسخ دریافتی از سرور معتبر نیست.",
    }
  }

  return {
    products: parsed.data.data as ProductListItem[],
    pagination: {
      currentPage: parsed.data.meta.current_page,
      lastPage: parsed.data.meta.last_page,
      perPage: parsed.data.meta.per_page,
      total: parsed.data.meta.total,
    } satisfies ProductPagination,
    filters: parsed.data.filters as ProductFilters,
    error: null,
  }
}

export async function getProductBySlug(slug: string) {
  const normalizedSlug = normalizeSlug(slug)
  const response = await apiGet<unknown>(
    `/public/products/${encodeURIComponent(normalizedSlug)}`,
    undefined,
    {
      revalidate: 300,
      tags: [`products:${normalizedSlug}`],
    },
  )

  if (response.status === 404) {
    return { product: null, notFound: true, error: null }
  }

  if (!response.ok || !response.data) {
    return {
      product: null,
      notFound: false,
      error: response.error,
    }
  }

  const parsed = productItemResponseSchema.safeParse(response.data)

  if (!parsed.success) {
    return {
      product: null,
      notFound: false,
      error: "پاسخ دریافتی از سرور معتبر نیست.",
    }
  }

  return {
    product: parsed.data.data as ProductListItem,
    notFound: false,
    error: null,
  }
}

function normalizeSlug(slug: string): string {
  try {
    return decodeURIComponent(slug)
  } catch {
    return slug
  }
}
