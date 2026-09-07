import { useState, useEffect } from "react"
import type { Tr, Lang } from "./utils"
import {
  listAdminEvents,
  getAdminEvent,
  createAdminEvent,
  updateAdminEvent,
  deleteAdminEvent,
  type EventRow,
} from "../../lib/api"
import { ListSkeleton } from "../../components/ui/Skeleton"
import { EVENT_COLORS, fmtDateTime, toLocalInput } from "./utils"

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

export default EventsTab
