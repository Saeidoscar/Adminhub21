import { apiFetch, unwrapList, unwrapItem } from "./core"

export interface Ticket {
  id: string
  userId: string
  userName: string
  userEmail: string
  subject: string
  category: string
  priority: string
  status: string
  createdAt: string
  updatedAt: string
}

export interface TicketMessage {
  id: string
  ticketId: string
  senderId: string
  senderName: string
  body: string
  createdAt: string
}

export interface CreateTicketInput {
  subject: string
  category: "billing" | "technical" | "account" | "other"
  priority: "low" | "medium" | "high" | "urgent"
}

export async function createTicket(input: CreateTicketInput): Promise<Ticket> {
  const payload = await apiFetch<Record<string, unknown>>("/api/tickets", {
    method: "POST",
    body: JSON.stringify(input),
  })
  const ticket = unwrapItem<Ticket>(payload, "ticket")
  if (!ticket) {
    throw new Error("Ticket creation response was empty")
  }
  return ticket
}

export async function listTickets(): Promise<Ticket[]> {
  const payload = await apiFetch<Record<string, unknown>>("/api/tickets")
  return unwrapList<Ticket>(payload, "tickets")
}

export async function getTicket(id: string): Promise<Ticket | null> {
  const payload = await apiFetch<Record<string, unknown>>(`/api/tickets/${id}`)
  return unwrapItem<Ticket>(payload, "ticket")
}

export async function updateTicket(
  id: string,
  input: {
    status?: "open" | "in_progress" | "resolved" | "closed"
    priority?: "low" | "medium" | "high" | "urgent"
  },
): Promise<Ticket> {
  const payload = await apiFetch<Record<string, unknown>>(`/api/tickets/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  })
  const ticket = unwrapItem<Ticket>(payload, "ticket")
  if (!ticket) {
    throw new Error("Ticket update response was empty")
  }
  return ticket
}

export interface CreateTicketMessageInput {
  body: string
}

export async function createTicketMessage(
  ticketId: string,
  input: CreateTicketMessageInput,
): Promise<TicketMessage> {
  const payload = await apiFetch<Record<string, unknown>>(
    `/api/tickets/${ticketId}/messages`,
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  )
  const message = unwrapItem<TicketMessage>(payload, "message")
  if (!message) {
    throw new Error("Ticket message creation response was empty")
  }
  return message
}

export async function listTicketMessages(ticketId: string): Promise<TicketMessage[]> {
  const payload = await apiFetch<Record<string, unknown>>(
    `/api/tickets/${ticketId}/messages`,
  )
  return unwrapList<TicketMessage>(payload, "messages")
}
