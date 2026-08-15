"use client"

import type {
  ContentKind,
  ContentReactionState,
  ReactionType,
} from "@/@types/content"
import { REDIRECT_URL_KEY } from "@/constants/app.constant"
import {
  setContentReaction,
  submitContentComment,
} from "@/server/actions/content/mutateContent"
import { useRouter } from "next/navigation"
import { FormEvent, useState, useTransition } from "react"
import { TbMessageCircle, TbSend, TbThumbDown, TbThumbUp } from "react-icons/tb"
import { formatNumber } from "./content.utils"

type Props = {
  kind: ContentKind
  slug: string
  initialReaction: ContentReactionState
}

export default function ContentInteractions({
  kind,
  slug,
  initialReaction,
}: Props) {
  const router = useRouter()
  const [reaction, setReaction] = useState(initialReaction)
  const [comment, setComment] = useState("")
  const [notice, setNotice] = useState<{
    type: "success" | "error"
    message: string
  } | null>(null)
  const [isReacting, startReaction] = useTransition()
  const [isCommenting, startComment] = useTransition()

  const requireSignIn = () => {
    const callbackUrl = `${window.location.pathname}${window.location.search}`
    router.push(
      `/sign-in?${REDIRECT_URL_KEY}=${encodeURIComponent(callbackUrl)}`,
    )
  }

  const react = (type: ReactionType) => {
    setNotice(null)
    startReaction(async () => {
      const result = await setContentReaction(kind, slug, type)
      if (result.requiresAuth) return requireSignIn()
      if (!result.ok || !result.data) {
        setNotice({
          type: "error",
          message: result.error ?? "ثبت واکنش انجام نشد.",
        })
        return
      }
      setReaction(result.data)
    })
  }

  const submitComment = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setNotice(null)
    startComment(async () => {
      const result = await submitContentComment(kind, slug, comment)
      if (result.requiresAuth) return requireSignIn()
      if (!result.ok || !result.data) {
        setNotice({
          type: "error",
          message: result.error ?? "ثبت دیدگاه انجام نشد.",
        })
        return
      }
      setComment("")
      setNotice({ type: "success", message: result.data.message })
    })
  }

  return (
    <section
      className="mt-8 space-y-6 border-t border-gray-200 pt-8 dark:border-gray-800"
      aria-labelledby="content-feedback-title"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-gray-50 p-4 dark:bg-gray-950/70">
        <div>
          <h4 id="content-feedback-title" className="font-bold">
            این نوشته برایتان مفید بود؟
          </h4>
          <p className="mt-1 text-xs text-gray-500">
            نظر شما به بهترشدن محتوای دادلاین کمک می‌کند.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={isReacting}
            aria-pressed={reaction.reaction === "like"}
            onClick={() => react("like")}
            className={`inline-flex h-10 items-center gap-2 rounded-xl border px-3 text-sm transition disabled:opacity-60 ${
              reaction.reaction === "like"
                ? "border-green-600 bg-green-600 text-white"
                : "border-gray-200 bg-white text-gray-700 hover:border-green-500 hover:text-green-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
            }`}
          >
            <TbThumbUp size={18} /> {formatNumber(reaction.likesCount)}
          </button>
          <button
            type="button"
            disabled={isReacting}
            aria-pressed={reaction.reaction === "dislike"}
            onClick={() => react("dislike")}
            className={`inline-flex h-10 items-center gap-2 rounded-xl border px-3 text-sm transition disabled:opacity-60 ${
              reaction.reaction === "dislike"
                ? "border-red-600 bg-red-600 text-white"
                : "border-gray-200 bg-white text-gray-700 hover:border-red-500 hover:text-red-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
            }`}
          >
            <TbThumbDown size={18} /> {formatNumber(reaction.dislikesCount)}
          </button>
        </div>
      </div>

      <form
        onSubmit={submitComment}
        className="rounded-2xl border border-gray-200 p-5 dark:border-gray-800"
      >
        <label
          htmlFor="content-comment"
          className="flex items-center gap-2 font-bold"
        >
          <TbMessageCircle className="text-primary" /> دیدگاه شما
        </label>
        <textarea
          id="content-comment"
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          minLength={2}
          maxLength={5000}
          required
          rows={5}
          placeholder="دیدگاه یا تجربه مرتبط خود را بنویسید..."
          className="mt-3 w-full resize-y rounded-xl border border-gray-200 bg-white p-3 text-sm leading-7 outline-none transition focus:border-primary dark:border-gray-700 dark:bg-gray-950"
        />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-gray-500">
            دیدگاه پس از بررسی منتشر می‌شود.
          </span>
          <button
            disabled={isCommenting}
            type="submit"
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
          >
            <TbSend />
            {isCommenting ? "در حال ثبت..." : "ثبت دیدگاه"}
          </button>
        </div>
      </form>

      {notice && (
        <p
          role="status"
          className={`rounded-xl border p-3 text-sm ${
            notice.type === "success"
              ? "border-green-200 bg-green-50 text-green-700 dark:border-green-900/50 dark:bg-green-950/30 dark:text-green-300"
              : "border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300"
          }`}
        >
          {notice.message}
        </p>
      )}
    </section>
  )
}
