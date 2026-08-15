"use server"

import type {
  ContentKind,
  ContentReactionState,
  ReactionType,
} from "@/@types/content"
import { apiPost } from "@/lib/apiClient"
import getServerSession from "@/server/actions/auth/getServerSession"
import { revalidatePath, revalidateTag } from "next/cache"
import {
  contentReactionResponseSchema,
  submittedCommentResponseSchema,
} from "./content.schemas"

type MutationResult<T,> = {
  ok: boolean
  data: T | null
  error: string | null
  requiresAuth: boolean
}

const resourcePath = (kind: ContentKind) =>
  kind === "story" ? "stories" : "blogs"

export async function setContentReaction(
  kind: ContentKind,
  slug: string,
  reaction: ReactionType,
): Promise<MutationResult<ContentReactionState>> {
  const session = await getServerSession()
  if (!session?.accessToken) return authRequired()

  const response = await apiPost<unknown>(
    `/${resourcePath(kind)}/${encodeURIComponent(slug)}/reaction`,
    { reaction },
    session.accessToken,
  )
  if (!response.ok || !response.data) return failure(response.error)

  const parsed = contentReactionResponseSchema.safeParse(response.data)
  if (!parsed.success) return failure("پاسخ واکنش از سرور معتبر نیست.")

  revalidateContent(kind, slug)
  return {
    ok: true,
    data: parsed.data.data,
    error: null,
    requiresAuth: false,
  }
}

export async function submitContentComment(
  kind: ContentKind,
  slug: string,
  content: string,
  parentPublicId?: string,
): Promise<MutationResult<{ message: string }>> {
  const session = await getServerSession()
  if (!session?.accessToken) return authRequired()

  const normalizedContent = content.trim()
  if (normalizedContent.length < 2 || normalizedContent.length > 5000) {
    return failure("متن دیدگاه باید بین ۲ تا ۵۰۰۰ نویسه باشد.")
  }

  const response = await apiPost<unknown>(
    `/${resourcePath(kind)}/${encodeURIComponent(slug)}/comments`,
    {
      content: normalizedContent,
      ...(parentPublicId ? { parent_public_id: parentPublicId } : {}),
    },
    session.accessToken,
  )
  if (!response.ok || !response.data) return failure(response.error)

  const parsed = submittedCommentResponseSchema.safeParse(response.data)
  if (!parsed.success) return failure("پاسخ ثبت دیدگاه از سرور معتبر نیست.")

  revalidateContent(kind, slug)
  return {
    ok: true,
    data: { message: "دیدگاه شما ثبت شد و پس از تأیید نمایش داده می‌شود." },
    error: null,
    requiresAuth: false,
  }
}

function revalidateContent(kind: ContentKind, slug: string) {
  revalidatePath(`/${kind}/${slug}`)
  revalidatePath(`/${kind}`)
  revalidateTag(`content:${kind}:${slug}`, "max")
  revalidateTag(`content:${kind}:list`, "max")
  revalidateTag(`content:${kind}:stats`, "max")
  revalidateTag(`content:${kind}:${slug}:comments`, "max")
}

function authRequired<T>(): MutationResult<T> {
  return {
    ok: false,
    data: null,
    error: "برای انجام این کار ابتدا وارد حساب شوید.",
    requiresAuth: true,
  }
}

function failure<T>(error: string | null): MutationResult<T> {
  return {
    ok: false,
    data: null,
    error: error ?? "انجام عملیات با خطا مواجه شد.",
    requiresAuth: false,
  }
}
