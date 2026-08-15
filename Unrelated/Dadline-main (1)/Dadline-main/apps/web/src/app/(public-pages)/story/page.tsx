import ContentRoutePage, {
  type ContentSearchParams,
} from "../_shared/content/ContentRoutePage"

export const metadata = {
  title: "تجربه‌های حقوقی دادلاین",
  description: "روایت تجربه‌های واقعی کاربران در موضوعات حقوقی",
}

export default function StoryPage({
  searchParams,
}: {
  searchParams: ContentSearchParams
}) {
  return <ContentRoutePage kind="story" searchParams={searchParams} />
}
