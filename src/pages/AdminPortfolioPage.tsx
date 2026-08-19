import { useState, useEffect } from "react"
import { t, type Lang } from "../i18n"
import { Icon } from "../components/layout/Icon"
import { Button } from "../components/ui/Button"
import { Input, Textarea, Select } from "../components/ui/Input"
import {
  listAdminPortfolio,
  getAdminPortfolio,
  createAdminPortfolio,
  updateAdminPortfolio,
  deleteAdminPortfolio,
  listAdminProfiles,
  type PortfolioRow,
} from "../lib/api"
import { PortfolioCardSkeleton, ListSkeleton } from "../components/ui/Skeleton"
import { portfolioSchema, type PortfolioInput } from "../lib/validation"

interface AdminPortfolioPageProps {
  tr: typeof t["en"] & typeof t["fa"]
  lang: Lang
}

export default function AdminPortfolioPage({
  lang,
  tr,
}: AdminPortfolioPageProps) {
  const [items, setItems] = useState<PortfolioRow[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"list" | "create" | "edit">("list")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: "",
    description: "",
    mediaUrl: "",
    mediaType: "image" as "image" | "video" | "link",
    tags: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const isFa = lang === "fa"

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      mediaUrl: "",
      mediaType: "image",
      tags: "",
    })
    setEditingId(null)
    setErrors({})
    setActiveTab("list")
  }

  const startEdit = (item: PortfolioRow) => {
    setEditingId(item.id)
    setErrors({})
    setForm({
      title: item.title,
      description: item.description,
      mediaUrl: item.mediaUrl,
      mediaType: item.mediaType,
      tags: item.tags.join(", "),
    })
    setActiveTab("edit")
  }

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.mediaUrl.trim()) return
    const tags = form.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
    const result = portfolioSchema.safeParse({
      title: form.title,
      description: form.description,
      mediaUrl: form.mediaUrl,
      mediaType: form.mediaType,
      tags,
    })
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      result.error.errors.forEach((err) => {
        const key = err.path[0] as string
        if (key) fieldErrors[key] = err.message
      })
      setErrors(fieldErrors)
      return
    }
    setErrors({})
    setSaving(true)
    try {
      const payload = result.data as PortfolioInput
      if (editingId) {
        const updated = await updateAdminPortfolio(editingId, payload)
        setItems((prev) =>
          prev.map((item) => (item.id === editingId ? updated : item)),
        )
      } else {
        const created = await createAdminPortfolio(payload)
        setItems((prev) => [created, ...prev])
      }
      resetForm()
    } catch {
      // handle error
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm(tr.adminPortfolio.deleteConfirm)) {
      await deleteAdminPortfolio(id)
      setItems((prev) => prev.filter((item) => item.id !== id))
    }
  }

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const profiles = await listAdminProfiles()
        if (cancelled) return

        const adminId = profiles[0]?.id
        if (adminId) {
          const portfolio = await listAdminPortfolio(adminId)
          if (!cancelled) {
            setItems(portfolio)
          }
        } else {
          setItems([])
        }
      } catch {
        if (!cancelled) {
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
  }, [])

  const mediaTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      image: "bg-emerald-100 text-emerald-700",
      video: "bg-blue-100 text-blue-700",
      link: "bg-purple-100 text-purple-700",
    }
    const labels: Record<string, string> = {
      image: tr.adminPortfolio.image,
      video: tr.adminPortfolio.video,
      link: tr.adminPortfolio.link,
    }
    return (
      <span
        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
          colors[type] || "bg-gray-100 text-gray-700"
        }`}
      >
        {labels[type] || type}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="p-6 lg:p-8 max-w-5xl mx-auto fade-in">
        <ListSkeleton count={3} />
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0f172a]">
          {tr.adminPortfolio.title}
        </h1>
        <p className="text-[#64748b] mt-1">{tr.adminPortfolio.sub}</p>
      </div>

      <div className="flex gap-1 bg-white border border-[#e2e8f0] rounded-xl p-1 mb-6 w-fit shadow-sm">
        {[
          { id: "list", label: tr.adminProfile.manage },
          {
            id: "create",
            label: editingId
              ? tr.adminPortfolio.editItem
              : tr.adminPortfolio.addItem,
          },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              if (tab.id === "list") resetForm()
              setActiveTab(tab.id as "list" | "create" | "edit")
            }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all btn-press ${
              activeTab === tab.id
                ? "bg-[#1e3a5f] text-white shadow-sm"
                : "text-[#64748b] hover:text-[#1e3a5f]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "list" && (
        <div className="space-y-4 fade-in">
          {items.length === 0 && (
            <div className="bg-white rounded-2xl border border-[#e2e8f0] p-12 text-center">
              <div className="text-4xl mb-3">🖼️</div>
              <div className="font-bold text-[#0f172a] mb-1">
                {tr.adminPortfolio.noItems}
              </div>
              <button
                onClick={() => setActiveTab("create")}
                className="px-4 py-2 rounded-xl bg-[#1e3a5f] text-white text-sm font-bold btn-press"
              >
                {tr.adminPortfolio.addItem}
              </button>
            </div>
          )}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-[#e2e8f0] p-5 card-hover"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-[#0f172a] mb-1 truncate">
                      {item.title}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {mediaTypeBadge(item.mediaType)}
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => startEdit(item)}
                      className="w-8 h-8 rounded-lg bg-[#f2f5fa] flex items-center justify-center text-[#1e3a5f] hover:bg-[#1e3a5f]/10 transition-colors"
                    >
                      <Icon name="edit" size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600 hover:bg-rose-100 transition-colors"
                    >
                      <Icon name="trash" size={14} />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-[#64748b] mb-3 line-clamp-2">
                  {item.description}
                </p>
                <p className="text-xs text-[#64748b] mb-3 truncate">
                  {item.mediaUrl}
                </p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {item.tags.slice(0, 4).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-full bg-[#f2f5fa] text-[#64748b] text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="text-xs text-[#94a3b8]">
                  {new Date(item.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(activeTab === "create" || activeTab === "edit") && (
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 fade-in">
          <h2 className="font-bold text-[#0f172a] text-lg mb-6">
            {editingId ? tr.adminPortfolio.editItem : tr.adminPortfolio.addItem}
          </h2>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
                {tr.adminPortfolio.title}
              </label>
              <Input
                value={form.title}
                onChange={(v) => setForm((f) => ({ ...f, title: v }))}
                placeholder={tr.adminPortfolio.title}
              />
              {errors.title && (
                <p className="mt-1 text-xs text-red-600">{errors.title}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
                {tr.adminPortfolio.description}
              </label>
              <Textarea
                value={form.description}
                onChange={(v) => setForm((f) => ({ ...f, description: v }))}
                placeholder={tr.adminPortfolio.description}
                rows={3}
              />
              {errors.description && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.description}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
                {tr.adminPortfolio.mediaUrl}
              </label>
              <Input
                value={form.mediaUrl}
                onChange={(v) => setForm((f) => ({ ...f, mediaUrl: v }))}
                placeholder={tr.adminPortfolio.mediaUrl}
              />
              {errors.mediaUrl && (
                <p className="mt-1 text-xs text-red-600">{errors.mediaUrl}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
                {tr.adminPortfolio.mediaType}
              </label>
              <Select
                value={form.mediaType}
                onChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    mediaType: v as "image" | "video" | "link",
                  }))
                }
                options={[
                  { value: "image", label: tr.adminPortfolio.image },
                  { value: "video", label: tr.adminPortfolio.video },
                  { value: "link", label: tr.adminPortfolio.link },
                ]}
              />
              {errors.mediaType && (
                <p className="mt-1 text-xs text-red-600">{errors.mediaType}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
                {tr.adminPortfolio.tags}
              </label>
              <Input
                value={form.tags}
                onChange={(v) => setForm((f) => ({ ...f, tags: v }))}
                placeholder={tr.adminPortfolio.tags}
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSubmit}
                disabled={!form.title.trim() || !form.mediaUrl.trim() || saving}
              >
                {saving ? tr.common.loading : tr.common.save}
              </Button>
              {editingId && (
                <Button variant="secondary" onClick={resetForm}>
                  {tr.common.cancel}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
