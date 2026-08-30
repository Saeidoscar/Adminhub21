import { useState, useEffect, useCallback } from "react"
import {
  listTickets,
  getTicket,
  createTicket,
  listTicketMessages,
  createTicketMessage,
  updateTicket,
  type Ticket,
  type TicketMessage,
} from "../lib/api"
import { ticketSchema, type TicketInput } from "../lib/validation"

export interface UseTicketsOptions {
  onTicketCreated?: (ticket: Ticket) => void
  onError?: (message: string) => void
}

export function useTickets({ onTicketCreated, onError }: UseTicketsOptions = {}) {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentTicket, setCurrentTicket] = useState<Ticket | null>(null)
  const [messages, setMessages] = useState<TicketMessage[]>([])
  const [sending, setSending] = useState(false)

  const loadTickets = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await listTickets()
      setTickets(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load tickets"
      setError(message)
      onError?.(message)
    } finally {
      setLoading(false)
    }
  }, [onError])

  const loadTicketDetail = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const [ticketData, messagesData] = await Promise.all([
        getTicket(id),
        listTicketMessages(id),
      ])
      if (ticketData) {
        setCurrentTicket(ticketData)
        setMessages(messagesData)
      } else {
        const message = "Ticket not found"
        setError(message)
        onError?.(message)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load ticket"
      setError(message)
      onError?.(message)
    } finally {
      setLoading(false)
    }
  }, [onError])

  useEffect(() => {
    loadTickets()
  }, [loadTickets])

  const createNewTicket = useCallback(async (input: TicketInput) => {
    const result = ticketSchema.safeParse(input)
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      result.error.errors.forEach((err) => {
        const key = err.path[0] as string
        if (key) fieldErrors[key] = err.message
      })
      return { success: false as const, errors: fieldErrors }
    }

    try {
      const ticket = await createTicket(result.data)
      setTickets((prev) => [ticket, ...prev])
      onTicketCreated?.(ticket)
      return { success: true as const, ticket }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create ticket"
      setError(message)
      onError?.(message)
      return { success: false as const, errors: {}, message }
    }
  }, [onTicketCreated, onError])

  const sendMessage = useCallback(async (ticketId: string, body: string) => {
    if (!ticketId || !body.trim()) return null
    setSending(true)
    try {
      const message = await createTicketMessage(ticketId, { body: body.trim() })
      setMessages((prev) => [...prev, message])
      return message
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to send message"
      setError(message)
      onError?.(message)
      return null
    } finally {
      setSending(false)
    }
  }, [onError])

  const changeStatus = useCallback(async (ticketId: string, status: string) => {
    try {
      const updated = await updateTicket(ticketId, { status: status as Ticket["status"] })
      setTickets((prev) => prev.map((t) => (t.id === ticketId ? updated : t)))
      if (currentTicket?.id === ticketId) {
        setCurrentTicket(updated)
      }
      return updated
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update ticket"
      setError(message)
      onError?.(message)
      return null
    }
  }, [currentTicket?.id, onError])

  const clearSelection = useCallback(() => {
    setCurrentTicket(null)
    setMessages([])
  }, [])

  return {
    tickets,
    loading,
    error,
    currentTicket,
    messages,
    sending,
    loadTickets,
    loadTicketDetail,
    createNewTicket,
    sendMessage,
    changeStatus,
    clearSelection,
  }
}
