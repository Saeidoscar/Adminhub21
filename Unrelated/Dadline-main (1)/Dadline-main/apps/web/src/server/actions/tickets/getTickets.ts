"use server"

import type { Ticket, TicketMeta, TicketPagination } from "@/@types/tickets"
import { apiGet } from "@/lib/apiClient"
import getServerSession from "@/server/actions/auth/getServerSession"
import {
  ticketListResponseSchema,
  ticketMetaResponseSchema,
  ticketResponseSchema,
} from "./tickets.schemas"

const fallbackTicketMeta: TicketMeta = {
  departments: [
    {
      id: 0,
      slug: "support",
      label: "واحد پشتیبانی مشتریان",
      isActive: true,
      isDefault: true,
      sortOrder: 10,
    },
    {
      id: 0,
      slug: "contracts",
      label: "واحد امور قراردادها",
      isActive: true,
      isDefault: false,
      sortOrder: 20,
    },
    {
      id: 0,
      slug: "finance",
      label: "واحد امور مالی",
      isActive: true,
      isDefault: false,
      sortOrder: 30,
    },
    {
      id: 0,
      slug: "consultations",
      label: "واحد امور مشاوره‌ها",
      isActive: true,
      isDefault: false,
      sortOrder: 40,
    },
    {
      id: 0,
      slug: "legal",
      label: "واحد درخواست‌های حقوقی",
      isActive: true,
      isDefault: false,
      sortOrder: 50,
    },
    {
      id: 0,
      slug: "judiciary",
      label: "واحد درخواست‌های قضایی",
      isActive: true,
      isDefault: false,
      sortOrder: 60,
    },
    {
      id: 0,
      slug: "technical",
      label: "واحد پشتیبانی فنی",
      isActive: true,
      isDefault: false,
      sortOrder: 70,
    },
    {
      id: 0,
      slug: "identity",
      label: "واحد احراز هویت و حساب کاربری",
      isActive: true,
      isDefault: false,
      sortOrder: 80,
    },
    {
      id: 0,
      slug: "providers",
      label: "واحد امور وکلا و کارشناسان",
      isActive: true,
      isDefault: false,
      sortOrder: 90,
    },
    {
      id: 0,
      slug: "complaints",
      label: "واحد رسیدگی و شکایات",
      isActive: true,
      isDefault: false,
      sortOrder: 100,
    },
  ],
  priorities: { low: "کم", normal: "عادی", high: "زیاد", urgent: "فوری" },
  statuses: {
    open: "باز و در انتظار بررسی",
    answered: "پاسخ داده‌شده",
    referred: "ارجاع‌شده",
    pending: "در انتظار پاسخ پشتیبانی",
    closed: "بسته‌شده",
  },
  defaults: { priority: "normal", department: "support" },
}

type TicketListParams = {
  q?: string
  status?: string
  priority?: string
  department?: string
  page?: number
  perPage?: number
}

export async function getTickets(
  params: TicketListParams = {},
): Promise<{
  items: Ticket[]
  pagination: TicketPagination
  error: string | null
  status: number
}> {
  const session = await getServerSession()
  if (!session?.accessToken)
    return listFailure("برای مشاهده تیکت‌ها وارد شوید.", 401)

  const query = new URLSearchParams()
  if (params.q) query.set("q", params.q)
  if (params.status && params.status !== "all")
    query.set("status", params.status)
  if (params.priority && params.priority !== "all")
    query.set("priority", params.priority)
  if (params.department && params.department !== "all")
    query.set("department", params.department)
  query.set("page", String(params.page ?? 1))
  query.set("per_page", String(params.perPage ?? 15))

  const response = await apiGet<unknown>(
    `/tickets?${query}`,
    session.accessToken,
    {
      revalidate: false,
      tags: ["tickets:list"],
    },
  )
  if (!response.ok || !response.data)
    return listFailure(response.error, response.status)

  const parsed = ticketListResponseSchema.safeParse(response.data)
  if (!parsed.success) return listFailure("پاسخ فهرست تیکت‌ها معتبر نیست.", 422)

  return {
    items: parsed.data.data as Ticket[],
    pagination: {
      currentPage: parsed.data.meta.current_page,
      lastPage: parsed.data.meta.last_page,
      perPage: parsed.data.meta.per_page,
      total: parsed.data.meta.total,
    },
    error: null,
    status: response.status,
  }
}

export async function getTicket(
  uuid: string,
): Promise<{
  ticket: Ticket | null
  error: string | null
  status: number
}> {
  const session = await getServerSession()
  if (!session?.accessToken)
    return { ticket: null, error: "برای مشاهده تیکت وارد شوید.", status: 401 }

  const response = await apiGet<unknown>(
    `/tickets/${encodeURIComponent(uuid)}`,
    session.accessToken,
    {
      revalidate: false,
      noStore: true,
    },
  )
  if (!response.ok || !response.data)
    return { ticket: null, error: response.error, status: response.status }

  const parsed = ticketResponseSchema.safeParse(response.data)
  if (!parsed.success)
    return { ticket: null, error: "پاسخ تیکت معتبر نیست.", status: 422 }

  return {
    ticket: parsed.data.data as Ticket,
    error: null,
    status: response.status,
  }
}

export async function getTicketMeta(): Promise<{
  meta: TicketMeta | null
  error: string | null
  status: number
}> {
  const session = await getServerSession()
  if (!session?.accessToken)
    return { meta: null, error: "برای ثبت تیکت وارد شوید.", status: 401 }

  const response = await apiGet<unknown>("/tickets/meta", session.accessToken, {
    revalidate: false,
    tags: ["tickets:meta"],
  })

  if (response.status === 401) {
    return { meta: null, error: response.error, status: response.status }
  }

  if (!response.ok || !response.data) {
    return {
      meta: fallbackTicketMeta,
      error: response.error ?? "دریافت تنظیمات تیکت با خطا مواجه شد.",
      status: response.status,
    }
  }

  const parsed = ticketMetaResponseSchema.safeParse(response.data)
  if (!parsed.success) {
    return {
      meta: fallbackTicketMeta,
      error: "پاسخ تنظیمات تیکت معتبر نیست.",
      status: 422,
    }
  }

  return {
    meta: parsed.data.data as TicketMeta,
    error: null,
    status: response.status,
  }
}

function listFailure(error: string | null, status: number) {
  return {
    items: [],
    pagination: { currentPage: 1, lastPage: 1, perPage: 15, total: 0 },
    error,
    status,
  }
}
