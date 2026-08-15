"use server"

import { adminApiGet } from "@/lib/adminApi"
import { getAdminAuthContext } from "@/lib/adminSession"
import {
  dashboardResponseSchema,
  financialsResponseSchema,
  operationsResponseSchema,
  optionsResponseSchema,
  transactionsResponseSchema,
  usersResponseSchema,
  adminTicketDepartmentsResponseSchema,
  adminTicketMetaResponseSchema,
  adminTicketResponseSchema,
  adminTicketsResponseSchema,
} from "./admin.schemas"
import type { z } from "zod"

type AdminResult<T,> = {
  data: T | null
  error: string | null
  status: number
}

const load = async <T,>(
  path: string,
  schema: z.ZodType<T>,
): Promise<AdminResult<T>> => {
  const context = await getAdminAuthContext()
  if (!context) {
    return { data: null, error: "دسترسی مدیریتی معتبر نیست.", status: 401 }
  }

  const response = await adminApiGet<unknown>(path, context.accessToken)
  if (!response.ok || !response.data) {
    return { data: null, error: response.error, status: response.status }
  }

  const parsed = schema.safeParse(response.data)
  if (!parsed.success) {
    return { data: null, error: "ساختار پاسخ سرور معتبر نیست.", status: 422 }
  }

  return { data: parsed.data, error: null, status: response.status }
}

export const getAdminDashboard = async () => {
  const result = await load("/admin/dashboard", dashboardResponseSchema)
  return { ...result, data: result.data?.data ?? null }
}

export const getAdminUsers = async (query = "") =>
  await load(`/admin/users${query ? `?${query}` : ""}`, usersResponseSchema)

export const getAdminTransactions = async (query = "") =>
  await load(
    `/admin/wallet-transactions${query ? `?${query}` : ""}`,
    transactionsResponseSchema,
  )

export const getAdminFinancials = async (query = "") =>
  await load(
    `/admin/financials${query ? `?${query}` : ""}`,
    financialsResponseSchema,
  )

export const getAdminOperations = async () => {
  const result = await load("/admin/operations", operationsResponseSchema)
  return { ...result, data: result.data?.data ?? null }
}

export const getAdminOptions = async (query = "") =>
  await load(`/admin/options${query ? `?${query}` : ""}`, optionsResponseSchema)

export const getAdminTickets = async (query = "") =>
  await load(
    `/admin/tickets${query ? `?${query}` : ""}`,
    adminTicketsResponseSchema,
  )

export const getAdminTicket = async (uuid: string) =>
  await load(
    `/admin/tickets/${encodeURIComponent(uuid)}`,
    adminTicketResponseSchema,
  )

export const getAdminTicketMeta = async () => {
  const result = await load(
    "/admin/tickets/meta",
    adminTicketMetaResponseSchema,
  )
  return { ...result, data: result.data?.data ?? null }
}

export const getAdminTicketDepartments = async () =>
  await load("/admin/ticket-departments", adminTicketDepartmentsResponseSchema)
