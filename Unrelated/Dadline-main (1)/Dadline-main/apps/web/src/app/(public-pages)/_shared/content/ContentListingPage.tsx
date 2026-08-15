import type {
  ContentItem,
  ContentListParams,
  ContentPagination,
  ContentStats,
  ContentTag,
} from "@/@types/content"
import type { LegalCategory } from "@/server/actions/legal/getLegalCategories"
import Link from "next/link"
import {
  TbBook2,
  TbCategory,
  TbEye,
  TbHash,
  TbHeart,
  TbMessageCircle,
  TbSearch,
  TbUser,
} from "react-icons/tb"
import Pagination from "../providers/Pagination"
import type { ContentPageConfig } from "./content.config"
import {
  flattenCategories,
  formatContentDate,
  formatNumber,
} from "./content.utils"

type Props = {
  config: ContentPageConfig
  items: ContentItem[]
  pagination: ContentPagination
  stats: ContentStats
  tags: ContentTag[]
  categories: LegalCategory[]
  filters: ContentListParams
  error: string | null
  listingPath?: string
  fixedTaxonomy?: "tag" | "category"
  heading?: {
    badge: string
    title: string
    description: string
  }
}

const statItems = (stats: ContentStats) => [
  { label: "نوشته‌ها", value: stats.contentsCount, icon: TbBook2 },
  { label: "بازدیدها", value: stats.viewsCount, icon: TbEye },
  { label: "پسندها", value: stats.likesCount, icon: TbHeart },
  { label: "دیدگاه‌ها", value: stats.commentsCount, icon: TbMessageCircle },
]

