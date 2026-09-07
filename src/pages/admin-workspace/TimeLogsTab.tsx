import { useState, useEffect } from "react"
import type { Tr, Lang } from "./utils"
import {
  listAdminTimeLogs,
  getAdminTimeLog,
  createAdminTimeLog,
  listAdminCases,
  type CaseRow,
  type TimeLogRow,
} from "../../lib/api"
import { ListSkeleton } from "../../components/ui/Skeleton"
import { fmtDateTime, calcMinutes } from "./utils"

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
       .catch((err) => console.error("Failed to load cases", err))
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

export default TimeLogsTab
