import Link from "next/link"
import type { ComponentType } from "react"
import { TbArrowLeft, TbBook2, TbFileText, TbMessage2 } from "react-icons/tb"
import type {
  ProviderContentResource,
  ProviderDocumentResource,
} from "@/@types/vendors"
import { ProfileSectionHeading } from "./ProviderProfilePrimitives"
import { formatToman } from "./provider-profile.utils"

type ResourceSectionConfig<TItem,> = {
  eyebrow: string
  title: string
  description: string
  moreHref: string
  moreLabel: string
  items: TItem[]
  icon: ComponentType<{ size?: number className?: string }>
  renderItem: (item: TItem) => ResourceItem
}

type ResourceItem = {
  key: string
  title: string
  href: string
  description: string | null
  meta: string | null
  price?: number | null
}

const formatDate = (date: string | null): string | null =>
  date
    ? new Intl.DateTimeFormat("fa-IR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(new Date(date))
    : null

const documentTypeLabels: Record<string, string> = {
  petition: "دادخواست",
  statement: "اظهارنامه",
  bill: "لایحه",
  complaint: "شکواییه",
  contract: "قرارداد",
  letter: "عریضه",
}

const ProviderResourceSection = <TItem,>({
  eyebrow,
  title,
  description,
  moreHref,
  moreLabel,
  items,
  icon: Icon,
  renderItem,
}: ResourceSectionConfig<TItem>) => {
  if (items.length === 0) return null

  return (
    <section className="bg-white py-6 dark:bg-gray-950 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <ProfileSectionHeading
            eyebrow={eyebrow}
            title={title}
            description={description}
          />

          <Link
            href={moreHref}
            className="inline-flex min-h-11 w-fit items-center gap-2 rounded-xl border border-gray-200 px-4 text-sm font-bold text-gray-700 transition hover:border-primary hover:text-primary dark:border-gray-800 dark:text-gray-200"
          >
            {moreLabel}
            <TbArrowLeft size={18} />
          </Link>
        </div>

        <div className="mt-7 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {items.slice(0, 4).map((item) => {
            const resource = renderItem(item)

            return (
              <Link
                key={resource.key}
                href={resource.href}
                className="group flex min-h-44 flex-col rounded-2xl border border-gray-200 bg-gray-50/70 p-4 transition hover:-translate-y-0.5 hover:border-primary/40 hover:bg-white hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-primary/50"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon size={20} />
                  </span>

                  {resource.meta && (
                    <span className="truncate text-[11px] font-semibold text-gray-400">
                      {resource.meta}
                    </span>
                  )}
                </div>

                <h3 className="mt-4 line-clamp-2 text-sm font-black leading-6 text-gray-950 transition group-hover:text-primary dark:text-white">
                  {resource.title}
                </h3>

                {resource.description && (
                  <p className="mt-2 line-clamp-2 text-xs leading-6 text-gray-500 dark:text-gray-400">
                    {resource.description}
                  </p>
                )}

                <div className="mt-auto flex items-end justify-between gap-3 pt-4">
                  {typeof resource.price === "number" ? (
                    <strong className="text-sm text-primary">
                      {formatToman(resource.price)}
                    </strong>
                  ) : (
                    <span className="text-xs font-semibold text-gray-400">
                      مطالعه
                    </span>
                  )}

                  <TbArrowLeft className="text-gray-400 transition group-hover:-translate-x-1 group-hover:text-primary" />
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export const ProviderResourcesSection = ({
  providerName,
  providerSlug,
  blogs,
  stories,
  documents,
}: {
  providerName: string
  providerSlug: string
  blogs: ProviderContentResource[]
  stories: ProviderContentResource[]
  documents: ProviderDocumentResource[]
}) => {
  if (!blogs.length && !stories.length && !documents.length) return null

  return (
    <>
      <ProviderResourceSection
        eyebrow="STORY"
        title="تجربه‌های حقوقی"
        description={`تجربه‌ها و روایت‌های منتشرشده توسط ${providerName}`}
        moreHref={`/story?author=${encodeURIComponent(providerName)}`}
        moreLabel="مشاهده تجربه‌های بیشتر"
        items={stories}
        icon={TbMessage2}
        renderItem={(item) => ({
          key: item.slug,
          title: item.title,
          href: `/story/${encodeURIComponent(item.slug)}`,
          description: item.excerpt ?? item.content,
          meta: item.category?.name ?? formatDate(item.publishedAt),
        })}
      />

      <ProviderResourceSection
        eyebrow="DOCUMENT"
        title="مستندات حقوقی"
        description={`آخرین مستندات و محصولات حقوقی ${providerName}`}
        moreHref={`/document?vendor=${encodeURIComponent(providerSlug)}`}
        moreLabel="مشاهده مستندات بیشتر"
        items={documents}
        icon={TbFileText}
        renderItem={(item) => ({
          key: item.slug,
          title: item.title,
          href: `/document/${encodeURIComponent(item.slug)}`,
          description: item.description,
          meta: documentTypeLabels[item.type] ?? item.category?.name ?? null,
          price: item.price,
        })}
      />

      <ProviderResourceSection
        eyebrow="BLOG"
        title="مقاله‌های حقوقی"
        description={`آخرین مقاله‌های منتشرشده توسط ${providerName}`}
        moreHref={`/blog?author=${encodeURIComponent(providerName)}`}
        moreLabel="مشاهده مقاله‌های بیشتر"
        items={blogs}
        icon={TbBook2}
        renderItem={(item) => ({
          key: item.slug,
          title: item.title,
          href: `/blog/${encodeURIComponent(item.slug)}`,
          description: item.excerpt ?? item.content,
          meta: item.category?.name ?? formatDate(item.publishedAt),
        })}
      />
    </>
  )
}
