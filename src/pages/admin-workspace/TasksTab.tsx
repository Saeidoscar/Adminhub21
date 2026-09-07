import { useState, useEffect } from "react"
import type { Tr, Lang } from "./utils"
import {
  listAdminCases,
  listAdminTasks,
  getAdminTask,
  createAdminTask,
  updateAdminTask,
  type CaseRow,
  type TaskRow,
} from "../../lib/api"
import { ListSkeleton } from "../../components/ui/Skeleton"
import { TASK_STATUS, PRIORITY, fmtDate } from "./utils"

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
      .catch((err) => console.error("Failed to load cases", err))
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

export default TasksTab
