import type { ContentKind } from "@/@types/content"
import { getContentTags } from "@/server/actions/content/getContent"
import { getLegalCategories } from "@/server/actions/legal/getLegalCategories"
import type { Metadata } from "next"
import ContentRoutePage, { type ContentSearchParams } from "./ContentRoutePage"
import { contentPageConfigs } from "./content.config"
import { flattenCategories, normalizeRouteSegment } from "./content.utils"

type Taxonomy = "tag" | "category"

type Props = {
  kind: ContentKind
  taxonomy: Taxonomy
  params: Promise<{ slug: string }>
  searchParams: ContentSearchParams
}

export default async function ContentTaxonomyRoutePage({
  kind,
  taxonomy,
  params,
  searchParams,
}: Props) {
  const { slug } = await params
  const value = normalizeRouteSegment(slug)
  const config = contentPageConfigs[kind]
  const name = await resolveTaxonomyName(taxonomy, value)
  const presentation = buildTaxonomyPresentation(kind, taxonomy, name)
  const fixedFilters = taxonomy === "tag" ? { tag: value } : { category: value }
  const listingPath = `${config.basePath}/${taxonomy}/${encodeURIComponent(value)}`

  return (
    <ContentRoutePage
      kind={kind}
      searchParams={searchParams}
      fixedFilters={fixedFilters}
      fixedTaxonomy={taxonomy}
      listingPath={listingPath}
      heading={presentation}
    />
  )
}

export async function generateTaxonomyMetadata(
  kind: ContentKind,
  taxonomy: Taxonomy,
  params: Promise<{ slug: string }>,
): Promise<Metadata> {
  const { slug } = await params
  const normalizedSlug = normalizeRouteSegment(slug)
  const value = await resolveTaxonomyName(taxonomy, normalizedSlug)
  const presentation = buildTaxonomyPresentation(kind, taxonomy, value)
  const title = `${presentation.title} | دادلاین`

  return {
    title,
    description: presentation.description,
    keywords: [
      value,
      taxonomy === "tag" ? "برچسب حقوقی" : "حوزه حقوقی",
      kind === "story" ? "تجربه حقوقی" : "مجله حقوقی دادلاین",
    ],
    openGraph: {
      type: "website",
      title,
      description: presentation.description,
    },
    twitter: {
      card: "summary",
      title,
      description: presentation.description,
    },
  }
}

function buildTaxonomyPresentation(
  kind: ContentKind,
  taxonomy: Taxonomy,
  name: string,
) {
  const isStory = kind === "story"
  const isTag = taxonomy === "tag"
  const contentTitle = isStory ? "تجربه‌های حقوقی" : "مطالب مجله حقوقی"
  const taxonomyTitle = isTag ? "" : ""
  const relation = isTag ? "با" : "در"

  return {
    badge: `${taxonomyTitle} ${name}`,
    title: `${contentTitle} ${name}`,
    description: isStory
      ? `تجربه‌ها و روایت‌های حقوقی وکلا و کاربران مرتبط با ${taxonomyTitle} «${name}» را بخوانید.`
      : `مقاله‌ها و راهنماهای حقوقی دادلاین مرتبط با ${taxonomyTitle} «${name}» را بخوانید.`,
  }
}

async function resolveTaxonomyName(taxonomy: Taxonomy, slug: string) {
  if (taxonomy === "tag") {
    const { tags } = await getContentTags()
    return (
      tags.find((tag) => tag.slug === slug)?.name ?? slug.replaceAll("-", " ")
    )
  }

  const { categories } = await getLegalCategories()
  return (
    flattenCategories(categories).find((category) => category.slug === slug)
      ?.name ?? slug.replaceAll("-", " ")
  )
}
