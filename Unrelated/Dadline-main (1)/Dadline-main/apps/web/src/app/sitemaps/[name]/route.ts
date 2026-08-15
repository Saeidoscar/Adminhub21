import type { MetadataRoute } from "next"
import type { ContentItem, ContentKind, ContentTag } from "@/@types/content"
import type { Provider } from "@/@types/vendors"
import type { ProductListItem } from "@/server/actions/products/products.types"
import type { Question } from "@/@types/questions"

export const revalidate = 3600

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://dadline.net"
).replace(/\/$/, "")

const CONTENT_PAGE_SIZE = 100
const PROVIDER_PAGE_SIZE = 24
const PRODUCT_PAGE_SIZE = 48
const QUESTION_PAGE_SIZE = 24

type Sitemap = MetadataRoute.Sitemap
type SitemapName = keyof typeof sitemapBuilders

const sitemapBuilders = {
  pages: buildPagesSitemap,
  posts: () => buildContentSitemap("blog"),
  stories: () => buildContentSitemap("story"),
  taxonomies: buildTaxonomiesSitemap,
  lawyers: buildLawyersSitemap,
  experts: buildExpertsSitemap,
  products: buildProductsSitemap,
  questions: buildQuestionsSitemap,
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const requestedName = (await params).name

  if (!requestedName.endsWith(".xml")) {
    return new Response("Not Found", { status: 404 })
  }

  const name = requestedName.slice(0, -4)

  if (!isSitemapName(name)) {
    return new Response("Not Found", { status: 404 })
  }

  const entries = uniqueEntries(await sitemapBuilders[name]())

  return new Response(toSitemapXml(entries), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  })
}

async function buildPagesSitemap(): Promise<Sitemap> {
  return [
    entry("/", "daily", 1),
    entry("/ai", "weekly", 0.8),
    entry("/contracts", "weekly", 0.8),
    entry("/calls", "daily", 0.8),
    entry("/my-lawyer", "daily", 0.8),
    entry("/start", "monthly", 0.8),
    entry("/law-office-management-ai-cloud", "monthly", 0.7),
    entry("/judicial-services", "weekly", 0.9),
    entry("/pricing", "weekly", 0.7),
    entry("/about", "monthly", 0.5),
    entry("/contact", "monthly", 0.5),
    entry("/changelog", "weekly", 0.5),
    entry("/terms", "yearly", 0.3),
  ]
}

async function buildContentSitemap(kind: ContentKind): Promise<Sitemap> {
  const items = await getAllContent(kind)
  const archiveLastModified = latestDate(items)

  return [
    {
      ...entry(`/${kind}`, "daily", 0.9),
      ...(archiveLastModified ? { lastModified: archiveLastModified } : {}),
    },
    ...items.map((item) => {
      const lastModified = contentDate(item)

      return {
        ...entry(`/${kind}/${encodeURIComponent(item.slug)}`, "weekly", 0.8),
        ...(lastModified ? { lastModified } : {}),
      }
    }),
  ]
}

async function buildTaxonomiesSitemap(): Promise<Sitemap> {
  const tagsPromise = import("@/server/actions/content/getContent").then(
    ({ getContentTags }) => getContentTags(),
  )
  const [blogs, stories, tagsResult] = await Promise.all([
    getAllContent("blog"),
    getAllContent("story"),
    tagsPromise,
  ])

  return [
    ...contentTaxonomyEntries("blog", blogs, tagsResult.tags),
    ...contentTaxonomyEntries("story", stories, tagsResult.tags),
  ]
}

async function buildLawyersSitemap(): Promise<Sitemap> {
  const lawyers = await getAllLawyers()
  const citySlugs = new Set<string>()
  const specialtySlugs = new Set<string>()

  for (const lawyer of lawyers) {
    if (lawyer.city?.slug) citySlugs.add(lawyer.city.slug)
    for (const specialty of lawyer.expertise) {
      if (specialty.slug) specialtySlugs.add(specialty.slug)
    }
  }

  return [
    entry("/lawyer", "daily", 0.9),
    ...lawyers.map((lawyer) =>
      entry(`/lawyer/${encodeURIComponent(lawyer.slug)}`, "weekly", 0.8),
    ),
    ...Array.from(citySlugs, (slug) =>
      entry(`/lawyer/city/${encodeURIComponent(slug)}`, "weekly", 0.7),
    ),
    ...Array.from(specialtySlugs, (slug) =>
      entry(`/lawyer/specialty/${encodeURIComponent(slug)}`, "weekly", 0.7),
    ),
  ]
}

