"use server"

import type { Ticket, TicketMessage, TicketStatus } from "@/@types/tickets"
import { apiFormData, apiPatch } from "@/lib/apiClient"
import getServerSession from "@/server/actions/auth/getServerSession"
import { revalidatePath, revalidateTag } from "next/cache"
import {
  ticketMessageResponseSchema,
  ticketResponseSchema,
} from "./tickets.schemas"

type ActionResult<T,> = {
  ok: boolean
  data: T | null
  error: string | null
  requiresAuth: boolean
}

export async function createTicket(
  formData: FormData,
): Promise<ActionResult<Ticket>> {
  const token = await tokenOrNull()
  if (!token) return authFailure()

  const response = await apiFormData<unknown>("/tickets", formData, token)
  if (!response.ok || !response.data) return failure(response.error)

  const parsed = ticketResponseSchema.safeParse(response.data)
  if (!parsed.success) return failure("پاسخ ثبت تیکت معتبر نیست.")

  revalidateTickets(parsed.data.data.uuid)
  return success(parsed.data.data as Ticket)
}

export async function replyTicket(
  uuid: string,
  formData: FormData,
): Promise<ActionResult<TicketMessage>> {
  const token = await tokenOrNull()
  if (!token) return authFailure()

  const response = await apiFormData<unknown>(
    `/tickets/${encodeURIComponent(uuid)}/messages`,
    formData,
    token,
  )
  if (!response.ok || !response.data) return failure(response.error)

  const parsed = ticketMessageResponseSchema.safeParse(response.data)
  if (!parsed.success) return failure("پاسخ ثبت پیام معتبر نیست.")

  revalidateTickets(uuid)
  return success(parsed.data.data as TicketMessage)
}

export async function updateTicketStatus(
  uuid: string,
  status: Extract<TicketStatus, "open" | "closed">,
): Promise<ActionResult<Ticket>> {
  const token = await tokenOrNull()
  if (!token) return authFailure()

  const response = await apiPatch<unknown>(
    `/tickets/${encodeURIComponent(uuid)}/status`,
    { status },
    token,
  )
  if (!response.ok || !response.data) return failure(response.error)

  const parsed = ticketResponseSchema.safeParse(response.data)
  if (!parsed.success) return failure("پاسخ تغییر وضعیت معتبر نیست.")

  revalidateTickets(uuid)
  return success(parsed.data.data as Ticket)
}

async function tokenOrNull() {
  const session = await getServerSession()
  return session?.accessToken ?? null
}

function revalidateTickets(uuid: string) {
  revalidateTag("tickets:list", "max")
  revalidatePath("/pishkhan/tickets")
  revalidatePath(`/pishkhan/tickets/${uuid}`)
}

function success<T>(data: T): ActionResult<T> {
  return { ok: true, data, error: null, requiresAuth: false }
}

function failure<T>(error: string | null): ActionResult<T> {
  return {
    ok: false,
    data: null,
    error: error ?? "عملیات انجام نشد.",
    requiresAuth: false,
  }
}

function authFailure<T>(): ActionResult<T> {
  return {
    ok: false,
    data: null,
    error: "برای ادامه وارد شوید.",
    requiresAuth: true,
  }
}
