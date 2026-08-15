import type { ContentListParams, ContentKind } from "@/@types/content"
import {
  getContentList,
  getContentStats,
  getContentTags,
} from "@/server/actions/content/getContent"
import { getLegalCategories } from "@/server/actions/legal/getLegalCategories"
import ContentListingPage from "./ContentListingPage"
import { contentPageConfigs } from "./content.config"
import { normalizePage, normalizeSort } from "./content.utils"

export type ContentSearchParams = Promise<{
  search?: string
  author?: string
  category?: string
  tag?: string
  sort?: string
  page?: string
}>

export default async function ContentRoutePage({
  kind,
  searchParams,
  fixedFilters,
  listingPath,
  fixedTaxonomy,
  heading,
}: {
  kind: ContentKind
  searchParams: ContentSearchParams
  fixedFilters?: Pick<ContentListParams, "tag" | "category">
  listingPath?: string
  fixedTaxonomy?: "tag" | "category"
  heading?: {
    badge: string
    title: string
    description: string
  }
}) {
  const query = await searchParams
  const filters: ContentListParams = {
    search: query.search?.trim() || undefined,
    author: query.author?.trim() || undefined,
    category: fixedFilters?.category ?? (query.category?.trim() || undefined),
    tag: fixedFilters?.tag ?? (query.tag?.trim() || undefined),
    sort: normalizeSort(query.sort),
    page: normalizePage(query.page),
    perPage: 12,
  }

  const [content, tagResult, statResult, categoryResult] = await Promise.all([
    getContentList(kind, filters),
    getContentTags(kind),
    getContentStats(kind),
    getLegalCategories(),
  ])
  const error =
    content.error ?? tagResult.error ?? statResult.error ?? categoryResult.error

  return (
    <ContentListingPage
      config={contentPageConfigs[kind]}
      items={content.items}
      pagination={content.pagination}
      stats={statResult.stats}
      tags={tagResult.tags}
      categories={categoryResult.categories}
      filters={filters}
      error={error}
      listingPath={listingPath}
      fixedTaxonomy={fixedTaxonomy}
      heading={heading}
    />
  )
}
