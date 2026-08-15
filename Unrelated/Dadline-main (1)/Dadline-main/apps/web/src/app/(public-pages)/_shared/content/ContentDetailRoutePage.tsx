import type { ContentKind } from "@/@types/content"
import {
  getContentComments,
  getContentItem,
  getContentList,
  getContentReaction,
  getContentStats,
  getContentTags,
} from "@/server/actions/content/getContent"
import { notFound } from "next/navigation"
import ContentDetailPage from "./ContentDetailPage"
import { contentPageConfigs } from "./content.config"

export default async function ContentDetailRoutePage({
  kind,
  slug,
}: {
  kind: ContentKind
  slug: string
}) {
  const itemResult = await getContentItem(kind, slug)
  if (itemResult.notFound) notFound()
  if (!itemResult.item)
    throw new Error(itemResult.error ?? "Content could not be loaded.")

  const item = itemResult.item
  const [commentResult, reaction, statResult, tagResult, relatedResult] =
    await Promise.all([
      getContentComments(kind, slug),
      getContentReaction(kind, slug),
      getContentStats(kind),
      getContentTags(kind),
      getContentList(kind, {
        category: item.category?.slug,
        sort: "recent",
        perPage: 5,
      }),
    ])
  const related = relatedResult.items
    .filter((relatedItem) => relatedItem.slug !== slug)
    .slice(0, 4)

  return (
    <ContentDetailPage
      config={contentPageConfigs[kind]}
      item={item}
      comments={commentResult.comments}
      reaction={reaction}
      stats={statResult.stats}
      tags={tagResult.tags}
      related={related}
    />
  )
}
