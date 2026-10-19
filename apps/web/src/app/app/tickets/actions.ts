"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { requireSessionToken } from "@/lib/session"
import {
  createTicket,
  replyToTicket,
  updateTicketStatus,
  type TicketPriority,
  type TicketStatus,
} from "@/lib/tickets"

const LIST = "/app/tickets"

function fail(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`)
}

export async function createTicketAction(formData: FormData): Promise<void> {
  const token = await requireSessionToken("/app/tickets/new")

  const subject = String(formData.get("subject") ?? "").trim()
  const description = String(formData.get("description") ?? "").trim()
  const priority = String(formData.get("priority") ?? "medium") as TicketPriority

  if (!subject) fail("/app/tickets/new", "موضوع تیکت را وارد کنید.")
  if (!description) fail("/app/tickets/new", "توضیحات را وارد کنید.")

  const result = await createTicket(token, { subject, description, priority })

  if (!result.ok) fail("/app/tickets/new", result.message)

  revalidatePath(LIST)
  redirect(`/app/tickets/${result.data.id}`)
}

export async function replyAction(formData: FormData): Promise<void> {
  const id = String(formData.get("ticketId") ?? "")
  const path = `/app/tickets/${id}`
  const token = await requireSessionToken(path)

  const body = String(formData.get("body") ?? "").trim()
  const isInternal = formData.get("is_internal") === "1"

  if (!body) fail(path, "متن پاسخ خالی است.")

  const result = await replyToTicket(token, id, body, isInternal)

  if (!result.ok) fail(path, result.message)

  revalidatePath(path)
  revalidatePath(LIST)
  redirect(`${path}?ok=${encodeURIComponent("پاسخ ثبت شد.")}`)
}

export async function statusAction(formData: FormData): Promise<void> {
  const id = String(formData.get("ticketId") ?? "")
  const path = `/app/tickets/${id}`
  const token = await requireSessionToken(path)

  const status = String(formData.get("status") ?? "") as TicketStatus

  if (!["open", "in_progress", "resolved", "closed"].includes(status)) {
    fail(path, "وضعیت نامعتبر است.")
  }

  const result = await updateTicketStatus(token, id, status)

  if (!result.ok) fail(path, result.message)

  revalidatePath(path)
  revalidatePath(LIST)
  redirect(`${path}?ok=${encodeURIComponent("وضعیت تیکت به‌روزرسانی شد.")}`)
}
