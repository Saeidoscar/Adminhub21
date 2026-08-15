import { getContentItem } from "@/server/actions/content/getContent"
import type { Metadata } from "next"
import ContentDetailRoutePage from "../../_shared/content/ContentDetailRoutePage"

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const { item } = await getContentItem("story", slug)
  return item
    ? { title: item.title, description: item.excerpt }
    : { title: "تجربه پیدا نشد" }
}

export default async function StoryDetailPage({ params }: Props) {
  const { slug } = await params
  return <ContentDetailRoutePage kind="story" slug={slug} />
}