export default function ContentListingPage({
  config,
  items,
  pagination,
  stats,
  tags,
  categories,
  filters,
  error,
  listingPath,
  fixedTaxonomy,
  heading,
}: Props) {
  const flatCategories = flattenCategories(categories)
  const currentParams = {
    search: filters.search,
    author: filters.author,
    category: fixedTaxonomy === "category" ? undefined : filters.category,
    tag: fixedTaxonomy === "tag" ? undefined : filters.tag,
    sort: filters.sort === "recent" ? undefined : filters.sort,
  }

  return (
    <div className="bg-gray-50/70 pb-20 dark:bg-gray-950">
      <section className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <div className="max-w-3xl">
            <span className="mb-3 inline-flex rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              {heading?.badge ?? "دانش و تجربه حقوقی"}
            </span>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {heading?.title ?? config.title}
            </h1>
            <p className="mt-4 text-base leading-8 text-gray-600 dark:text-gray-300">
              {heading?.description ?? config.description}
            </p>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {statItems(stats).map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950/60"
              >
                <div className="flex items-center gap-3">
                  <span className="rounded-xl bg-white p-2.5 text-primary shadow-sm dark:bg-gray-900">
                    <Icon size={21} />
                  </span>
                  <div>
                    <div className="text-xl font-bold">
                      {formatNumber(value)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {label}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <form
          method="get"
          className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900"
        >
          {filters.tag && fixedTaxonomy !== "tag" && (
            <input type="hidden" name="tag" value={filters.tag} />
          )}
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
            <label className="relative lg:col-span-2">
              <span className="sr-only">جستجو در عنوان و متن</span>
              <TbSearch
                className="pointer-events-none absolute inset-s-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={19}
              />
              <input
                name="search"
                defaultValue={filters.search}
                placeholder="جستجو در عنوان و متن..."
                className="h-11 w-full rounded-xl border border-gray-200 bg-white pe-3 ps-10 text-sm outline-none transition focus:border-primary dark:border-gray-700 dark:bg-gray-950"
              />
            </label>
            <label className="relative">
              <span className="sr-only">نام نویسنده</span>
              <TbUser
                className="pointer-events-none absolute inset-s-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={19}
              />
              <input
                name="author"
                defaultValue={filters.author}
                placeholder="نام نویسنده"
                className="h-11 w-full rounded-xl border border-gray-200 bg-white pe-3 ps-10 text-sm outline-none transition focus:border-primary dark:border-gray-700 dark:bg-gray-950"
              />
            </label>
            <label className="relative">
              <span className="sr-only">دسته‌بندی</span>
              <TbCategory
                className="pointer-events-none absolute inset-s-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={19}
              />
              <select
                name="category"
                defaultValue={filters.category ?? ""}
                disabled={fixedTaxonomy === "category"}
                className="h-11 w-full appearance-none rounded-xl border border-gray-200 bg-white pe-3 ps-10 text-sm outline-none transition focus:border-primary dark:border-gray-700 dark:bg-gray-950"
              >
                <option value="">همه دسته‌بندی‌ها</option>
                {flatCategories.map((category) => (
                  <option key={category.id} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex gap-2">
              <select
                name="sort"
                defaultValue={filters.sort ?? "recent"}
                aria-label="مرتب‌سازی"
                className="h-11 min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none transition focus:border-primary dark:border-gray-700 dark:bg-gray-950"
              >
                <option value="recent">جدیدترین</option>
                <option value="views">پربازدیدترین</option>
                <option value="likes">محبوب‌ترین</option>
                <option value="comments">پربحث‌ترین</option>
              </select>
              <button
                type="submit"
                className="h-11 shrink-0 rounded-xl bg-primary px-4 text-sm font-medium text-white transition hover:opacity-90"
              >
                اعمال
              </button>
            </div>
          </div>
        </form>

        {tags.length > 0 && (
          <div className="mt-5 flex items-center gap-2 overflow-x-auto pb-2">
            <TbHash className="shrink-0 text-primary" size={20} />
            <Link
              href={config.basePath}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-xs transition ${
                !filters.tag
                  ? "border-primary bg-primary text-white"
                  : "border-gray-200 bg-white text-gray-600 hover:border-primary dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
              }`}
            >
              همه برچسب‌ها
            </Link>
            {tags.slice(0, 16).map((tag) => (
              <Link
                key={tag.slug}
                href={`${config.basePath}/tag/${encodeURIComponent(tag.slug)}`}
                className={`shrink-0 rounded-full border px-3 py-1.5 text-xs transition ${
                  filters.tag === tag.slug
                    ? "border-primary bg-primary text-white"
                    : "border-gray-200 bg-white text-gray-600 hover:border-primary dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                }`}
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300"
          >
            {error}
          </div>
        )}

        {items.length > 0 ? (
          <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <ContentCard key={item.slug} item={item} config={config} />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center dark:border-gray-700 dark:bg-gray-900">
            <TbSearch className="mx-auto text-gray-400" size={38} />
            <h2 className="mt-4 font-bold">{config.emptyTitle}</h2>
            <p className="mt-2 text-sm text-gray-500">
              فیلترها را تغییر دهید یا عبارت دیگری جستجو کنید.
            </p>
            <Link
              href={config.basePath}
              className="mt-5 inline-flex rounded-xl border border-primary px-4 py-2 text-sm text-primary"
            >
              پاک‌کردن فیلترها
            </Link>
          </div>
        )}

        <Pagination
          basePath={listingPath ?? config.basePath}
          currentParams={currentParams}
          meta={{
            current_page: pagination.currentPage,
            last_page: pagination.lastPage,
          }}
        />
      </div>
    </div>
  )
}

function ContentCard({
  item,
  config,
}: {
  item: ContentItem
  config: ContentPageConfig
}) {
  return (
    <article className="group flex min-h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
      {item.featuredImageUrl && (
        <div
          className="h-44 bg-gray-100 bg-cover bg-center dark:bg-gray-800"
          style={{
            backgroundImage: `url(${JSON.stringify(item.featuredImageUrl)})`,
          }}
        />
      )}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-3 text-xs text-gray-500">
          <span>{item.category?.name ?? "بدون دسته‌بندی"}</span>
          <time dateTime={item.publishedAt ?? undefined}>
            {formatContentDate(item.publishedAt ?? item.createdAt)}
          </time>
        </div>
        <h2 className="mt-3 text-lg font-bold leading-8 transition group-hover:text-primary">
          <Link href={`${config.basePath}/${item.slug}`}>{item.title}</Link>
        </h2>
        <p className="mt-2 line-clamp-3 text-sm leading-7 text-gray-600 dark:text-gray-300">
          {item.excerpt ?? "برای مطالعه کامل این نوشته وارد صفحه جزئیات شوید."}
        </p>
        <div className="mt-auto flex items-center justify-between gap-3 pt-5 text-xs text-gray-500">
          <span className="truncate">
            {item.author?.name ?? "تحریریه دادلاین"}
          </span>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <TbEye />
              {formatNumber(item.viewsCount)}
            </span>
            <span className="inline-flex items-center gap-1">
              <TbHeart />
              {formatNumber(item.likesCount)}
            </span>
            <span className="inline-flex items-center gap-1">
              <TbMessageCircle />
              {formatNumber(item.commentsCount)}
            </span>
          </div>
        </div>
      </div>
    </article>
  )
}
