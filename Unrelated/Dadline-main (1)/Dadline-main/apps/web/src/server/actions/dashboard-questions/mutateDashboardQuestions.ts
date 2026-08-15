"use server"

import type {
  DashboardQuestion,
  DashboardQuestionReview,
} from "@/@types/dashboardQuestions"
import { apiPost } from "@/lib/apiClient"
import getServerSession from "@/server/actions/auth/getServerSession"
import { revalidatePath, revalidateTag } from "next/cache"
import {
  dashboardQuestionItemResponseSchema,
  dashboardQuestionReviewResponseSchema,
} from "./dashboardQuestions.schemas"

type ActionResult<T,> = {
  ok: boolean
  data: T | null
  error: string | null
  requiresAuth: boolean
}

export async function createDashboardQuestion(input: {
  title: string
  categoryId: number
  body: string
  isPrivate: boolean
}): Promise<ActionResult<DashboardQuestion>> {
  const token = await tokenOrNull()
  if (!token) return authFailure()

  const response = await apiPost<unknown>(
    "/questions",
    {
      title: input.title,
      category_id: input.categoryId,
      body: input.body,
      is_private: input.isPrivate,
    },
    token,
  )
  if (!response.ok || !response.data) return failure(response.error)

  const parsed = dashboardQuestionItemResponseSchema.safeParse(response.data)
  if (!parsed.success) return failure("پاسخ ثبت پرسش معتبر نیست.")

  revalidateQuestions(parsed.data.data.uuid, parsed.data.data.slug)
  return success(parsed.data.data as DashboardQuestion)
}

export async function reviewDashboardQuestionAnswer(
  questionUuid: string,
  answerId: number,
  input: { rating: number review: string },
): Promise<ActionResult<DashboardQuestionReview>> {
  const token = await tokenOrNull()
  if (!token) return authFailure()

  const response = await apiPost<unknown>(
    `/questions/me/${encodeURIComponent(questionUuid)}/answers/${answerId}/review`,
    { rate: input.rating, review: input.review || null },
    token,
  )
  if (!response.ok || !response.data) return failure(response.error)

  const parsed = dashboardQuestionReviewResponseSchema.safeParse(response.data)
  if (!parsed.success) return failure("پاسخ ثبت دیدگاه معتبر نیست.")

  revalidateQuestions(questionUuid, null)
  return success(parsed.data.data as DashboardQuestionReview)
}

async function tokenOrNull() {
  const session = await getServerSession()
  return session?.accessToken ?? null
}

function revalidateQuestions(uuid: string, slug: string | null) {
  revalidateTag("questions:list", "max")
  revalidatePath("/pishkhan/questions")
  revalidatePath(`/pishkhan/questions/${uuid}`)
  if (slug) {
    revalidatePath(`/questions/${slug}`)
    revalidatePath("/sitemaps/questions.xml")
  }
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
