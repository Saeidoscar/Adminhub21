import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { t, type Lang } from "../i18n"
import { Icon } from "../components/layout/Icon"
import {
  listAdminTickets,
  getAdminTicket,
  updateAdminTicket,
  listTicketMessages,
  createTicketMessage,
  type TicketRow,
  type TicketMessage,
} from "../lib/api"
import { TicketCardSkeleton, ListSkeleton } from "../components/ui/Skeleton"

const CATEGORY_LABELS: Record<string, { en: string fa: string }> = {
  billing: { en: "Billing", fa: "مالی" },
  technical: { en: "Technical", fa: "فنی" },
  account: { en: "Account", fa: "حساب کاربری" },
  other: { en: "Other", fa: "سایر" },
}

const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-gray-100 text-gray-700",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-amber-100 text-amber-700",
  urgent: "bg-red-100 text-red-700",
}

const PRIORITY_LABELS: Record<string, { en: string fa: string }> = {
  low: { en: "Low", fa: "پایین" },
  medium: { en: "Medium", fa: "متوسط" },
  high: { en: "High", fa: "بالا" },
  urgent: { en: "Urgent", fa: "فوری" },
}

const STATUS_COLORS: Record<string, string> = {
  open: "bg-emerald-100 text-emerald-700",
  in_progress: "bg-blue-100 text-blue-700",
  resolved: "bg-purple-100 text-purple-700",
  closed: "bg-gray-100 text-gray-700",
}

const STATUS_LABELS: Record<string, { en: string fa: string }> = {
  open: { en: "Open", fa: "باز" },
  in_progress: { en: "In Progress", fa: "در حال بررسی" },
  resolved: { en: "Resolved", fa: "حل شده" },
  closed: { en: "Closed", fa: "بسته شده" },
}

