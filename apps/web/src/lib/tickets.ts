import { apiRequest, type ApiResult } from "@/lib/session"

export type TicketStatus = "open" | "in_progress" | "resolved" | "closed"
export type TicketPriority = "low" | "medium" | "high" | "urgent"

export type TicketMessage = {
  id: number
  ticket_id: number
  user_id: number
  body: string
  is_internal: boolean
  created_at: string
  user?: { id: number; name: string } | null
}

export type TicketRow = {
  id: number
  user_id: number
  assigned_to: number | null
  subject: string
  description: string
  priority: TicketPriority
  status: TicketStatus
  resolved_at: string | null
  last_message_at?: string | null
  created_at: string
  updated_at: string
  user?: { id: number; name: string } | null
  /** The API exposes the relation as `assignee` so it cannot shadow assigned_to. */
  assignee?: { id: number; name: string } | null
  messages?: TicketMessage[]
}

export type TicketPage = {
  data: TicketRow[]
  current_page: number
  last_page: number
  total: number
  per_page: number
}

export const STATUS_META: Record<TicketStatus, { label: string; className: string }> = {
  open: { label: "باز", className: "bg-sky/15 text-sky" },
  in_progress: { label: "در حال بررسی", className: "bg-amber/15 text-amber" },
  resolved: { label: "حل‌شده", className: "bg-emerald/15 text-emerald" },
  closed: { label: "بسته", className: "bg-subtle text-muted" },
}

export const PRIORITY_META: Record<TicketPriority, { label: string; className: string }> = {
  low: { label: "کم", className: "bg-subtle text-muted" },
  medium: { label: "معمولی", className: "bg-sky/15 text-sky" },
  high: { label: "زیاد", className: "bg-amber/15 text-amber" },
  urgent: { label: "فوری", className: "bg-rose/15 text-rose" },
}

export function statusMeta(status: string) {
  return STATUS_META[status as TicketStatus] ?? { label: status, className: "bg-subtle text-muted" }
}

export function priorityMeta(priority: string) {
  return (
    PRIORITY_META[priority as TicketPriority] ?? {
      label: priority,
      className: "bg-subtle text-muted",
    }
  )
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"

  return new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium", timeStyle: "short" }).format(date)
}

export function listTickets(
  token: string,
  query: { status?: string; page?: string } = {},
): Promise<ApiResult<TicketPage>> {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value) params.set(key, value)
  }
  const suffix = params.toString()

  return apiRequest<TicketPage>(token, `/api/v1/tickets${suffix ? `?${suffix}` : ""}`)
}

export function getTicket(token: string, id: string): Promise<ApiResult<TicketRow>> {
  return apiRequest<TicketRow>(token, `/api/v1/tickets/${encodeURIComponent(id)}`)
}

export function createTicket(
  token: string,
  input: { subject: string; description: string; priority: TicketPriority },
): Promise<ApiResult<TicketRow>> {
  return apiRequest<TicketRow>(token, "/api/v1/tickets", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export function replyToTicket(
  token: string,
  id: string,
  body: string,
  isInternal = false,
): Promise<ApiResult<TicketMessage>> {
  return apiRequest<TicketMessage>(token, `/api/v1/tickets/${encodeURIComponent(id)}/reply`, {
    method: "POST",
    // Non-staff requests must not send `is_internal` at all: the API rejects
    // the field for them rather than silently ignoring it.
    body: JSON.stringify(isInternal ? { body, is_internal: true } : { body }),
  })
}

export function updateTicketStatus(
  token: string,
  id: string,
  status: TicketStatus,
): Promise<ApiResult<TicketRow>> {
  return apiRequest<TicketRow>(token, `/api/v1/tickets/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  })
}
