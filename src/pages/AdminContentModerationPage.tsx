import { useState, useEffect } from "react"
import { t, type Lang } from "../i18n"
import { Button } from "../components/ui/Button"
import { Input, Select } from "../components/ui/Input"
import {
  listAdminStories,
  listAdminBlogs,
  moderateStoryAdmin,
  moderateBlogAdmin,
  listAdminComments,
  deleteAdminComment,
  type StoryRow,
  type BlogRow,
  type CommentRow,
} from "../lib/api"
import { ContentCardSkeleton, ListSkeleton } from "../components/ui/Skeleton"

const TABS = [
  { id: "stories", labelKey: "stories" as const },
  { id: "blogs", labelKey: "blogs" as const },
  { id: "comments", labelKey: "comments" as const },
]

const STATUS_OPTIONS = [
  { value: "", labelEn: "All", labelFa: "همه" },
  { value: "draft", labelEn: "Draft", labelFa: "پیش‌نویس" },
  { value: "published", labelEn: "Published", labelFa: "منتشر شده" },
  { value: "archived", labelEn: "Archived", labelFa: "آرشیو شده" },
]

const POST_TYPE_OPTIONS = [
  { value: "", labelEn: "All Types", labelFa: "همه نوع‌ها" },
  { value: "story", labelEn: "Story", labelFa: "استوری" },
  { value: "blog", labelEn: "Blog", labelFa: "بلاگ" },
]

