import type { ContentKind } from "@/@types/content"

export type ContentPageConfig = {
  kind: ContentKind
  basePath: "/story" | "/blog"
  title: string
  singularTitle: string
  description: string
  emptyTitle: string
}

export const contentPageConfigs: Record<ContentKind, ContentPageConfig> = {
  story: {
    kind: "story",
    basePath: "/story",
    title: "تجربه‌های حقوقی",
    singularTitle: "تجربه",
    description: "روایت‌های واقعی کاربران از مسیرهای حقوقی، دادگاه و حل اختلاف",
    emptyTitle: "تجربه‌ای با این مشخصات پیدا نشد",
  },
  blog: {
    kind: "blog",
    basePath: "/blog",
    title: "مجله حقوقی دادلاین",
    singularTitle: "مطلب",
    description: "مقاله‌ها و راهنماهای کاربردی برای تصمیم‌های حقوقی آگاهانه",
    emptyTitle: "مطلبی با این مشخصات پیدا نشد",
  },
}
