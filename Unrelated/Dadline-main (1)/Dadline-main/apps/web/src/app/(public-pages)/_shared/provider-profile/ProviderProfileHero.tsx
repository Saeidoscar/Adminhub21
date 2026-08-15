import Link from "next/link"
import { HiOutlineBadgeCheck } from "react-icons/hi"
import { TbDiamond, TbMapPin, TbPointFilled } from "react-icons/tb"

import type { PublicReview, ReviewsStats } from "@/@types/reviews"
import type { ProviderDetail } from "@/@types/vendors"
import ShareButton from "@/components/shared/ShareButton"

import { ProviderIntroVideo } from "./ProviderIntroVideo"
import { ProviderStarRating } from "./ProviderProfilePrimitives"
import type { ProviderProfileKind } from "./provider-profile.types"
import { getAverageRating, getProviderInitials } from "./provider-profile.utils"

export const ProviderProfileHero = ({
  provider,
  kind,
  reviews,
  reviewsStats,
}: {
  provider: ProviderDetail
  kind: ProviderProfileKind
  reviews: PublicReview[]
  reviewsStats: ReviewsStats
}) => {
  const rating =
    reviewsStats.total > 0 ? reviewsStats.average : getAverageRating(reviews)
  const visibleCategories = provider.categories.slice(0, 3)

  const formattedRating =
    rating !== null
      ? Number(rating).toLocaleString("fa-IR", {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
        })
      : "—"

  const showActivityStatus = provider.online || Boolean(provider.lastActive)

  return (
    <section className="relative isolate overflow-hidden text-gray-950 dark:border-gray-800 dark:text-white">
      <div className="mx-auto grid max-w-7xl items-center gap-8 pb-8 pt-20 sm:px-8 sm:pb-12 sm:pt-24 lg:min-h-140 lg:grid-cols-[1.15fr_0.65fr] lg:gap-12 lg:pb-14 lg:pt-28">
        {/* اطلاعات اصلی */}
        <div className="order-2 text-center lg:order-1 lg:text-right">
          {/* موقعیت */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 text-sm text-gray-600 dark:text-gray-300 lg:justify-start">
            <TbMapPin className="shrink-0 text-primary" size={19} />

            <Link
              href={`/${kind}?province=${provider.location.provinceSlug}`}
              className="transition hover:text-primary"
            >
              {provider.location.province}
            </Link>

            <span aria-hidden="true">،</span>

            <Link
              href={`/${kind}/city/${provider.location.citySlug}`}
              className="transition hover:text-primary"
            >
              {provider.location.city}
            </Link>
          </div>

          {/* نقش */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 lg:justify-start">
            <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary sm:text-sm">
              {provider.role}
            </span>
          </div>

          {/* نام */}
          <h1 className="mx-auto mt-4 max-w-3xl text-3xl font-black leading-[1.4] sm:text-4xl lg:mx-0 lg:mt-5 lg:text-5xl">
            {provider.name}
          </h1>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 lg:justify-start">
            {provider.introVideoUrl && (
              <ProviderIntroVideo
                videoUrl={provider.introVideoUrl}
                providerName={provider.name}
              />
            )}
            {provider.profile.tagline ? (
              <p>{provider.profile.tagline}</p>
            ) : (
              visibleCategories.length > 0 && (
                <p>
                  متخصص حوزه{" "}
                  {visibleCategories.map((category, index, categories) => (
                    <span key={category.slug}>
                      {category.name}

                      {index < categories.length - 2 && "، "}

                      {index === categories.length - 2 && " و "}
                    </span>
                  ))}
                </p>
              )
            )}
          </div>

          {(showActivityStatus || provider.introVideoUrl) && (
            <div className="flex flex-col gap-3 mt-4">
              {/* وضعیت آنلاین */}
              {showActivityStatus && (
                <div className="flex items-center justify-center gap-2 text-sm lg:justify-start">
                  <span
                    className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                      provider.online
                        ? "bg-emerald-50 dark:bg-emerald-950/40"
                        : "bg-gray-100 dark:bg-gray-800"
                    }`}
                  >
                    <TbPointFilled
                      size={18}
                      className={
                        provider.online
                          ? "text-emerald-500"
                          : "text-gray-400 dark:text-gray-500"
                      }
                    />

                    {provider.online && (
                      <span
                        className="absolute inset-0 animate-ping rounded-full bg-emerald-500/15"
                        aria-hidden="true"
                      />
                    )}
                  </span>

                  <div className="text-center">
                    {provider.online ? (
                      <>
                        <div className="text-center">
                          <strong className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                            آنلاین
                          </strong>
                          <span className="pr-3 text-xs text-gray-500 dark:text-gray-400">
                            آماده پاسخ‌گویی
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <span className="block text-xs text-gray-500 dark:text-gray-400">
                          آخرین فعالیت
                        </span>

                        <strong className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                          {provider.lastActive}
                        </strong>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* آمار */}
          <div className="mt-6 flex justify-center lg:justify-start">
            <div className="grid w-full max-w-sm grid-cols-2 gap-2 sm:grid-cols-4">
              <div className="rounded-xl bg-gray-100 p-2 text-center dark:bg-gray-900">
                <strong className="block text-xl font-black sm:text-2xl">
                  {provider.services.length.toLocaleString("fa-IR")}
                </strong>

                <span className="mt-1 block text-xs text-gray-500">خدمت</span>
              </div>

              <div className="rounded-xl bg-gray-100 p-2 text-center dark:bg-gray-900">
                <strong className="block text-xl font-black sm:text-2xl">
                  {formattedRating}
                </strong>

                <span className="mt-1 block text-xs text-gray-500">امتیاز</span>
              </div>

              <div className="rounded-xl bg-gray-100 p-2 text-center dark:bg-gray-900">
                <strong className="block text-xl font-black sm:text-2xl">
                  {(reviewsStats.total || reviews.length).toLocaleString(
                    "fa-IR",
                  )}
                </strong>

                <span className="mt-1 block text-xs text-gray-500">دیدگاه</span>
              </div>

              <div className="rounded-xl bg-gray-100 p-2 text-center dark:bg-gray-900">
                <strong className="block text-xl font-black sm:text-2xl">
                  {provider.categories.length.toLocaleString("fa-IR")}
                </strong>

                <span className="mt-1 block text-xs text-gray-500">تخصص</span>
              </div>
            </div>
          </div>

          {/* دکمه‌های اصلی */}
          <div className="mt-6 flex flex-col gap-3 mx-5 sm:mx-0 sm:flex-row sm:justify-center lg:justify-start">
            <Link
              href="#services"
              className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-primary px-5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-primary/90 sm:w-auto sm:px-7"
            >
              مشاهده خدمات و ثبت درخواست
            </Link>

            <Link
              href="#reviews"
              className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-gray-300 px-5 text-sm font-semibold text-gray-800 transition hover:border-primary hover:text-primary dark:border-gray-700 dark:text-gray-100 sm:w-auto sm:px-7"
            >
              دیدگاه مراجعین
            </Link>

            <ShareButton
              title={`پروفایل ${provider.name} در دادلاین`}
              text={`مشاهده پروفایل و خدمات ${provider.name} در دادلاین`}
              className="min-h-12 w-full sm:w-auto"
            />
          </div>
        </div>

        {/* تصویر و اطلاعات تکمیلی */}
        <div className="order-1 mx-auto w-full max-w-60 lg:order-2 lg:max-w-72 lg:justify-self-end">
          {/* تصویر */}
          <div className="relative">
            <div className="absolute -inset-3 rounded-4xl border border-primary/10 bg-primary/5 sm:-inset-5 sm:rounded-4xl" />

            <div className="relative aspect-4/5 overflow-hidden rounded-3xl bg-gray-100 shadow-xl shadow-primary/10 sm:shadow-2xl dark:bg-gray-900">
              {provider.avatar ? (
                <img
                  src={provider.avatar}
                  alt={provider.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-primary/10 text-xl font-black text-primary">
                  {getProviderInitials(provider.name)}
                </div>
              )}

              {/* پیشنهاد دادلاین */}
              {provider.recomended && (
                <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-gray-950 via-gray-950/50 to-transparent px-3 pb-3 pt-14 text-white">
                  <div className="flex items-center justify-center gap-1.5">
                    <TbDiamond size={18} />

                    <strong className="text-xs sm:text-sm">
                      پیشنهاد دادلاین
                    </strong>
                  </div>
                </div>
              )}
            </div>

            {/* نشان تأیید */}
            <span
              className="absolute -left-2 -top-2 z-10 flex h-9 w-9 items-center justify-center rounded-full border-4 border-white bg-primary text-white shadow-lg sm:-left-3 sm:-top-3 sm:h-10 sm:w-10 dark:border-gray-950"
              title="تأییدشده در دادلاین"
            >
              <HiOutlineBadgeCheck size={21} />

              <span
                className="absolute inset-0 animate-ping rounded-full bg-primary/35"
                aria-hidden="true"
              />
            </span>
          </div>

          {rating !== null && (
            <div className="flex -mt-5 mx-5 z-11 justify-center rounded-2xl p-1 shadow-sm backdrop-blur-2xl dark:border-gray-800 dark:bg-gray-900/80 border border-primary/10 bg-primary/5 sm:-inset-5 sm:rounded-4xl">
              <div className="flex flex-col items-center justify-center gap-x-2 gap-y-1 lg:justify-start">
                <div className="flex justify-center gap-2 mb-1 bg-transparent">
                  <strong className="text-xs text-gray-800 dark:text-gray-100">
                    {formattedRating}
                  </strong>
                  <span className="text-xs text-gray-800 dark:text-gray-400 ">
                    از {reviews.length.toLocaleString("fa-IR")} دیدگاه
                  </span>
                </div>
                <ProviderStarRating
                  rating={rating}
                  showValue={false}
                  size={20}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