export default function AdminContentModerationPage({
  tr,
  lang = "fa",
}: {
  tr: typeof t["en"] & typeof t["fa"]
  lang: Lang
}) {
  const isFa = lang === "fa"
  const [activeTab, setActiveTab] = useState<"stories" | "blogs" | "comments">(
    "stories",
  )
  const [items, setItems] = useState<(StoryRow | BlogRow | CommentRow)[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [postTypeFilter, setPostTypeFilter] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError("")

    async function load() {
      try {
        let data: (StoryRow | BlogRow | CommentRow)[] = []
        if (activeTab === "stories") {
          data = await listAdminStories({
            status: statusFilter || undefined,
            search: search || undefined,
          })
        } else if (activeTab === "blogs") {
          data = await listAdminBlogs({
            status: statusFilter || undefined,
            search: search || undefined,
          })
        } else {
          data = await listAdminComments({
            postType: postTypeFilter || undefined,
          })
        }
        if (!cancelled) {
          setItems(data)
        }
      } catch {
        if (!cancelled) {
          setError(isFa ? "خطا در بارگذاری داده‌ها" : "Error loading data")
          setItems([])
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [activeTab, search, statusFilter, postTypeFilter])

  const handleModerate = async (
    id: string,
    action: "approve" | "reject" | "archive",
  ) => {
    try {
      if (activeTab === "stories") {
        await moderateStoryAdmin(id, action)
      } else if (activeTab === "blogs") {
        await moderateBlogAdmin(id, action)
      }
      if (activeTab === "stories") {
        const refreshed = await listAdminStories({
          status: statusFilter || undefined,
          search: search || undefined,
        })
        setItems(refreshed)
      } else if (activeTab === "blogs") {
        const refreshed = await listAdminBlogs({
          status: statusFilter || undefined,
          search: search || undefined,
        })
        setItems(refreshed)
      }
    } catch {
      setError(isFa ? "خطا در اعمال تغییرات" : "Error applying changes")
    }
  }

  const handleDeleteComment = async (id: string) => {
    try {
      await deleteAdminComment(id)
      const refreshed = await listAdminComments({
        postType: postTypeFilter || undefined,
      })
      setItems(refreshed)
    } catch {
      setError(isFa ? "خطا در حذف نظر" : "Error deleting comment")
    }
  }

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      draft: "bg-gray-100 text-gray-700",
      published: "bg-emerald-100 text-emerald-700",
      archived: "bg-amber-100 text-amber-700",
    }
    const labels: Record<string, string> = {
      draft: tr.adminContent.draft,
      published: tr.adminContent.published,
      archived: tr.adminContent.archived,
    }
    return (
      <span
        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${colors[status] || "bg-gray-100 text-gray-700"}`}
      >
        {labels[status] || status}
      </span>
    )
  }

  const getPostTypeBadge = (postType: string) => {
    const colors: Record<string, string> = {
      story: "bg-sky-100 text-sky-700",
      blog: "bg-purple-100 text-purple-700",
    }
    const labels: Record<string, string> = {
      story: tr.adminContent.stories,
      blog: tr.adminContent.blogs,
    }
    return (
      <span
        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${colors[postType] || "bg-gray-100 text-gray-700"}`}
      >
        {labels[postType] || postType}
      </span>
    )
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-"
    return new Date(dateStr).toLocaleDateString(isFa ? "fa-IR" : "en-US")
  }

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0f172a]">
          {tr.adminContent.title}
        </h1>
        <p className="text-[#64748b] mt-1">{tr.adminContent.sub}</p>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl p-4 mb-6 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-1 bg-white border border-[#e2e8f0] rounded-xl p-1 mb-6 w-fit shadow-sm">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as "stories" | "blogs" | "comments")
              setSearch("")
              setStatusFilter("")
              setPostTypeFilter("")
            }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all btn-press ${
              activeTab === tab.id
                ? "bg-[#1e3a5f] text-white shadow-sm"
                : "text-[#64748b] hover:text-[#1e3a5f]"
            }`}
          >
            {tr.adminContent[tab.labelKey]}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        {(activeTab === "stories" || activeTab === "blogs") && (
          <>
            <div className="flex-1 min-w-[200px]">
              <Input
                value={search}
                onChange={setSearch}
                placeholder={tr.adminContent.search}
              />
            </div>
            <div className="min-w-[160px]">
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                options={STATUS_OPTIONS.map((opt) => ({
                  value: opt.value,
                  label: isFa ? opt.labelFa : opt.labelEn,
                }))}
              />
            </div>
          </>
        )}
        {activeTab === "comments" && (
          <div className="min-w-[160px]">
            <Select
              value={postTypeFilter}
              onChange={setPostTypeFilter}
              options={POST_TYPE_OPTIONS.map((opt) => ({
                value: opt.value,
                label: isFa ? opt.labelFa : opt.labelEn,
              }))}
            />
          </div>
        )}
      </div>

      {loading ? (
        <ListSkeleton count={4} />
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-12 text-center">
          <div className="text-4xl mb-3">📭</div>
          <div className="font-bold text-[#0f172a] mb-1">
            {activeTab === "stories" && tr.adminContent.noStories}
            {activeTab === "blogs" && tr.adminContent.noBlogs}
            {activeTab === "comments" && tr.adminContent.noComments}
          </div>
        </div>
      ) : (
        <div className="space-y-4 fade-in">
          {items.map((item) => {
            if (activeTab === "comments") {
              const comment = item as CommentRow
              return (
                <div
                  key={comment.id}
                  className="bg-white rounded-2xl border border-[#e2e8f0] p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {getPostTypeBadge(comment.postType)}
                        <span className="text-sm font-semibold text-[#0f172a]">
                          {comment.authorName}
                        </span>
                        <span className="text-xs text-[#94a3b8]">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-[#64748b] leading-relaxed">
                        {comment.body}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteComment(comment.id)}
                      >
                        {tr.adminContent.delete}
                      </Button>
                    </div>
                  </div>
                </div>
              )
            }

            const storyBlog = item as StoryRow | BlogRow
            const isStory = activeTab === "stories"

            return (
              <div
                key={storyBlog.id}
                className="bg-white rounded-2xl border border-[#e2e8f0] p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {getStatusBadge(storyBlog.status)}
                      {isStory ? (
                        <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-700">
                          {tr.adminContent.stories}
                        </span>
                      ) : (
                        <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                          {tr.adminContent.blogs}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-[#0f172a] text-base mb-2">
                      {storyBlog.title}
                    </h3>
                    <div className="flex items-center gap-4 text-xs text-[#64748b]">
                      <span>
                        {tr.adminContent.author}: {storyBlog.authorName}
                      </span>
                      <span>
                        {tr.adminContent.views}: {storyBlog.views}
                      </span>
                      <span>{formatDate(storyBlog.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      onClick={() =>
                        handleModerate(storyBlog.id, "approve")
                      }
                    >
                      {tr.adminContent.approve}
                    </Button>
                    {isStory && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() =>
                          handleModerate(storyBlog.id, "reject")
                        }
                      >
                        {tr.adminContent.reject}
                      </Button>
                    )}
                    {isStory && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          handleModerate(storyBlog.id, "archive")
                        }
                      >
                        {tr.adminContent.archive}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
