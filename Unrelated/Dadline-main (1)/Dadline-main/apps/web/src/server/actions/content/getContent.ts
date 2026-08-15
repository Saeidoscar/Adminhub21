"use server"

import type {
  ContentComment,
  ContentItem,
  ContentKind,
  ContentListParams,
  ContentPagination,
  ContentReactionState,
  ContentStats,
  ContentTag,
} from "@/@types/content"
import { apiGet } from "@/lib/apiClient"
import getServerSession from "@/server/actions/auth/getServerSession"
import {
  contentCommentsResponseSchema,
  contentItemResponseSchema,
  contentListResponseSchema,
  contentReactionResponseSchema,
  contentStatsResponseSchema,
  contentTagsResponseSchema,
} from "./content.schemas"

const resourcePath = (kind: ContentKind) =>
  kind === "story" ? "stories" : "blogs"

const parseError = "پاسخ دریافتی از سرور معتبر نیست."

export async function getContentList(
  kind: ContentKind,
  params: ContentListParams,
) {
  const query = new URLSearchParams()
  if (params.search) query.set("search", params.search)
  if (params.author) query.set("author", params.author)
  if (params.category) query.set("category", params.category)
  if (params.tag) query.set("tag", params.tag)
  if (params.sort) query.set("sort", params.sort)
  if (params.page && params.page > 1) query.set("page", String(params.page))
  query.set("per_page", String(params.perPage ?? 12))

  const response = await apiGet<unknown>(
    `/${resourcePath(kind)}?${query.toString()}`,
    undefined,
    {
      revalidate: 300,
      tags: [`content:${kind}:list`],
    },
  )

  if (!response.ok || !response.data) {
    return {
      items: [] as ContentItem[],
      pagination: emptyPagination(),
      error: response.error,
    }
  }

  const parsed = contentListResponseSchema.safeParse(response.data)
  if (!parsed.success) {
    return {
      items: [] as ContentItem[],
      pagination: emptyPagination(),
      error: parseError,
    }
  }

  return {
    items: parsed.data.data as ContentItem[],
    pagination: {
      currentPage: parsed.data.meta.current_page,
      lastPage: parsed.data.meta.last_page,
      perPage: parsed.data.meta.per_page,
      total: parsed.data.meta.total,
    } satisfies ContentPagination,
    error: null,
  }
}

export async function getContentItem(kind: ContentKind, slug: string) {
  const normalizedSlug = normalizeSlug(slug)
  const response = await apiGet<unknown>(
    `/${resourcePath(kind)}/${encodeURIComponent(normalizedSlug)}`,
    undefined,
    {
      revalidate: 300,
      tags: [`content:${kind}:${normalizedSlug}`],
    },
  )

  if (response.status === 404)
    return { item: null, notFound: true, error: null }
  if (!response.ok || !response.data)
    return { item: null, notFound: false, error: response.error }

  const parsed = contentItemResponseSchema.safeParse(response.data)
  if (!parsed.success) return { item: null, notFound: false, error: parseError }

  return {
    item: parsed.data.data as ContentItem,
    notFound: false,
    error: null,
  }
}

export async function getContentTags(
  kind?: ContentKind,
): Promise<{
  tags: ContentTag[]
  error: string | null
}> {
  const response = await apiGet<unknown>("/tags", undefined, {
    revalidate: 3600,
    tags: ["content:tags"],
  })
  if (!response.ok || !response.data) return { tags: [], error: response.error }

  const parsed = contentTagsResponseSchema.safeParse(response.data)
  if (!parsed.success) return { tags: [], error: parseError }

  const tags = parsed.data.data as ContentTag[]
  if (!kind) return { tags, error: null }

  const countKey = kind === "story" ? "storiesCount" : "blogsCount"
  const relevantTags = tags
    .filter((tag) => (tag[countKey] ?? 0) > 0)
    .sort((first, second) => {
      const countDifference = (second[countKey] ?? 0) - (first[countKey] ?? 0)

      return countDifference || first.name.localeCompare(second.name, "fa")
    })

  return { tags: relevantTags, error: null }
}

export async function getContentStats(
  kind: ContentKind,
): Promise<{ stats: ContentStats error: string | null }> {
  const response = await apiGet<unknown>(
    `/content/stats?type=${kind}`,
    undefined,
    {
      revalidate: 300,
      tags: [`content:${kind}:stats`],
    },
  )
  if (!response.ok || !response.data)
    return { stats: emptyStats(), error: response.error }

  const parsed = contentStatsResponseSchema.safeParse(response.data)
  return parsed.success
    ? { stats: parsed.data.data, error: null }
    : { stats: emptyStats(), error: parseError }
}

export async function getContentComments(kind: ContentKind, slug: string) {
  const normalizedSlug = normalizeSlug(slug)
  const response = await apiGet<unknown>(
    `/${resourcePath(kind)}/${encodeURIComponent(normalizedSlug)}/comments?per_page=50`,
    undefined,
    {
      revalidate: 60,
      tags: [`content:${kind}:${normalizedSlug}:comments`],
    },
  )
  if (!response.ok || !response.data)
    return { comments: [] as ContentComment[], error: response.error }

  const parsed = contentCommentsResponseSchema.safeParse(response.data)
  return parsed.success
    ? { comments: parsed.data.data as ContentComment[], error: null }
    : { comments: [] as ContentComment[], error: parseError }
}

export async function getContentReaction(
  kind: ContentKind,
  slug: string,
): Promise<ContentReactionState | null> {
  const normalizedSlug = normalizeSlug(slug)
  const session = await getServerSession()
  if (!session?.accessToken) return null

  const response = await apiGet<unknown>(
    `/${resourcePath(kind)}/${encodeURIComponent(normalizedSlug)}/reaction`,
    session.accessToken,
    { revalidate: false },
  )
  if (!response.ok || !response.data) return null

  const parsed = contentReactionResponseSchema.safeParse(response.data)
  return parsed.success ? parsed.data.data : null
}

function normalizeSlug(slug: string): string {
  try {
    return decodeURIComponent(slug)
  } catch {
    return slug
  }
}

function emptyPagination(): ContentPagination {
  return { currentPage: 1, lastPage: 1, perPage: 12, total: 0 }
}

function emptyStats(): ContentStats {
  return {
    contentsCount: 0,
    viewsCount: 0,
    likesCount: 0,
    dislikesCount: 0,
    commentsCount: 0,
    tagsCount: 0,
  }
}
