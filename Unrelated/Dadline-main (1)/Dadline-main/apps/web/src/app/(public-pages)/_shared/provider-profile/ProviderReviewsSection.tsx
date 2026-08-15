"use client"

import { useState } from "react"
import { TbChevronDown, TbQuote } from "react-icons/tb"
import type {
  PublicReview,
  ReviewsPagination,
  ReviewsStats,
} from "@/@types/reviews"
import {
  ProfileEmptyState,
  ProfileSectionHeading,
  ProviderStarRating,
} from "./ProviderProfilePrimitives"

type ProviderReviewsSectionProps = {
  vendorSlug: string
  reviews: PublicReview[]
  pagination: ReviewsPagination
  stats: ReviewsStats
  providerName: string
}

export const ProviderReviewsSection = ({
  vendorSlug,
  reviews,
  pagination,
  stats,
  providerName,
}: ProviderReviewsSectionProps) => {
  const [visibleReviews, setVisibleReviews] = useState(reviews)
  const [currentPage, setCurrentPage] = useState(pagination.currentPage)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null)

  const reviewsCount = stats.total
  const average = stats.total > 0 ? stats.average : null
  const serviceRatings = stats.breakdown
  const hasMoreReviews = currentPage < pagination.lastPage
  const hiddenReviews = Math.max(0, reviewsCount - visibleReviews.length)

  const loadMoreReviews = async () => {
    if (isLoadingMore || !hasMoreReviews) return

    setIsLoadingMore(true)
    setLoadMoreError(null)

    try {
      const nextPage = currentPage + 1
      const params = new URLSearchParams({
        vendor: vendorSlug,
        page: String(nextPage),
        per_page: "9",
      })
      const response = await fetch(`/api/reviews?${params.toString()}`)
      const payload = await response.json().catch(() => null)

      if (!response.ok || !payload?.data) {
        throw new Error(
          payload?.error ?? "دریافت دیدگاه‌های بیشتر با خطا مواجه شد.",
        )
      }

      setVisibleReviews((current) => [
        ...current,
        ...payload.data as PublicReview[],
      ])
      setCurrentPage(payload.meta?.current_page ?? nextPage)
    } catch (error) {
      setLoadMoreError(
        error instanceof Error
          ? error.message
          : "دریافت دیدگاه‌های بیشتر با خطا مواجه شد.",
      )
    } finally {
      setIsLoadingMore(false)
    }
  }

  return (
    <section
      id="reviews"
      className="border-y border-gray-200 bg-gray-50/70 py-12 dark:border-gray-800 dark:bg-gray-950/40 sm:py-16 lg:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
        <ProfileSectionHeading
          eyebrow="REVIEWS"
          title="تجربه مراجعان"
          description={`دیدگاه مراجعانی که از خدمات حقوقی ${providerName} استفاده کرده‌اند.`}
        />

        {average !== null && (
          <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white/80 dark:border-gray-800 dark:bg-gray-900/70">
            <div className="flex flex-col lg:flex-row lg:items-stretch">
              <div className="flex shrink-0 items-center gap-4 border-b border-gray-200 px-5 py-4 lg:min-w-[220px] lg:border-b-0 lg:border-l dark:border-gray-800">
                <strong className="text-3xl font-black tracking-tight text-gray-950 dark:text-white">
                  {average.toLocaleString("fa-IR", {
                    maximumFractionDigits: 1,
                  })}
                </strong>

                <div>
                  <ProviderStarRating rating={average} size={14} />

                  <p className="mt-1.5 text-[11px] text-gray-500 dark:text-gray-400">
                    میانگین از {reviewsCount.toLocaleString("fa-IR")} دیدگاه
                  </p>
                </div>
              </div>

              <ServiceRatingsSummary serviceRatings={serviceRatings} />
            </div>
          </div>
        )}

        <div className="mt-8">
          {reviewsCount > 0 ? (
            <>
              <div className="columns-1 gap-3 sm:columns-2 lg:columns-3">
                {visibleReviews.map((review) => (
                  <article
                    key={review.id}
                    className="mb-3 inline-block w-full break-inside-avoid rounded-2xl border border-gray-200 bg-white p-4 transition duration-200 hover:border-primary/30 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-primary/40"
                  >
                    <header className="flex items-center justify-between gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500">
                        <TbQuote size={17} />
                      </span>

                      <ProviderStarRating rating={review.rating} size={13} />
                    </header>

                    {review.review ? (
                      <blockquote className="mt-3 text-sm leading-6 text-gray-700 dark:text-gray-200">
                        {review.review}
                      </blockquote>
                    ) : (
                      <p className="mt-3 text-xs leading-6 text-gray-400 dark:text-gray-500">
                        این مراجعه فقط امتیاز ثبت کرده است.
                      </p>
                    )}

                    {(review.type || review.createdAgo) && (
                      <footer className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-3 dark:border-gray-800">
                        {review.type && (
                          <span className="rounded-md bg-gray-100 px-2 py-1 text-[10px] font-semibold text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                            {review.type}
                          </span>
                        )}

                        {review.createdAgo && (
                          <time className="text-[11px] text-gray-400 dark:text-gray-500">
                            {review.createdAgo}
                          </time>
                        )}
                      </footer>
                    )}
                  </article>
                ))}
              </div>

              {(hasMoreReviews || loadMoreError) && (
                <div className="mt-7 flex flex-col items-center gap-3">
                  {loadMoreError && (
                    <p className="text-xs text-red-500">{loadMoreError}</p>
                  )}

                  {hasMoreReviews && (
                    <button
                      type="button"
                      onClick={loadMoreReviews}
                      disabled={isLoadingMore}
                      className="group flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-bold text-gray-700 transition hover:border-primary/30 hover:text-primary disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                    >
                      <span>
                        {isLoadingMore
                          ? "لطفاً صبر کنید..."
                          : "نمایش دیدگاه‌های بیشتر"}
                      </span>

                      {hiddenReviews > 0 && (
                        <span className="text-xs font-medium text-gray-400">
                          {hiddenReviews.toLocaleString("fa-IR")}
                        </span>
                      )}

                      <TbChevronDown
                        size={17}
                        className="transition-transform duration-300 group-hover:translate-y-0.5"
                      />
                    </button>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
              <ProfileEmptyState text="هنوز دیدگاهی برای این ارائه‌دهنده ثبت نشده است." />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function ServiceRatingsSummary({
  serviceRatings,
}: {
  serviceRatings: ReviewsStats["breakdown"]
}) {
  if (serviceRatings.length === 0) return null

  return (
    <div className="flex min-w-0 flex-1 flex-wrap items-center">
      {serviceRatings.map((item, index) => (
        <div
          key={item.type}
          className="relative flex min-w-45 flex-1 items-center justify-between gap-3 px-4 py-3 sm:px-5"
        >
          {index > 0 && (
            <span className="absolute inset-y-3 right-0 hidden w-px bg-gray-200 sm:block dark:bg-gray-800" />
          )}

          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-gray-600 dark:text-gray-300">
              {item.type}
            </p>

            <p className="mt-1 text-[11px] text-gray-400 dark:text-gray-500">
              {item.count.toLocaleString("fa-IR")} دیدگاه
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <ProviderStarRating rating={item.average} size={11} />

            <strong className="text-sm font-extrabold text-gray-800 dark:text-gray-100">
              {item.average.toLocaleString("fa-IR", {
                maximumFractionDigits: 1,
              })}
            </strong>
          </div>
        </div>
      ))}
    </div>
  )
}
