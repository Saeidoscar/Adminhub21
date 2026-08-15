import ContentRoutePage, {
  type ContentSearchParams,
} from "../_shared/content/ContentRoutePage"

export const metadata = {
  title: "مجله حقوقی دادلاین",
  description: "مقاله‌ها و راهنماهای حقوقی کاربردی دادلاین",
}

export default function BlogPage({
  searchParams,
}: {
  searchParams: ContentSearchParams
}) {
  return <ContentRoutePage kind="blog" searchParams={searchParams} />
}