async function buildExpertsSitemap(): Promise<Sitemap> {
  const experts = await getAllExperts()
  const citySlugs = new Set<string>()
  const specialtySlugs = new Set<string>()

  for (const expert of experts) {
    if (expert.city?.slug) citySlugs.add(expert.city.slug)
    for (const specialty of expert.expertise) {
      if (specialty.slug) specialtySlugs.add(specialty.slug)
    }
  }

  return [
    entry("/expert", "daily", 0.9),
    ...experts.map((expert) =>
      entry(`/expert/${encodeURIComponent(expert.slug)}`, "weekly", 0.8),
    ),
    ...Array.from(citySlugs, (slug) =>
      entry(`/expert/city/${encodeURIComponent(slug)}`, "weekly", 0.7),
    ),
    ...Array.from(specialtySlugs, (slug) =>
      entry(`/expert/specialty/${encodeURIComponent(slug)}`, "weekly", 0.7),
    ),
  ]
}

async function buildProductsSitemap(): Promise<Sitemap> {
  const [{ DOCUMENT_TYPES_LIST }, products] = await Promise.all([
    import("../../(public-pages)/legal-documents/_data/legal-documents"),
    getAllProducts(),
  ])

  return [
    entry("/document", "daily", 0.9),
    entry("/legal-documents", "weekly", 0.8),
    ...DOCUMENT_TYPES_LIST.map(({ slug }) =>
      entry(`/legal-documents/${encodeURIComponent(slug)}`, "monthly", 0.7),
    ),
    ...products.map((product) => {
      const item = entry(
        `/document/${encodeURIComponent(product.slug)}`,
        "weekly",
        0.8,
      )

      return product.updatedAt
        ? { ...item, lastModified: product.updatedAt }
        : item
    }),
  ]
}

async function buildQuestionsSitemap(): Promise<Sitemap> {
  const questions = await getAllQuestions()

  return [
    entry("/questions", "daily", 0.9),
    ...questions.map((question) =>
      entry(`/questions/${encodeURIComponent(question.slug)}`, "weekly", 0.7),
    ),
  ]
}

async function getAllQuestions(): Promise<Question[]> {
  const { getQuestions } = await import(
    "@/server/actions/questions/getQuestions"
  )
  const firstPage = await getQuestions({
    page: 1,
    per_page: QUESTION_PAGE_SIZE,
  })
  const questions = [...firstPage.questions]

  for (let page = 2; page <= firstPage.pagination.last_page; page += 1) {
    const result = await getQuestions({
      page,
      per_page: QUESTION_PAGE_SIZE,
    })
    questions.push(...result.questions)
  }

  return questions
}

async function getAllContent(kind: ContentKind): Promise<ContentItem[]> {
  const { getContentList } = await import("@/server/actions/content/getContent")
  const firstPage = await getContentList(kind, {
    page: 1,
    perPage: CONTENT_PAGE_SIZE,
    sort: "recent",
  })
  const items = [...firstPage.items]

  for (let page = 2; page <= firstPage.pagination.lastPage; page += 1) {
    const result = await getContentList(kind, {
      page,
      perPage: CONTENT_PAGE_SIZE,
      sort: "recent",
    })
    items.push(...result.items)
  }

  return items
}

async function getAllLawyers(): Promise<Provider[]> {
  const { getLawyers } = await import("@/server/actions/provider/getProviders")
  const firstPage = await getLawyers({
    page: 1,
    per_page: PROVIDER_PAGE_SIZE,
  })
  const lawyers = [...firstPage.lawyers]

  for (let page = 2; page <= firstPage.pagination.last_page; page += 1) {
    const result = await getLawyers({ page, per_page: PROVIDER_PAGE_SIZE })
    lawyers.push(...result.lawyers)
  }

  return lawyers
}