export default function AdminTicketsPage({
  tr,
  lang,
}: {
  tr: typeof t["en"] & typeof t["fa"]
  lang: Lang
}) {
  const navigate = useNavigate()
  const isFa = lang === "fa"

  const [tickets, setTickets] = useState<TicketRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [priorityFilter, setPriorityFilter] = useState("")
  const [currentTicket, setCurrentTicket] = useState<TicketRow | null>(null)
  const [messages, setMessages] = useState<TicketMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadTickets = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await listAdminTickets({
        status: statusFilter || undefined,
        category: categoryFilter || undefined,
        priority: priorityFilter || undefined,
      })
      setTickets(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tickets")
    } finally {
      setLoading(false)
    }
  }

  const loadTicketDetail = async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const [ticketData, messagesData] = await Promise.all([
        getAdminTicket(id),
        listTicketMessages(id),
      ])
      if (ticketData) {
        setCurrentTicket(ticketData)
        setMessages(messagesData)
      } else {
        setError(isFa ? "تیکت یافت نشد" : "Ticket not found")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load ticket")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (currentTicket) return
    loadTickets()
  }, [statusFilter, categoryFilter, priorityFilter])

  const handleViewTicket = (id: string) => {
    loadTicketDetail(id)
  }

  const handleBack = () => {
    setCurrentTicket(null)
    setMessages([])
    setNewMessage("")
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentTicket || !newMessage.trim()) return
    setSending(true)
    try {
      const message = await createTicketMessage(currentTicket.id, {
        body: newMessage.trim(),
      })
      setMessages((prev) => [...prev, message])
      setNewMessage("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message")
    } finally {
      setSending(false)
    }
  }

  const handleStatusChange = async (status: string) => {
    if (!currentTicket) return
    try {
      const updated = await updateAdminTicket(currentTicket.id, { status: status as TicketRow["status"] })
      setCurrentTicket(updated)
      await loadTickets()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update ticket")
    }
  }

  const handlePriorityChange = async (priority: string) => {
    if (!currentTicket) return
    try {
      const updated = await updateAdminTicket(currentTicket.id, { priority: priority as TicketRow["priority"] })
      setCurrentTicket(updated)
      await loadTickets()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update ticket")
    }
  }

  if (currentTicket) {
    return (
      <div className="p-6 lg:p-8 max-w-3xl mx-auto fade-in">
        <div className="mb-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-sm text-[#1e3a5f] font-semibold hover:underline mb-4 btn-press"
          >
            <Icon name="chevronLeft" size={16} className="rtl:rotate-180" />
            {tr.common.back}
          </button>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-[#0f172a]">
                {currentTicket.subject}
              </h1>
              <p className="text-sm text-[#64748b] mt-1">
                {isFa ? "تیکت" : "Ticket"} #{currentTicket.id.slice(0, 8)}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-semibold ${PRIORITY_COLORS[currentTicket.priority] || "bg-gray-100 text-gray-700"}`}
              >
                {PRIORITY_LABELS[currentTicket.priority]?.en || currentTicket.priority}
              </span>
              <select
                value={currentTicket.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border-0 cursor-pointer ${STATUS_COLORS[currentTicket.status] || "bg-gray-100 text-gray-700"}`}
              >
                {Object.entries(STATUS_LABELS).map(([key, val]) => (
                  <option key={key} value={key}>
                    {isFa ? val.fa : val.en}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 mb-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            <div>
              <div className="text-xs text-[#64748b] mb-1">
                {tr.adminTickets.category}
              </div>
              <span className="inline-flex px-2.5 py-1 rounded-full bg-[#1e3a5f]/10 text-[#1e3a5f] text-xs font-semibold">
                {CATEGORY_LABELS[currentTicket.category]?.en || currentTicket.category}
              </span>
            </div>
            <div>
              <div className="text-xs text-[#64748b] mb-1">
                {tr.adminTickets.priority}
              </div>
              <select
                value={currentTicket.priority}
                onChange={(e) => handlePriorityChange(e.target.value)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border-0 cursor-pointer ${PRIORITY_COLORS[currentTicket.priority] || "bg-gray-100 text-gray-700"}`}
              >
                {Object.entries(PRIORITY_LABELS).map(([key, val]) => (
                  <option key={key} value={key}>
                    {isFa ? val.fa : val.en}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <div className="text-xs text-[#64748b] mb-1">
                {tr.adminTickets.user}
              </div>
              <div className="text-sm font-semibold text-[#0f172a]">
                {currentTicket.userName}
              </div>
            </div>
            <div>
              <div className="text-xs text-[#64748b] mb-1">
                {tr.adminTickets.email}
              </div>
              <div className="text-sm font-semibold text-[#0f172a]">
                {currentTicket.userEmail}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <div className="text-xs text-[#64748b] mb-1">
                {tr.adminTickets.status}
              </div>
              <span
                className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[currentTicket.status] || "bg-gray-100 text-gray-700"}`}
              >
                {isFa
                  ? STATUS_LABELS[currentTicket.status]?.fa || currentTicket.status
                  : STATUS_LABELS[currentTicket.status]?.en || currentTicket.status}
              </span>
            </div>
            <div>
              <div className="text-xs text-[#64748b] mb-1">
                {tr.adminTickets.priority}
              </div>
              <span
                className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${PRIORITY_COLORS[currentTicket.priority] || "bg-gray-100 text-gray-700"}`}
              >
                {isFa
                  ? PRIORITY_LABELS[currentTicket.priority]?.fa || currentTicket.priority
                  : PRIORITY_LABELS[currentTicket.priority]?.en || currentTicket.priority}
              </span>
            </div>
            <div>
              <div className="text-xs text-[#64748b] mb-1">
                {tr.adminTickets.createdAt}
              </div>
              <div className="text-sm font-semibold text-[#0f172a]">
                {new Date(currentTicket.createdAt).toLocaleDateString()}
              </div>
            </div>
            <div>
              <div className="text-xs text-[#64748b] mb-1">
                {tr.adminTickets.update}
              </div>
              <div className="text-sm font-semibold text-[#0f172a]">
                {new Date(currentTicket.updatedAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <h2 className="text-lg font-bold text-[#0f172a]">
            {tr.tickets.messages}
          </h2>
          {messages.length === 0 ? (
            <div className="text-center py-8 text-[#64748b] text-sm">
              {tr.tickets.noMessages}
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.senderId === currentTicket.userId ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                      msg.senderId === currentTicket.userId
                        ? "bg-[#f2f5fa] text-[#0f172a]"
                        : "bg-[#1e3a5f] text-white"
                    }`}
                  >
                    <div className="font-semibold text-xs mb-1 opacity-70">
                      {msg.senderName}
                    </div>
                    <div>{msg.body}</div>
                    <div
                      className={`text-xs mt-1 opacity-60 ${
                        msg.senderId === currentTicket.userId ? "text-right" : "text-left"
                      }`}
                    >
                      {new Date(msg.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <form
          onSubmit={handleSendMessage}
          className="bg-white rounded-2xl border border-[#e2e8f0] p-4"
        >
          <div className="flex gap-3">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={tr.tickets.writeMessage}
              rows={2}
              className="flex-1 px-4 py-3 rounded-xl border border-[#e2e8f0] text-sm focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/20 transition-all resize-none"
            />
            <button
              type="submit"
              disabled={sending || !newMessage.trim()}
              className="px-5 py-2 rounded-xl bg-[#1e3a5f] text-white text-sm font-bold hover:bg-[#122435] transition-colors btn-press disabled:opacity-50 disabled:cursor-not-allowed self-end"
            >
              {tr.tickets.send}
            </button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0f172a]">
          {tr.adminTickets.title}
        </h1>
        <p className="text-[#64748b] mt-1">{tr.adminTickets.sub}</p>
      </div>

      {error && (
        <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-[#e2e8f0] p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isFa ? "جستجو..." : "Search tickets..."}
            className="flex-1 px-4 py-2.5 rounded-xl border border-[#e2e8f0] text-sm focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/20 transition-all"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-[#e2e8f0] text-sm focus:border-[#1e3a5f] transition-all bg-white"
          >
            <option value="">{tr.adminTickets.allTickets}</option>
            {Object.entries(STATUS_LABELS).map(([key, val]) => (
              <option key={key} value={key}>
                {isFa ? val.fa : val.en}
              </option>
            ))}
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-[#e2e8f0] text-sm focus:border-[#1e3a5f] transition-all bg-white"
          >
            <option value="">{tr.adminTickets.category}</option>
            {Object.entries(CATEGORY_LABELS).map(([key, val]) => (
              <option key={key} value={key}>
                {isFa ? val.fa : val.en}
              </option>
            ))}
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-[#e2e8f0] text-sm focus:border-[#1e3a5f] transition-all bg-white"
          >
            <option value="">{tr.adminTickets.priority}</option>
            {Object.entries(PRIORITY_LABELS).map(([key, val]) => (
              <option key={key} value={key}>
                {isFa ? val.fa : val.en}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <ListSkeleton count={4} />
      ) : tickets.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-12 text-center">
          <div className="text-4xl mb-3">🎫</div>
          <div className="font-bold text-[#0f172a] mb-1">
            {tr.adminTickets.noTickets}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets
            .filter((ticket) => {
              if (!search.trim()) return true
              const q = search.toLowerCase()
              return (
                ticket.subject.toLowerCase().includes(q) ||
                ticket.userName.toLowerCase().includes(q) ||
                ticket.userEmail.toLowerCase().includes(q)
              )
            })
            .map((ticket) => (
              <div
                key={ticket.id}
                className="bg-white rounded-2xl border border-[#e2e8f0] p-5 card-hover"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold text-sm text-[#0f172a] truncate">
                        {ticket.subject}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${PRIORITY_COLORS[ticket.priority] || "bg-gray-100 text-gray-700"}`}
                      >
                        {isFa
                          ? PRIORITY_LABELS[ticket.priority]?.fa || ticket.priority
                          : PRIORITY_LABELS[ticket.priority]?.en || ticket.priority}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${STATUS_COLORS[ticket.status] || "bg-gray-100 text-gray-700"}`}
                      >
                        {isFa
                          ? STATUS_LABELS[ticket.status]?.fa || ticket.status
                          : STATUS_LABELS[ticket.status]?.en || ticket.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[#64748b]">
                      <span className="inline-flex px-2.5 py-0.5 rounded-full bg-[#1e3a5f]/10 text-[#1e3a5f] font-semibold">
                        {CATEGORY_LABELS[ticket.category]?.en || ticket.category}
                      </span>
                      <span>{ticket.userName}</span>
                      <span className="hidden sm:inline">{ticket.userEmail}</span>
                      <span>
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleViewTicket(ticket.id)}
                    className="px-4 py-2 rounded-xl bg-[#1e3a5f] text-white text-xs font-bold hover:bg-[#122435] transition-colors btn-press flex-shrink-0"
                  >
                    {tr.adminTickets.update}
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}
