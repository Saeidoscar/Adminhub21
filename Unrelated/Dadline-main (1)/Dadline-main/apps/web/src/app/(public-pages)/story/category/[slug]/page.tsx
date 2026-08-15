import ContentTaxonomyRoutePage, {
  generateTaxonomyMetadata,
} from "../../../_shared/content/ContentTaxonomyRoutePage"
import type { ContentSearchParams } from "../../../_shared/content/ContentRoutePage"

type Props = {
  params: Promise<{ slug: string }>
  searchParams: ContentSearchParams
}

export const generateMetadata = ({ params }: Props) =>
  generateTaxonomyMetadata("story", "category", params)

export default function StoryCategoryPage({ params, searchParams }: Props) {
  return (
    <ContentTaxonomyRoutePage
      kind="story"
      taxonomy="category"
      params={params}
      searchParams={searchParams}
    />
  )
}
