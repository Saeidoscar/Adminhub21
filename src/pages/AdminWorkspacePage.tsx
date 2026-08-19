import { useState, useEffect } from "react"
import { t, type Lang } from "../i18n"
import {
  listAdminCases,
  getAdminCase,
  createAdminCase,
  updateAdminCase,
  listAdminTasks,
  getAdminTask,
  createAdminTask,
  updateAdminTask,
  listAdminEvents,
  getAdminEvent,
  createAdminEvent,
  updateAdminEvent,
  deleteAdminEvent,
  listAdminTimeLogs,
  getAdminTimeLog,
  createAdminTimeLog,
  type CaseRow,
  type TaskRow,
  type EventRow,
  type TimeLogRow,
} from "../lib/api"
import { ListSkeleton, UserCardSkeleton } from "../components/ui/Skeleton"

type Tr = typeof t["en"] & typeof t["fa"]
type TabKey = "cases" | "tasks" | "events" | "timeLogs"

const CASE_STATUS: Record<string, { en: string; fa: string; color: string }> = {
  open: { en: "Open", fa: "باز", color: "bg-emerald-100 text-emerald-700" },
  in_progress: {
    en: "In Progress",
    fa: "در حال انجام",
    color: "bg-blue-100 text-blue-700",
  },
  review: { en: "Review", fa: "بررسی", color: "bg-amber-100 text-amber-700" },
  closed: { en: "Closed", fa: "بسته شده", color: "bg-gray-100 text-gray-700" },
}

const TASK_STATUS: Record<string, { en: string; fa: string; color: string }> = {
  todo: { en: "To Do", fa: "انجام نشده", color: "bg-gray-100 text-gray-700" },
  in_progress: {
    en: "In Progress",
    fa: "در حال انجام",
    color: "bg-blue-100 text-blue-700",
  },
  done: { en: "Done", fa: "انجام شده", color: "bg-emerald-100 text-emerald-700" },
  blocked: { en: "Blocked", fa: "مسدود", color: "bg-red-100 text-red-700" },
}

const PRIORITY: Record<string, { en: string; fa: string; color: string }> = {
  low: { en: "Low", fa: "پایین", color: "bg-gray-100 text-gray-700" },
  medium: { en: "Medium", fa: "متوسط", color: "bg-blue-100 text-blue-700" },
  high: { en: "High", fa: "بالا", color: "bg-amber-100 text-amber-700" },
  urgent: { en: "Urgent", fa: "فوری", color: "bg-red-100 text-red-700" },
}

const EVENT_COLORS = ["#1e3a5f", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]

function fmtDate(value: string) {
  try {
    return new Date(value).toLocaleDateString()
  } catch {
    return value
  }
}

function fmtDateTime(value: string) {
  try {
    return new Date(value).toLocaleString()
  } catch {
    return value
  }
}

function toLocalInput(value: string) {
  const d = new Date(value)
  if (isNaN(d.getTime())) return ""
  const off = d.getTimezoneOffset()
  const local = new Date(d.getTime() - off * 60000)
  return local.toISOString().slice(0, 16)
}

function calcMinutes(startedAt: string, endedAt: string) {
  if (!startedAt || !endedAt) return null
  const diff = new Date(endedAt).getTime() - new Date(startedAt).getTime()
  if (isNaN(diff) || diff < 0) return null
  return Math.round(diff / 60000)
}

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

