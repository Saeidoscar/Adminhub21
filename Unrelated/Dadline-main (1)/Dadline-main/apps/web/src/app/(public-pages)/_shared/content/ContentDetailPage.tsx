import type {
  ContentComment,
  ContentItem,
  ContentReactionState,
  ContentStats,
  ContentTag,
} from "@/@types/content"
import parse from "html-react-parser"
import Link from "next/link"
import ShareButton from "@/components/shared/ShareButton"
import {
  TbArrowRight,
  TbBook2,
  TbCalendar,
  TbEye,
  TbHash,
  TbHeart,
  TbMessageCircle,
  TbSearch,
  TbThumbDown,
  TbUser,
} from "react-icons/tb"
import sanitizeHtml from "sanitize-html"
import PublicViewTracker from "../PublicViewTracker"
import type { ContentPageConfig } from "./content.config"
import ContentInteractions from "./ContentInteractions"
import { formatContentDate, formatNumber } from "./content.utils"

type Props = {
  config: ContentPageConfig
  item: ContentItem
  comments: ContentComment[]
  reaction: ContentReactionState | null
  stats: ContentStats
  tags: ContentTag[]
  related: ContentItem[]
}

export default function ContentDetailPage({
  config,
  item,
  comments,
  reaction,
  stats,
  tags,
  related,
}: Props) {
  const sanitizedContent = item.content
    ? sanitizeHtml(item.content, {
        allowedTags: [
          ...sanitizeHtml.defaults.allowedTags,
          "figure",
          "figcaption",
          "img",
          "iframe",
        ],
        allowedAttributes: {
          "*": ["class", "id", "dir", "lang", "title"],
          a: ["href", "name", "target", "rel"],
          img: [
            "src",
            "srcset",
            "sizes",
            "alt",
            "title",
            "width",
            "height",
            "loading",
          ],
          iframe: [
            "src",
            "width",
            "height",
            "frameborder",
            "allow",
            "allowfullscreen",
            "loading",
          ],
          td: ["colspan", "rowspan"],
          th: ["colspan", "rowspan", "scope"],
        },
        allowedSchemes: ["http", "https", "mailto", "tel"],
        allowedIframeHostnames: [
          "www.youtube.com",
          "www.youtube-nocookie.com",
          "www.aparat.com",
          "player.vimeo.com",
        ],
        transformTags: {
          a: sanitizeHtml.simpleTransform("a", {
            rel: "nofollow noopener noreferrer",
          }),
          img: sanitizeHtml.simpleTransform("img", {
            loading: "lazy",
          }),
        },
      }).trim()
    : ""
  const initialReaction = reaction ?? {
    reaction: null,
    likesCount: item.likesCount,
    dislikesCount: item.dislikesCount,
  }

  return (
    <div className="bg-gray-50/70 pb-20 dark:bg-gray-950">
      <PublicViewTracker
        resource={config.kind === "story" ? "stories" : "blogs"}
        slug={item.slug}
      />
      <header>
        <div className="mx-auto max-w-7xl px-4 py-9 sm:px-6 lg:px-8">
          <div className="mt-12 max-w-7xl text-center">
            {item.category && (
              <Link
                href={`${config.basePath}/category/${encodeURIComponent(item.category.slug)}`}
                className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
              >
                {item.category.name}
              </Link>
            )}
            <h1 className="mt-4 text-2xl font-bold text-primary leading-relaxed sm:text-4xl sm:leading-relaxed">
              {item.title}
            </h1>
            {/* {item.excerpt && (
                            <p className="mt-4 text-base leading-8 text-gray-600 dark:text-gray-300">
                                {item.excerpt}
                            </p>
                        )} */}
            <div className="mt-6 flex flex-wrap gap-3 text-xs text-gray-500 justify-center">
              <span className="inline-flex items-center gap-1.5">
                <TbUser />
                {item.author?.name ?? "تحریریه دادلاین"}
              </span>
              <time
                className="inline-flex items-center gap-1.5"
                dateTime={item.publishedAt ?? undefined}
              >
                <TbCalendar />
                {formatContentDate(item.publishedAt ?? item.createdAt)}
              </time>
              <span className="inline-flex items-center gap-1.5">
                <TbEye />
                {formatNumber(item.viewsCount)} بازدید
              </span>
              <span className="inline-flex items-center gap-1.5">
                <TbHeart />
                {formatNumber(item.likesCount)} پسند
              </span>
              <span className="inline-flex items-center gap-1.5">
                <TbMessageCircle />
                {formatNumber(item.commentsCount)} دیدگاه
              </span>
            </div>
            <div className="mt-5 flex justify-center">
              <ShareButton
                title={item.title}
                text={item.excerpt ?? item.title}
              />
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-7 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-8">
        <main className="min-w-0">
          <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-8">
            {item.featuredImageUrl && (
              <div
                role="img"
                aria-label={item.title}
                className="mb-8 aspect-16/8 rounded-2xl bg-gray-100 bg-cover bg-center dark:bg-gray-800"
                style={{
                  backgroundImage: `url(${JSON.stringify(item.featuredImageUrl)})`,
                }}
              />
            )}
            <div className="text-[15px] leading-9 text-gray-800 wrap-break-word dark:text-gray-200 sm:text-base [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 [&_blockquote]:my-6 [&_blockquote]:border-s-4 [&_blockquote]:border-primary/40 [&_blockquote]:bg-gray-50 [&_blockquote]:px-5 [&_blockquote]:py-3 [&_blockquote]:text-gray-600 dark:[&_blockquote]:bg-gray-950/70 dark:[&_blockquote]:text-gray-300 [&_figcaption]:mt-2 [&_figcaption]:text-center [&_figcaption]:text-xs [&_figcaption]:text-gray-500 [&_figure]:my-7 [&_h1]:my-6 [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:my-6 [&_h2]:text-xl [&_h2]:font-bold [&_h3]:my-5 [&_h3]:text-lg [&_h3]:font-bold [&_h4]:my-4 [&_h4]:font-bold [&_hr]:my-8 [&_hr]:border-gray-200 dark:[&_hr]:border-gray-800 [&_iframe]:aspect-video [&_iframe]:h-auto [&_iframe]:w-full [&_iframe]:rounded-xl [&_img]:my-6 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-xl [&_li]:my-1 [&_ol]:my-5 [&_ol]:list-decimal [&_ol]:pe-6 [&_p]:my-5 [&_pre]:my-6 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:bg-gray-950 [&_pre]:p-4 [&_pre]:text-sm [&_pre]:text-gray-100 [&_table]:my-7 [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm [&_td]:border [&_td]:border-gray-200 [&_td]:p-3 dark:[&_td]:border-gray-700 [&_th]:border [&_th]:border-gray-200 [&_th]:bg-gray-50 [&_th]:p-3 dark:[&_th]:border-gray-700 dark:[&_th]:bg-gray-800 [&_ul]:my-5 [&_ul]:list-disc [&_ul]:pe-6">
              {sanitizedContent ? (
                parse(sanitizedContent)
              ) : (
                <p className="text-gray-500">متن این نوشته در حال تکمیل است.</p>
              )}
            </div>

            {item.tags.length > 0 && (
              <div className="mt-8 flex flex-wrap items-center gap-2 border-t border-gray-200 pt-6 dark:border-gray-800">
                <TbHash className="text-primary" />
                {item.tags.map((tag) => (
                  <Link
                    key={tag.slug}
                    href={`${config.basePath}/tag/${encodeURIComponent(tag.slug)}`}
                    className="rounded-full bg-gray-100 px-3 py-1.5 text-xs text-gray-600 transition hover:bg-primary/10 hover:text-primary dark:bg-gray-800 dark:text-gray-300"
                  >
                    #{tag.name}
                  </Link>
                ))}
              </div>
            )}

            <ContentInteractions
              kind={config.kind}
              slug={item.slug}
              initialReaction={initialReaction}
            />
          </article>

          <section
            className="mt-7 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-8"
            aria-labelledby="comments-title"
          >
            <div className="flex items-center justify-between gap-3">
              <h2 id="comments-title" className="text-xl font-bold">
                دیدگاه‌ها
              </h2>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-500 dark:bg-gray-800">
                {formatNumber(item.commentsCount)} دیدگاه منتشرشده
              </span>
            </div>
            {comments.length > 0 ? (
              <div className="mt-6 space-y-4">
                {comments.map((comment) => (
                  <CommentItem key={comment.publicId} comment={comment} />
                ))}
              </div>
            ) : (
              <p className="mt-6 rounded-xl bg-gray-50 p-5 text-sm text-gray-500 dark:bg-gray-950/70">
                هنوز دیدگاه تأییدشده‌ای ثبت نشده است.
              </p>
            )}
          </section>
        </main>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <form
            method="get"
            action={config.basePath}
            className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900"
          >
            <label htmlFor="sidebar-search" className="font-bold">
              جستجو در {config.title}
            </label>
            <div className="relative mt-3">
              <TbSearch className="absolute inset-s-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                id="sidebar-search"
                name="search"
                placeholder="جستجو کنید"
                className="h-10 w-full rounded-xl border border-gray-200 bg-white pe-3 ps-9 text-sm outline-none focus:border-primary dark:border-gray-700 dark:bg-gray-950"
              />
            </div>
          </form>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h6 className="font-bold">آمار {config.title}</h6>
            <div className="mt-4 grid grid-cols-2 gap-3 text-center">
              <SidebarStat
                icon={TbBook2}
                value={stats.contentsCount}
                label="نوشته"
              />
              <SidebarStat
                icon={TbEye}
                value={stats.viewsCount}
                label="بازدید"
              />
              <SidebarStat
                icon={TbHeart}
                value={stats.likesCount}
                label="پسند"
              />
              <SidebarStat
                icon={TbThumbDown}
                value={stats.dislikesCount}
                label="دیسلایک"
              />
            </div>
          </div>

          {tags.length > 0 && (
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <h6 className="font-bold">برچسب‌های پرکاربرد</h6>
              <div className="mt-4 flex flex-wrap gap-2">
                {tags.slice(0, 12).map((tag) => (
                  <Link
                    key={tag.slug}
                    href={`${config.basePath}/tag/${encodeURIComponent(tag.slug)}`}
                    className="rounded-full border border-gray-200 px-2.5 py-1 text-xs text-gray-500 transition hover:border-primary hover:text-primary dark:border-gray-700"
                  >
                    #{tag.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {related.length > 0 && (
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <h6 className="font-bold">نوشته‌های مرتبط</h6>
              <div className="mt-3 divide-y divide-gray-100 dark:divide-gray-800">
                {related.map((relatedItem) => (
                  <Link
                    key={relatedItem.slug}
                    href={`${config.basePath}/${relatedItem.slug}`}
                    className="block py-3 text-sm font-medium leading-6 transition hover:text-primary"
                  >
                    {relatedItem.title}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}

function SidebarStat({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof TbEye
  value: number
  label: string
}) {
  return (
    <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-950/70">
      <Icon className="mx-auto text-primary" />
      <div className="mt-1 font-bold">{formatNumber(value)}</div>
      <div className="text-[11px] text-gray-500">{label}</div>
    </div>
  )
}

function CommentItem({
  comment,
  depth = 0,
}: {
  comment: ContentComment
  depth?: number
}) {
  return (
    <div
      className={
        depth > 0
          ? "ms-5 border-s-2 border-gray-100 ps-4 dark:border-gray-800"
          : ""
      }
    >
      <article className="rounded-xl bg-gray-50 p-4 dark:bg-gray-950/70">
        <div className="flex items-center justify-between gap-3 text-xs text-gray-500">
          <span className="font-medium text-gray-700 dark:text-gray-200">
            {comment.author?.name ?? "کاربر دادلاین"}
          </span>
          <time dateTime={comment.createdAt ?? undefined}>
            {formatContentDate(comment.createdAt)}
          </time>
        </div>
        <p className="mt-3 whitespace-pre-line text-sm leading-7 text-gray-700 dark:text-gray-300">
          {comment.content}
        </p>
      </article>
      {comment.replies.length > 0 && (
        <div className="mt-3 space-y-3">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.publicId}
              comment={reply}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}