async function getAllExperts(): Promise<Provider[]> {
  const { getExperts } = await import("@/server/actions/provider/getProviders")
  const firstPage = await getExperts({
    page: 1,
    per_page: PROVIDER_PAGE_SIZE,
  })
  const experts = [...firstPage.experts]

  for (let page = 2; page <= firstPage.pagination.last_page; page += 1) {
    const result = await getExperts({ page, per_page: PROVIDER_PAGE_SIZE })
    experts.push(...result.experts)
  }

  return experts
}

async function getAllProducts(): Promise<ProductListItem[]> {
  const { getProducts } = await import("@/server/actions/products/getProducts")
  const firstPage = await getProducts({
    page: 1,
    perPage: PRODUCT_PAGE_SIZE,
  })
  const products = [...firstPage.products]

  for (let page = 2; page <= firstPage.pagination.lastPage; page += 1) {
    const result = await getProducts({
      page,
      perPage: PRODUCT_PAGE_SIZE,
    })
    products.push(...result.products)
  }

  return products
}

function contentTaxonomyEntries(
  kind: ContentKind,
  items: ContentItem[],
  tags: ContentTag[],
): Sitemap {
  const categories = new Map<string, ContentItem[]>()

  for (const item of items) {
    if (!item.category) continue
    const categoryItems = categories.get(item.category.slug) ?? []
    categoryItems.push(item)
    categories.set(item.category.slug, categoryItems)
  }

  const countKey = kind === "story" ? "storiesCount" : "blogsCount"

  return [
    ...Array.from(categories, ([slug, categoryItems]) => {
      const lastModified = latestDate(categoryItems)

      return {
        ...entry(
          `/${kind}/category/${encodeURIComponent(slug)}`,
          "weekly",
          0.7,
        ),
        ...(lastModified ? { lastModified } : {}),
      }
    }),
    ...tags
      .filter((tag) => (tag[countKey] ?? 0) > 0)
      .map((tag) => {
        const taggedItems = items.filter((item) =>
          item.tags.some((itemTag) => itemTag.slug === tag.slug),
        )
        const lastModified = latestDate(taggedItems)

        return {
          ...entry(
            `/${kind}/tag/${encodeURIComponent(tag.slug)}`,
            "weekly",
            0.7,
          ),
          ...(lastModified ? { lastModified } : {}),
        }
      }),
  ]
}

function entry(
  path: string,
  changeFrequency: NonNullable<Sitemap[number]["changeFrequency"]>,
  priority: number,
): Sitemap[number] {
  return { url: `${SITE_URL}${path}`, changeFrequency, priority }
}

function latestDate(items: ContentItem[]): Date | null {
  const timestamps = items
    .map(contentDate)
    .filter((date): date is Date => date !== null)
    .map((date) => date.getTime())

  return timestamps.length > 0 ? new Date(Math.max(...timestamps)) : null
}

function contentDate(item: ContentItem): Date | null {
  const value = item.updatedAt ?? item.publishedAt
  if (!value) return null

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function uniqueEntries(entries: Sitemap): Sitemap {
  return Array.from(new Map(entries.map((item) => [item.url, item])).values())
}

function isSitemapName(name: string): name is SitemapName {
  return Object.hasOwn(sitemapBuilders, name)
}

function toSitemapXml(entries: Sitemap): string {
  const urls = entries
    .map((item) => {
      const lastModified = item.lastModified
        ? `<lastmod>${escapeXml(toIsoDate(item.lastModified))}</lastmod>`
        : ""
      const changeFrequency = item.changeFrequency
        ? `<changefreq>${item.changeFrequency}</changefreq>`
        : ""
      const priority =
        item.priority !== undefined
          ? `<priority>${item.priority}</priority>`
          : ""

      return `<url><loc>${escapeXml(item.url)}</loc>${lastModified}${changeFrequency}${priority}</url>`
    })
    .join("")

  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`
}

function toIsoDate(value: string | Date): string {
  return value instanceof Date ? value.toISOString() : value
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;")
}
