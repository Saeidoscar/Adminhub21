"use client"

import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import { Form, FormItem } from "@/components/ui/Form"
import { useState, useTransition } from "react"
import { TbCheck, TbStarFilled } from "react-icons/tb"

export type ServiceReviewValue = {
  id?: number
  rating: number
  review: string | null
}

type ReviewSubmitResult = {
  ok: boolean
  data: ServiceReviewValue | null
  error: string | null
}

type Props = {
  initialReview?: ServiceReviewValue | null
  onSubmit: (value: {
    rating: number
    review: string
  }) => Promise<ReviewSubmitResult>
  title?: string
  description?: string
}

const ServiceReviewForm = ({
  initialReview,
  onSubmit,
  title = "نظر شما درباره این خدمت",
  description = "امتیاز و تجربه خود را ثبت کنید تا کیفیت خدمات دادلاین بهتر شود.",
}: Props) => {
  const [rating, setRating] = useState(initialReview?.rating ?? 0)
  const [review, setReview] = useState(initialReview?.review ?? "")
  const [savedReview, setSavedReview] = useState(initialReview ?? null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    if (rating < 1 || rating > 5) {
      setError("لطفاً امتیاز خود را از یک تا پنج ستاره انتخاب کنید.")
      return
    }

    if (review.trim().length < 3) {
      setError("لطفاً متن دیدگاه خود را وارد کنید.")
      return
    }

    const wasSaved = Boolean(savedReview)

    startTransition(async () => {
      const result = await onSubmit({ rating, review: review.trim() })
      if (!result.ok || !result.data) {
        setError(result.error ?? "ثبت دیدگاه انجام نشد.")
        return
      }

      setSavedReview(result.data)
      setRating(result.data.rating)
      setReview(result.data.review ?? "")
      setSuccess(wasSaved ? "دیدگاه شما ویرایش شد." : "دیدگاه شما ثبت شد.")
    })
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50/70 p-4 dark:border-gray-700 dark:bg-gray-900/50">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h4 className="font-bold text-gray-900 dark:text-white">{title}</h4>
          <p className="mt-1 text-xs leading-6 text-gray-500">{description}</p>
        </div>
        {savedReview && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200">
            <TbCheck /> ثبت شده
          </span>
        )}
      </div>

      <Form className="mt-4 space-y-4" onSubmit={submit}>
        <FormItem label="امتیاز شما" asterisk>
          <div
            className="flex items-center gap-1"
            role="radiogroup"
            aria-label="امتیاز از پنج ستاره"
          >
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={rating === value}
                aria-label={`${value} ستاره`}
                className="rounded-lg p-1 text-2xl transition hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary/30"
                onClick={() => setRating(value)}
              >
                <TbStarFilled
                  className={
                    value <= rating
                      ? "text-amber-400"
                      : "text-gray-300 dark:text-gray-700"
                  }
                />
              </button>
            ))}
            {rating > 0 && (
              <span className="mr-2 text-xs font-semibold text-gray-500">
                {rating.toLocaleString("fa-IR")} از ۵
              </span>
            )}
          </div>
        </FormItem>

        <FormItem label="متن دیدگاه" asterisk>
          <Input
            textArea
            rows={4}
            value={review}
            minLength={3}
            maxLength={2000}
            placeholder="تجربه خود از پاسخ وکیل یا کارشناس را بنویسید..."
            onChange={(event) => setReview(event.target.value)}
          />
        </FormItem>

        {error && (
          <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-200">
            {error}
          </p>
        )}
        {success && (
          <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200">
            {success}
          </p>
        )}

        <div className="flex justify-end">
          <Button type="submit" size="sm" variant="solid" loading={pending}>
            {savedReview ? "ویرایش دیدگاه" : "ثبت دیدگاه"}
          </Button>
        </div>
      </Form>
    </div>
  )
}

export default ServiceReviewForm