function TasksTab({ tr, lang, isFa }: { tr: Tr; lang: Lang; isFa: boolean }) {
  const [cases, setCases] = useState<CaseRow[]>([])
  const [selectedCaseId, setSelectedCaseId] = useState<string>("")
  const [tasks, setTasks] = useState<TaskRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    assignedTo: "",
    dueDate: "",
  })
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    assignedTo: "",
    dueDate: "",
  })
  const [editErrors, setEditErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    listAdminCases()
      .then(setCases)
      .catch(() => {})
  }, [])

  const loadTasks = async (caseId: string) => {
    if (!caseId) {
      setTasks([])
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await listAdminTasks(caseId)
      setTasks(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tasks")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      status: "todo",
      priority: "medium",
      assignedTo: "",
      dueDate: "",
    })
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCaseId) return
    setErrors({})
    const fieldErrors: Record<string, string> = {}
    if (!form.title.trim()) fieldErrors.title = "Required"
    if (!form.description.trim()) fieldErrors.description = "Required"
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors)
      return
    }
    try {
      const created = await createAdminTask({
        caseId: selectedCaseId,
        title: form.title,
        description: form.description,
        status: form.status,
        priority: form.priority,
        assignedTo: form.assignedTo || undefined,
        dueDate: form.dueDate || undefined,
      })
      setTasks((prev) => [created, ...prev])
      resetForm()
      setShowForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create task")
    }
  }

  const startEdit = (task: TaskRow) => {
    setEditingId(task.id)
    setEditForm({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      assignedTo: task.assignedTo || "",
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : "",
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
      const updated = await updateAdminTask(id, {
        title: editForm.title,
        description: editForm.description,
        status: editForm.status,
        priority: editForm.priority,
        assignedTo: editForm.assignedTo || undefined,
        dueDate: editForm.dueDate || undefined,
      })
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)))
      setEditingId(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update task")
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <h2 className="text-lg font-bold text-[#0f172a]">{tr.adminWorkspace.tasks}</h2>
        <div className="flex items-center gap-3">
          <select
            value={selectedCaseId}
            onChange={(e) => {
              setSelectedCaseId(e.target.value)
              setEditingId(null)
              setShowForm(false)
              loadTasks(e.target.value)
            }}
            className="px-4 py-2 rounded-xl border border-[#e2e8f0] text-sm focus:border-[#1e3a5f] transition-all bg-white"
          >
            <option value="">{tr.adminWorkspace.selectCase}</option>
            {cases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              if (!selectedCaseId) return
              setShowForm((v) => !v)
              setEditingId(null)
            }}
            disabled={!selectedCaseId}
            className="px-4 py-2 rounded-xl bg-[#1e3a5f] text-white text-sm font-bold hover:bg-[#122435] transition-colors btn-press disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {showForm ? tr.common.cancel : tr.adminWorkspace.newTask}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      {!selectedCaseId ? (
        <div className="text-center py-16 text-[#64748b]">
          {tr.adminWorkspace.selectCase}
        </div>
      ) : (
        <>
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
            {errors.title && (
              <p className="text-xs text-rose-600 mt-1">{errors.title}</p>
            )}
              {errors.title && (
                <p className="text-xs text-rose-600 mt-1">{errors.title}</p>
              )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
                  {tr.adminWorkspace.description}
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-[#e2e8f0] text-sm focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/20 transition-all resize-none"
                />
                {errors.description && (
                  <p className="text-xs text-rose-600 mt-1">{errors.description}</p>
                )}
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
                    {tr.adminWorkspace.status}
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-[#e2e8f0] text-sm focus:border-[#1e3a5f] transition-all bg-white"
                  >
                    {Object.entries(TASK_STATUS).map(([key, val]) => (
                      <option key={key} value={key}>
                        {isFa ? val.fa : val.en}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
                    {tr.adminWorkspace.priority}
                  </label>
                  <select
                    value={form.priority}
                    onChange={(e) =>
                      setForm({ ...form, priority: e.target.value })
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
                    {tr.adminWorkspace.dueDate}
                  </label>
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-[#e2e8f0] text-sm focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/20 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
                  {tr.adminWorkspace.assignedTo}
                </label>
                <input
                  value={form.assignedTo}
                  onChange={(e) =>
                    setForm({ ...form, assignedTo: e.target.value })
                  }
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
          ) : tasks.length === 0 ? (
            <div className="text-center py-16 text-[#64748b]">
              {tr.adminWorkspace.noTasks}
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-white rounded-2xl border border-[#e2e8f0] p-5"
                >
                  {editingId === task.id ? (
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
                            setEditForm({
                              ...editForm,
                              description: e.target.value,
                            })
                          }
                          rows={3}
                          className="w-full px-4 py-3 rounded-xl border border-[#e2e8f0] text-sm focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/20 transition-all resize-none"
                        />
                      </div>
                      <div className="grid sm:grid-cols-3 gap-4">
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
                            {Object.entries(TASK_STATUS).map(([key, val]) => (
                              <option key={key} value={key}>
                                {isFa ? val.fa : val.en}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
                            {tr.adminWorkspace.priority}
                          </label>
                          <select
                            value={editForm.priority}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                priority: e.target.value,
                              })
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
                            {tr.adminWorkspace.dueDate}
                          </label>
                          <input
                            type="date"
                            value={editForm.dueDate}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                dueDate: e.target.value,
                              })
                            }
                            className="w-full px-4 py-3 rounded-xl border border-[#e2e8f0] text-sm focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/20 transition-all"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
                          {tr.adminWorkspace.assignedTo}
                        </label>
                        <input
                          value={editForm.assignedTo}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              assignedTo: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 rounded-xl border border-[#e2e8f0] text-sm focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/20 transition-all"
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleUpdate(task.id)}
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
                            {task.title}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${TASK_STATUS[task.status]?.color || "bg-gray-100 text-gray-700"}`}
                          >
                            {isFa
                              ? TASK_STATUS[task.status]?.fa || task.status
                              : TASK_STATUS[task.status]?.en || task.status}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${PRIORITY[task.priority]?.color || "bg-gray-100 text-gray-700"}`}
                          >
                            {isFa
                              ? PRIORITY[task.priority]?.fa || task.priority
                              : PRIORITY[task.priority]?.en || task.priority}
                          </span>
                        </div>
                        {task.assignedTo && (
                          <div className="text-sm text-[#64748b] mb-1">
                            {tr.adminWorkspace.assignedTo}: {task.assignedName || task.assignedTo}
                          </div>
                        )}
                        {task.dueDate && (
                          <div className="text-xs text-[#64748b]">
                            {tr.adminWorkspace.dueDate}: {fmtDate(task.dueDate)}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => startEdit(task)}
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
        </>
      )}
    </div>
  )
}

function EventsTab({ tr, lang, isFa }: { tr: Tr; lang: Lang; isFa: boolean }) {
  const [events, setEvents] = useState<EventRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({
    title: "",
    description: "",
    startAt: "",
    endAt: "",
    allDay: false,
    color: "#1e3a5f",
  })
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    startAt: "",
    endAt: "",
    allDay: false,
    color: "#1e3a5f",
  })
  const [editErrors, setEditErrors] = useState<Record<string, string>>({})

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await listAdminEvents()
      setEvents(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load events")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      startAt: "",
      endAt: "",
      allDay: false,
      color: "#1e3a5f",
    })
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    const fieldErrors: Record<string, string> = {}
    if (!form.title.trim()) fieldErrors.title = "Required"
    if (!form.startAt) fieldErrors.startAt = "Required"
    if (!form.endAt) fieldErrors.endAt = "Required"
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors)
      return
    }
    try {
      const created = await createAdminEvent({
        title: form.title,
        description: form.description,
        startAt: new Date(form.startAt).toISOString(),
        endAt: new Date(form.endAt).toISOString(),
        allDay: form.allDay,
        color: form.color,
      })
      setEvents((prev) => [created, ...prev])
      resetForm()
      setShowForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create event")
    }
  }

  const startEdit = (ev: EventRow) => {
    setEditingId(ev.id)
    setEditForm({
      title: ev.title,
      description: ev.description,
      startAt: toLocalInput(ev.startAt),
      endAt: toLocalInput(ev.endAt),
      allDay: ev.allDay,
      color: ev.color,
    })
  }

  const handleUpdate = async (id: string) => {
    setEditErrors({})
    const fieldErrors: Record<string, string> = {}
    if (!editForm.title.trim()) fieldErrors.title = "Required"
    if (!editForm.startAt) fieldErrors.startAt = "Required"
    if (!editForm.endAt) fieldErrors.endAt = "Required"
    if (Object.keys(fieldErrors).length > 0) {
      setEditErrors(fieldErrors)
      return
    }
    try {
      const updated = await updateAdminEvent(id, {
        title: editForm.title,
        description: editForm.description,
        startAt: new Date(editForm.startAt).toISOString(),
        endAt: new Date(editForm.endAt).toISOString(),
        allDay: editForm.allDay,
        color: editForm.color,
      })
      setEvents((prev) => prev.map((ev) => (ev.id === id ? updated : ev)))
      setEditingId(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update event")
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteAdminEvent(id)
      setEvents((prev) => prev.filter((ev) => ev.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete event")
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-[#0f172a]">
          {tr.adminWorkspace.events}
        </h2>
        <button
          onClick={() => {
            setShowForm((v) => !v)
            setEditingId(null)
          }}
          className="px-4 py-2 rounded-xl bg-[#1e3a5f] text-white text-sm font-bold hover:bg-[#122435] transition-colors btn-press"
        >
          {showForm ? tr.common.cancel : tr.adminWorkspace.newEvent}
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
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
                {tr.adminWorkspace.startDate}
              </label>
              <input
                type="datetime-local"
                value={form.startAt}
                onChange={(e) => setForm({ ...form, startAt: e.target.value })}
                required
                className="w-full px-4 py-3 rounded-xl border border-[#e2e8f0] text-sm focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/20 transition-all"
              />
              {errors.startAt && (
                <p className="text-xs text-rose-600 mt-1">{errors.startAt}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
                {tr.adminWorkspace.endDate}
              </label>
              <input
                type="datetime-local"
                value={form.endAt}
                onChange={(e) => setForm({ ...form, endAt: e.target.value })}
                required
                className="w-full px-4 py-3 rounded-xl border border-[#e2e8f0] text-sm focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/20 transition-all"
              />
              {errors.endAt && (
                <p className="text-xs text-rose-600 mt-1">{errors.endAt}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm font-semibold text-[#0f172a] cursor-pointer">
              <input
                type="checkbox"
                checked={form.allDay}
                onChange={(e) => setForm({ ...form, allDay: e.target.checked })}
                className="w-4 h-4 rounded border-[#e2e8f0] text-[#1e3a5f] focus:ring-[#1e3a5f]"
              />
              {tr.adminWorkspace.allDay}
            </label>
            <div className="flex items-center gap-2">
              <label className="text-sm font-semibold text-[#0f172a]">
                {isFa ? "رنگ" : "Color"}
              </label>
              <div className="flex gap-1.5">
                {EVENT_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setForm({ ...form, color })}
                    className={`w-6 h-6 rounded-full border-2 btn-press ${form.color === color ? "border-[#0f172a]" : "border-transparent"}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
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
      ) : events.length === 0 ? (
        <div className="text-center py-16 text-[#64748b]">
          {tr.adminWorkspace.noEvents}
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((ev) => (
            <div
              key={ev.id}
              className="bg-white rounded-2xl border border-[#e2e8f0] p-5"
            >
              {editingId === ev.id ? (
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
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
                        {tr.adminWorkspace.startDate}
                      </label>
                      <input
                        type="datetime-local"
                        value={editForm.startAt}
                        onChange={(e) =>
                          setEditForm({ ...editForm, startAt: e.target.value })
                        }
                        className="w-full px-4 py-3 rounded-xl border border-[#e2e8f0] text-sm focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/20 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
                        {tr.adminWorkspace.endDate}
                      </label>
                      <input
                        type="datetime-local"
                        value={editForm.endAt}
                        onChange={(e) =>
                          setEditForm({ ...editForm, endAt: e.target.value })
                        }
                        className="w-full px-4 py-3 rounded-xl border border-[#e2e8f0] text-sm focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/20 transition-all"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 text-sm font-semibold text-[#0f172a] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editForm.allDay}
                        onChange={(e) =>
                          setEditForm({ ...editForm, allDay: e.target.checked })
                        }
                        className="w-4 h-4 rounded border-[#e2e8f0] text-[#1e3a5f] focus:ring-[#1e3a5f]"
                      />
                      {tr.adminWorkspace.allDay}
                    </label>
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-semibold text-[#0f172a]">
                        {isFa ? "رنگ" : "Color"}
                      </label>
                      <div className="flex gap-1.5">
                        {EVENT_COLORS.map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setEditForm({ ...editForm, color })}
                            className={`w-6 h-6 rounded-full border-2 btn-press ${editForm.color === color ? "border-[#0f172a]" : "border-transparent"}`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleUpdate(ev.id)}
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
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: ev.color }}
                      />
                      <span className="font-bold text-sm text-[#0f172a] truncate">
                        {ev.title}
                      </span>
                      {ev.allDay && (
                        <span className="px-2 py-0.5 rounded-full bg-[#1e3a5f]/10 text-[#1e3a5f] text-xs font-semibold">
                          {tr.adminWorkspace.allDay}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-[#64748b]">
                      {fmtDateTime(ev.startAt)} - {fmtDateTime(ev.endAt)}
                    </div>
                    {ev.description && (
                      <div className="text-sm text-[#64748b] mt-1">
                        {ev.description}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => startEdit(ev)}
                      className="px-4 py-2 rounded-xl border border-[#e2e8f0] text-[#64748b] text-xs font-bold hover:bg-[#f8fafc] transition-colors btn-press"
                    >
                      {tr.common.edit}
                    </button>
                    <button
                      onClick={() => handleDelete(ev.id)}
                      className="px-4 py-2 rounded-xl border border-[#e2e8f0] text-red-600 text-xs font-bold hover:bg-red-50 transition-colors btn-press"
                    >
                      {tr.common.delete}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function TimeLogsTab({ tr, lang, isFa }: { tr: Tr; lang: Lang; isFa: boolean }) {
  const [timeLogs, setTimeLogs] = useState<TimeLogRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [cases, setCases] = useState<CaseRow[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    description: "",
    caseId: "",
    taskId: "",
    startedAt: "",
    endedAt: "",
  })

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await listAdminTimeLogs()
      setTimeLogs(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load time logs")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    listAdminCases()
      .then(setCases)
      .catch(() => {})
  }, [])

  const resetForm = () => {
    setForm({
      description: "",
      caseId: "",
      taskId: "",
      startedAt: "",
      endedAt: "",
    })
  }

  const previewMinutes = calcMinutes(form.startedAt, form.endedAt)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    const fieldErrors: Record<string, string> = {}
    if (!form.description.trim()) fieldErrors.description = "Required"
    if (!form.startedAt) fieldErrors.startedAt = "Required"
    if (!form.endedAt) fieldErrors.endedAt = "Required"
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors)
      return
    }
    try {
      const created = await createAdminTimeLog({
        description: form.description,
        caseId: form.caseId || undefined,
        taskId: form.taskId || undefined,
        startedAt: new Date(form.startedAt).toISOString(),
        endedAt: new Date(form.endedAt).toISOString(),
      })
      setTimeLogs((prev) => [created, ...prev])
      resetForm()
      setShowForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create time log")
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-[#0f172a]">
          {tr.adminWorkspace.timeLogs}
        </h2>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="px-4 py-2 rounded-xl bg-[#1e3a5f] text-white text-sm font-bold hover:bg-[#122435] transition-colors btn-press"
        >
          {showForm ? tr.common.cancel : tr.adminWorkspace.newTimeLog}
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
              {tr.adminWorkspace.description}
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              required
              className="w-full px-4 py-3 rounded-xl border border-[#e2e8f0] text-sm focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/20 transition-all resize-none"
            />
            {errors.description && (
              <p className="text-xs text-rose-600 mt-1">{errors.description}</p>
            )}
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
                {tr.adminWorkspace.caseTitle}
              </label>
              <select
                value={form.caseId}
                onChange={(e) => setForm({ ...form, caseId: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-[#e2e8f0] text-sm focus:border-[#1e3a5f] transition-all bg-white"
              >
                <option value="">{tr.adminWorkspace.selectCase}</option>
                {cases.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
                {isFa ? "شناسه وظیفه" : "Task ID"}
              </label>
              <input
                value={form.taskId}
                onChange={(e) => setForm({ ...form, taskId: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-[#e2e8f0] text-sm focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/20 transition-all"
              />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
                {tr.adminWorkspace.startedAt}
              </label>
              <input
                type="datetime-local"
                value={form.startedAt}
                onChange={(e) => setForm({ ...form, startedAt: e.target.value })}
                required
                className="w-full px-4 py-3 rounded-xl border border-[#e2e8f0] text-sm focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/20 transition-all"
              />
              {errors.startedAt && (
                <p className="text-xs text-rose-600 mt-1">{errors.startedAt}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
                {tr.adminWorkspace.endedAt}
              </label>
              <input
                type="datetime-local"
                value={form.endedAt}
                onChange={(e) => setForm({ ...form, endedAt: e.target.value })}
                required
                className="w-full px-4 py-3 rounded-xl border border-[#e2e8f0] text-sm focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/20 transition-all"
              />
              {errors.endedAt && (
                <p className="text-xs text-rose-600 mt-1">{errors.endedAt}</p>
              )}
            </div>
          </div>
          {previewMinutes !== null && (
            <div className="text-sm text-[#64748b]">
              {tr.adminWorkspace.duration}: {previewMinutes} {tr.adminWorkspace.minutes}
            </div>
          )}
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
      ) : timeLogs.length === 0 ? (
        <div className="text-center py-16 text-[#64748b]">
          {tr.adminWorkspace.noTimeLogs}
        </div>
      ) : (
        <div className="space-y-3">
          {timeLogs.map((log) => (
            <div
              key={log.id}
              className="bg-white rounded-2xl border border-[#e2e8f0] p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-[#0f172a] mb-2">
                    {log.description}
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-[#64748b]">
                    {log.caseTitle && (
                      <span className="px-2 py-0.5 rounded-full bg-[#1e3a5f]/10 text-[#1e3a5f] font-semibold">
                        {tr.adminWorkspace.caseTitle}: {log.caseTitle}
                      </span>
                    )}
                    {log.taskTitle && (
                      <span className="px-2 py-0.5 rounded-full bg-[#1e3a5f]/10 text-[#1e3a5f] font-semibold">
                        {log.taskTitle}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-[#64748b] mt-2">
                    {fmtDateTime(log.startedAt)} - {fmtDateTime(log.endedAt)}
                  </div>
                  <div className="text-sm text-[#0f172a] mt-1 font-semibold">
                    {tr.adminWorkspace.duration}: {log.durationMinutes ?? 0}{" "}
                    {tr.adminWorkspace.minutes}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function AdminWorkspacePage({
  tr,
  lang,
}: {
  tr: typeof t["en"] & typeof t["fa"]
  lang: Lang
}) {
  const isFa = lang === "fa"
  const [activeTab, setActiveTab] = useState<TabKey>("cases")

  const tabs: { key: TabKey; label: string }[] = [
    { key: "cases", label: tr.adminWorkspace.cases },
    { key: "tasks", label: tr.adminWorkspace.tasks },
    { key: "events", label: tr.adminWorkspace.events },
    { key: "timeLogs", label: tr.adminWorkspace.timeLogs },
  ]

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0f172a]">
          {tr.adminWorkspace.title}
        </h1>
        <p className="text-[#64748b] mt-1">{tr.adminWorkspace.sub}</p>
      </div>

      <div className="bg-white border border-[#e2e8f0] rounded-xl p-1 mb-6 w-fit shadow-sm">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors btn-press ${
              activeTab === tab.key
                ? "bg-[#1e3a5f] text-white"
                : "text-[#64748b] hover:text-[#0f172a]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "cases" && (
        <CasesTab tr={tr} lang={lang} isFa={isFa} />
      )}
      {activeTab === "tasks" && (
        <TasksTab tr={tr} lang={lang} isFa={isFa} />
      )}
      {activeTab === "events" && (
        <EventsTab tr={tr} lang={lang} isFa={isFa} />
      )}
      {activeTab === "timeLogs" && (
        <TimeLogsTab tr={tr} lang={lang} isFa={isFa} />
      )}
    </div>
  )
}
