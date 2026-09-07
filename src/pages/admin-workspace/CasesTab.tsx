import { useState, useEffect } from "react"
import type { Tr, Lang } from "./utils"
import {
  listAdminCases,
  getAdminCase,
  createAdminCase,
  updateAdminCase,
  type CaseRow,
} from "../../lib/api"
import { ListSkeleton } from "../../components/ui/Skeleton"
import { CASE_STATUS, PRIORITY, fmtDate } from "./utils"

function CasesTab({ tr, lang, isFa }: { tr: Tr; lang: Lang; isFa: boolean }) {
  const [cases, setCases] = useState<CaseRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    employerId: "",
    tags: "",
  })
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    status: "open",
    tags: "",
  })
  const [editErrors, setEditErrors] = useState<Record<string, string>>({})

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await listAdminCases()
      setCases(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load cases")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const resetForm = () => {
    setForm({ title: "", description: "", priority: "medium", employerId: "", tags: "" })
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    const fieldErrors: Record<string, string> = {}
    if (!form.title.trim()) fieldErrors.title = "Required"
    if (!form.description.trim()) fieldErrors.description = "Required"
    if (!form.employerId.trim()) fieldErrors.employerId = "Required"
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors)
      return
    }
    try {
      const created = await createAdminCase({
        employerId: form.employerId,
        title: form.title,
        description: form.description,
        priority: form.priority,
        tags: form.tags
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      })
      setCases((prev) => [created, ...prev])
      resetForm()
      setShowForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create case")
    }
  }

  const startEdit = (c: CaseRow) => {
    setEditingId(c.id)
    setEditForm({
      title: c.title,
      description: c.description,
      priority: c.priority,
      status: c.status,
      tags: (c.tags || []).join(", "),
    })
  }

  const handleUpdate = async (id: string) => {
    setEditErrors({})
    const fieldErrors: Record<string, string> = {}
    if (!editForm.title.trim()) fieldErrors.title = "Required"
    if (!editForm.description.trim()) fieldErrors.description = "Required"
    if (Object.keys(fieldErrors).length > 0) {
      setEditErrors(fieldErrors)
      return
    }
    try {
      const updated = await updateAdminCase(id, {
        title: editForm.title,
        description: editForm.description,
        priority: editForm.priority,
        status: editForm.status,
        tags: editForm.tags
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      })
      setCases((prev) => prev.map((c) => (c.id === id ? updated : c)))
      setEditingId(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update case")
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-[#0f172a]">{tr.adminWorkspace.cases}</h2>
        <button
          onClick={() => {
            setShowForm((v) => !v)
            setEditingId(null)
          }}
          className="px-4 py-2 rounded-xl bg-[#1e3a5f] text-white text-sm font-bold hover:bg-[#122435] transition-colors btn-press"
        >
          {showForm ? tr.common.cancel : tr.adminWorkspace.newCase}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-white rounded-2xl border border-[#e2e8f0] p-6 mb-4 space-y-4"
        >
          <div>
            <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
              {tr.adminWorkspace.title}
            </label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              className="w-full px-4 py-3 rounded-xl border border-[#e2e8f0] text-sm focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/20 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
              {tr.adminWorkspace.description}
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-[#e2e8f0] text-sm focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/20 transition-all resize-none"
            />
            {errors.description && (
              <p className="text-xs text-rose-600 mt-1">{errors.description}</p>
            )}
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
                {isFa ? "شناسه کارفرما" : "Employer ID"}
              </label>
              <input
                value={form.employerId}
                onChange={(e) => setForm({ ...form, employerId: e.target.value })}
                required
                className="w-full px-4 py-3 rounded-xl border border-[#e2e8f0] text-sm focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/20 transition-all"
              />
              {errors.employerId && (
                <p className="text-xs text-rose-600 mt-1">{errors.employerId}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
                {tr.adminWorkspace.priority}
              </label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-[#e2e8f0] text-sm focus:border-[#1e3a5f] transition-all bg-white"
              >
                {Object.entries(PRIORITY).map(([key, val]) => (
                  <option key={key} value={key}>
                    {isFa ? val.fa : val.en}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
              {isFa ? "برچسب‌ها (با کاما جدا شود)" : "Tags (comma separated)"}
            </label>
            <input
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-[#e2e8f0] text-sm focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/20 transition-all"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-[#1e3a5f] text-white text-sm font-bold hover:bg-[#122435] transition-colors btn-press"
          >
            {tr.common.save}
          </button>
        </form>
      )}

      {loading ? (
        <ListSkeleton count={3} />
      ) : cases.length === 0 ? (
        <div className="text-center py-16 text-[#64748b]">
          {tr.adminWorkspace.noCases}
        </div>
      ) : (
        <div className="space-y-3">
          {cases.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-2xl border border-[#e2e8f0] p-5"
            >
              {editingId === c.id ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
                      {tr.adminWorkspace.title}
                    </label>
                    <input
                      value={editForm.title}
                      onChange={(e) =>
                        setEditForm({ ...editForm, title: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl border border-[#e2e8f0] text-sm focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
                      {tr.adminWorkspace.description}
                    </label>
                    <textarea
                      value={editForm.description}
                      onChange={(e) =>
                        setEditForm({ ...editForm, description: e.target.value })
                      }
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-[#e2e8f0] text-sm focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/20 transition-all resize-none"
                    />
                  </div>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
                        {tr.adminWorkspace.priority}
                      </label>
                      <select
                        value={editForm.priority}
                        onChange={(e) =>
                          setEditForm({ ...editForm, priority: e.target.value })
                        }
                        className="w-full px-4 py-3 rounded-xl border border-[#e2e8f0] text-sm focus:border-[#1e3a5f] transition-all bg-white"
                      >
                        {Object.entries(PRIORITY).map(([key, val]) => (
                          <option key={key} value={key}>
                            {isFa ? val.fa : val.en}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
                        {tr.adminWorkspace.status}
                      </label>
                      <select
                        value={editForm.status}
                        onChange={(e) =>
                          setEditForm({ ...editForm, status: e.target.value })
                        }
                        className="w-full px-4 py-3 rounded-xl border border-[#e2e8f0] text-sm focus:border-[#1e3a5f] transition-all bg-white"
                      >
                        {Object.entries(CASE_STATUS).map(([key, val]) => (
                          <option key={key} value={key}>
                            {isFa ? val.fa : val.en}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
                        {isFa ? "برچسب‌ها" : "Tags"}
                      </label>
                      <input
                        value={editForm.tags}
                        onChange={(e) =>
                          setEditForm({ ...editForm, tags: e.target.value })
                        }
                        className="w-full px-4 py-3 rounded-xl border border-[#e2e8f0] text-sm focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/20 transition-all"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleUpdate(c.id)}
                      className="px-4 py-2 rounded-xl bg-[#1e3a5f] text-white text-sm font-bold hover:bg-[#122435] transition-colors btn-press"
                    >
                      {tr.common.save}
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-4 py-2 rounded-xl border border-[#e2e8f0] text-[#64748b] text-sm font-bold hover:bg-[#f8fafc] transition-colors btn-press"
                    >
                      {tr.common.cancel}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="font-bold text-sm text-[#0f172a] truncate">
                        {c.title}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${CASE_STATUS[c.status]?.color || "bg-gray-100 text-gray-700"}`}
                      >
                        {isFa
                          ? CASE_STATUS[c.status]?.fa || c.status
                          : CASE_STATUS[c.status]?.en || c.status}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${PRIORITY[c.priority]?.color || "bg-gray-100 text-gray-700"}`}
                      >
                        {isFa
                          ? PRIORITY[c.priority]?.fa || c.priority
                          : PRIORITY[c.priority]?.en || c.priority}
                      </span>
                    </div>
                    <div className="text-sm text-[#64748b] mb-1">
                      {isFa ? "کارفرما" : "Employer"}: {c.employerName || c.employerId}
                    </div>
                    {c.tags && c.tags.length > 0 && (
                      <div className="flex gap-1.5 flex-wrap mt-1">
                        {c.tags.map((tag, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-full bg-[#1e3a5f]/10 text-[#1e3a5f] text-xs font-semibold"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="text-xs text-[#64748b] mt-2">
                      {fmtDate(c.createdAt)}
                    </div>
                  </div>
                  <button
                    onClick={() => startEdit(c)}
                    className="px-4 py-2 rounded-xl border border-[#e2e8f0] text-[#64748b] text-xs font-bold hover:bg-[#f8fafc] transition-colors btn-press flex-shrink-0"
                  >
                    {tr.common.edit}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default CasesTab
