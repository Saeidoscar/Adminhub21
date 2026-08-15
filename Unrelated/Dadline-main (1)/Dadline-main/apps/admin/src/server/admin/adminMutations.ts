"use server"

import { adminApiFormData, adminApiPatch } from "@/lib/adminApi"
import { getAdminAuthContext } from "@/lib/adminSession"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import {
  adminTicketDepartmentSchema,
  adminTicketMessageResponseSchema,
  adminTicketResponseSchema,
} from "./admin.schemas"
import type {
  AdminTicket,
  AdminTicketDepartment,
  AdminTicketMessage,
} from "./admin.schemas"

type Result<T> = { ok: boolean data: T | null error: string | null }

export const updateAdminTicket = async (
  uuid: string,
  payload: Record<string, string | number | null>,
): Promise<Result<AdminTicket>> => {
  const context = await getAdminAuthContext()
  if (!context) return failure("دسترسی مدیریتی معتبر نیست.")

  const response = await adminApiPatch<unknown>(
    `/admin/tickets/${encodeURIComponent(uuid)}`,
    payload,
    context.accessToken,
  )
  if (!response.ok || !response.data) return failure(response.error)

  const parsed = adminTicketResponseSchema.safeParse(response.data)
  if (!parsed.success) return failure("پاسخ تغییر تیکت معتبر نیست.")
  revalidateTickets(uuid)
  return success(parsed.data.data)
}

export const replyAdminTicket = async (
  uuid: string,
  formData: FormData,
): Promise<Result<AdminTicketMessage>> => {
  const context = await getAdminAuthContext()
  if (!context) return failure("دسترسی مدیریتی معتبر نیست.")

  const response = await adminApiFormData<unknown>(
    `/admin/tickets/${encodeURIComponent(uuid)}/messages`,
    formData,
    context.accessToken,
  )
  if (!response.ok || !response.data) return failure(response.error)

  const parsed = adminTicketMessageResponseSchema.safeParse(response.data)
  if (!parsed.success) return failure("پاسخ ثبت پیام معتبر نیست.")
  revalidateTickets(uuid)
  return success(parsed.data.data)
}

export const updateAdminTicketDepartment = async (
  id: number,
  payload: {
    is_active: boolean
    is_default: boolean
    sort_order: number
    supporter_ids: number[]
  },
): Promise<Result<AdminTicketDepartment>> => {
  const context = await getAdminAuthContext()
  if (!context) return failure("دسترسی مدیریتی معتبر نیست.")

  const response = await adminApiPatch<unknown>(
    `/admin/ticket-departments/${id}`,
    payload,
    context.accessToken,
  )
  if (!response.ok || !response.data) return failure(response.error)

  const parsed = zDepartmentResponse.safeParse(response.data)
  if (!parsed.success) return failure("پاسخ تغییر دپارتمان معتبر نیست.")
  revalidatePath("/tickets")
  revalidatePath("/tickets/departments")
  return success(parsed.data.data)
}

const zDepartmentResponse = z.object({ data: adminTicketDepartmentSchema })

const revalidateTickets = (uuid: string) => {
  revalidatePath("/tickets")
  revalidatePath(`/tickets/${uuid}`)
  revalidatePath("/operations")
}

const success = <T>(data: T): Result<T> => ({ ok: true, data, error: null })
const failure = <T>(error: string | null): Result<T> => ({
  ok: false,
  data: null,
  error: error ?? "عملیات انجام نشد.",
})
