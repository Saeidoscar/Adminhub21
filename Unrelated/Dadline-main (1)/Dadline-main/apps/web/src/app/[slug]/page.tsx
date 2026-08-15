import { permanentRedirect } from "next/navigation"

type LegacyArticlePageProps = {
  params: Promise<{
    slug: string
  }>
}

const LegacyArticlePage = async ({ params }: LegacyArticlePageProps) => {
  const { slug } = await params
  permanentRedirect(`/blog/${slug}`)
}

export default LegacyArticlePage
