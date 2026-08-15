"use server"

import type {
  DashboardQuestion,
  DashboardQuestionMeta,
  DashboardQuestionPagination,
} from "@/@types/dashboardQuestions"
import { apiGet } from "@/lib/apiClient"
import getServerSession from "@/server/actions/auth/getServerSession"
import {
  dashboardQuestionItemResponseSchema,
  dashboardQuestionListResponseSchema,
  dashboardQuestionMetaResponseSchema,
} from "./dashboardQuestions.schemas"

const emptyPagination: DashboardQuestionPagination = {
  currentPage: 1,
  lastPage: 1,
  perPage: 12,
  total: 0,
}

export async function getDashboardQuestions(
  page = 1,
): Promise<{
  questions: DashboardQuestion[]
  pagination: DashboardQuestionPagination
  error: string | null
  status: number
}> {
  const token = await tokenOrNull()
  if (!token)
    return {
      questions: [],
      pagination: emptyPagination,
      error: "برای ادامه وارد شوید.",
      status: 401,
    }

  const response = await apiGet<unknown>(
    `/questions/me?page=${page}&per_page=12`,
    token,
    { revalidate: false, noStore: true },
  )
  if (!response.ok || !response.data) {
    return {
      questions: [],
      pagination: emptyPagination,
      error: response.error,
      status: response.status,
    }
  }

  const parsed = dashboardQuestionListResponseSchema.safeParse(response.data)
  if (!parsed.success) {
    return {
      questions: [],
      pagination: emptyPagination,
      error: "پاسخ فهرست پرسش‌ها معتبر نیست.",
      status: 422,
    }
  }

  return {
    questions: parsed.data.data as DashboardQuestion[],
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

export async function getDashboardQuestionMeta(): Promise<{
  meta: DashboardQuestionMeta | null
  error: string | null
  status: number
}> {
  const token = await tokenOrNull()
  if (!token) return { meta: null, error: "برای ادامه وارد شوید.", status: 401 }

  const response = await apiGet<unknown>("/questions/meta", token, {
    revalidate: false,
    noStore: true,
  })
  if (!response.ok || !response.data) {
    return { meta: null, error: response.error, status: response.status }
  }

  const parsed = dashboardQuestionMetaResponseSchema.safeParse(response.data)
  if (!parsed.success) {
    return {
      meta: null,
      error: "پاسخ تنظیمات پرسش حقوقی معتبر نیست.",
      status: 422,
    }
  }

  return {
    meta: parsed.data.data as DashboardQuestionMeta,
    error: null,
    status: response.status,
  }
}

export async function getDashboardQuestion(
  uuid: string,
): Promise<{
  question: DashboardQuestion | null
  error: string | null
  status: number
}> {
  const token = await tokenOrNull()
  if (!token)
    return { question: null, error: "برای ادامه وارد شوید.", status: 401 }

  const response = await apiGet<unknown>(
    `/questions/me/${encodeURIComponent(uuid)}`,
    token,
    { revalidate: false, noStore: true },
  )
  if (!response.ok || !response.data) {
    return { question: null, error: response.error, status: response.status }
  }

  const parsed = dashboardQuestionItemResponseSchema.safeParse(response.data)
  if (!parsed.success) {
    return { question: null, error: "پاسخ پرسش حقوقی معتبر نیست.", status: 422 }
  }

  return {
    question: parsed.data.data as DashboardQuestion,
    error: null,
    status: response.status,
  }
}

async function tokenOrNull() {
  const session = await getServerSession()
  return session?.accessToken ?? null
}
