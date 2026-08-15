"use server"

import type { Question } from "@/@types/questions"
import { apiGet } from "@/lib/apiClient"
import {
  questionItemResponseSchema,
  questionListResponseSchema,
} from "./questions.schemas"

export type QuestionsSearchParams = {
  search?: string
  category?: string
  page?: string
}

export type QuestionsPagination = {
  current_page: number
  last_page: number
  total: number
  per_page: number
}

export type GetQuestionsResult = {
  questions: Question[]
  pagination: QuestionsPagination
  error: string | null
}

const EMPTY_PAGINATION: QuestionsPagination = {
  current_page: 1,
  last_page: 1,
  total: 0,
  per_page: 0,
}

const parseError = "پاسخ دریافتی از سرور معتبر نیست."

export async function getQuestions(params?: {
  search?: string
  category?: string
  page?: number
  per_page?: number
}): Promise<GetQuestionsResult> {
  const query = new URLSearchParams()

  if (params?.search) query.set("search", params.search)
  if (params?.category) query.set("category", params.category)
  if (params?.page) query.set("page", String(params.page))
  if (params?.per_page) query.set("per_page", String(params.per_page))

  const response = await apiGet<unknown>(
    `/questions?${query.toString()}`,
    undefined,
    {
      revalidate: 300,
      tags: ["questions:list"],
    },
  )

  if (!response.ok || !response.data) {
    return {
      questions: [],
      pagination: EMPTY_PAGINATION,
      error: response.error ?? "دریافت پرسش‌های حقوقی با خطا مواجه شد.",
    }
  }

  const parsed = questionListResponseSchema.safeParse(response.data)
  if (!parsed.success) {
    return {
      questions: [],
      pagination: EMPTY_PAGINATION,
      error: parseError,
    }
  }

  return {
    questions: parsed.data.data as Question[],
    pagination: parsed.data.meta,
    error: null,
  }
}

export async function getQuestion(
  slug: string,
): Promise<{
  question: Question | null
  notFound: boolean
  error: string | null
}> {
  const normalizedSlug = normalizeSlug(slug)
  const response = await apiGet<unknown>(
    `/questions/${encodeURIComponent(normalizedSlug)}`,
    undefined,
    {
      revalidate: 300,
      tags: [`questions:${normalizedSlug}`],
    },
  )

  if (response.status === 404) {
    return { question: null, notFound: true, error: null }
  }

  if (!response.ok || !response.data) {
    return {
      question: null,
      notFound: false,
      error: response.error ?? "دریافت این پرسش با خطا مواجه شد.",
    }
  }

  const parsed = questionItemResponseSchema.safeParse(response.data)
  if (!parsed.success) {
    return { question: null, notFound: false, error: parseError }
  }

  return {
    question: parsed.data.data as Question,
    notFound: false,
    error: null,
  }
}

function normalizeSlug(slug: string): string {
  try {
    return decodeURIComponent(slug)
  } catch {
    return slug
  }
}
