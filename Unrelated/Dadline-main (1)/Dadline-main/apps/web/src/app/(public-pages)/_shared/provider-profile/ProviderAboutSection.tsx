"use client"

import { useEffect, useRef, useState, type CSSProperties } from "react"
import Link from "next/link"
import { TbRosetteDiscountCheck } from "react-icons/tb"
import type { ProviderDetail } from "@/@types/vendors"
import { ProfileSectionHeading } from "./ProviderProfilePrimitives"
import {
  PROVIDER_PROFILE_LABELS,
  type ProviderProfileKind,
} from "./provider-profile.types"

const MIN_ROW_HEIGHT = 420

export const ProviderAboutSection = ({
  provider,
  kind,
}: {
  provider: ProviderDetail
  kind: ProviderProfileKind
}) => {
  const labels = PROVIDER_PROFILE_LABELS[kind]

  const leftColumnRef = useRef<HTMLDivElement>(null)

  const [leftColumnHeight, setLeftColumnHeight] = useState(MIN_ROW_HEIGHT)

  const facts = [
    {
      title: "تحصیلات",
      value: provider.profile.education,
    },
    {
      title: "سوابق حرفه‌ای",
      value: provider.profile.work_history,
    },
  ].filter(
    (item): item is {
      title: string
      value: string
    } => Boolean(item.value),
  )

  useEffect(() => {
    const leftColumn = leftColumnRef.current

    if (!leftColumn) {
      return
    }

    const updateHeight = () => {
      setLeftColumnHeight(Math.max(leftColumn.scrollHeight, MIN_ROW_HEIGHT))
    }

    updateHeight()

    const resizeObserver = new ResizeObserver(updateHeight)

    resizeObserver.observe(leftColumn)

    return () => {
      resizeObserver.disconnect()
    }
  }, [
    provider.categories,
    provider.profile.education,
    provider.name,
    labels.about,
  ])

  return (
    <section
      id="profile"
      className="bg-gray-50/70 py-12 dark:border-gray-800 dark:bg-gray-950/40 pt-12"
    >
      <div className="mx-auto grid max-w-7xl gap-10 px-4 lg:min-h-105 lg:grid-cols-[0.8fr_1.2fr] lg:items-start lg:gap-12 text-center sm:text-start">
        <div ref={leftColumnRef} className="min-w-0">
          <ProfileSectionHeading
            eyebrow="PROFILE"
            title={labels.about}
            description={`پیشینه حرفه‌ای و حوزه فعالیت ${provider.name}`}
          />

          {provider.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
              {provider.categories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/${kind}/specialty/${category.slug}`}
                  className="rounded-2xl border border-gray-200 px-2 py-1 text-sm font-semibold text-gray-700 transition hover:border-primary hover:text-primary dark:border-gray-700 dark:text-gray-300"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          )}

          {(provider.license.number ||
            provider.license.issuer ||
            provider.license.expires_at) && (
            <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr>
                    <th
                      colSpan={2}
                      className="border-b border-blue-100 bg-blue-50 px-4 py-3 text-right text-sm font-extrabold text-primary dark:border-blue-950 dark:bg-blue-950/30"
                    >
                      <div className="flex items-center gap-2">
                        <TbRosetteDiscountCheck
                          size={19}
                          className="shrink-0 text-primary"
                        />

                        <span>پروانه فعالیت</span>
                      </div>
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {provider.license.issuer && (
                    <tr className="transition-colors hover:bg-gray-50/80 dark:hover:bg-gray-900/60">
                      <th
                        scope="row"
                        className="w-28 bg-gray-50/70 px-4 py-3 text-right align-top font-semibold text-gray-700 dark:bg-gray-900/50 dark:text-gray-300 sm:w-36"
                      >
                        صادرکننده
                      </th>

                      <td className="wrap-break-word px-4 py-3 leading-7 text-gray-600 dark:text-gray-400">
                        {provider.license.issuer}
                      </td>
                    </tr>
                  )}

                  {provider.license.number && (
                    <tr className="transition-colors hover:bg-gray-50/80 dark:hover:bg-gray-900/60">
                      <th
                        scope="row"
                        className="w-28 bg-gray-50/70 px-4 py-3 text-right align-top font-semibold text-gray-700 dark:bg-gray-900/50 dark:text-gray-300 sm:w-36"
                      >
                        شماره پروانه
                      </th>

                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                        <span
                          dir="ltr"
                          className="inline-block font-medium tracking-wide"
                        >
                          {provider.license.number}
                        </span>
                      </td>
                    </tr>
                  )}

                  {provider.license.expires_at && (
                    <tr className="transition-colors hover:bg-gray-50/80 dark:hover:bg-gray-900/60">
                      <th
                        scope="row"
                        className="w-28 bg-gray-50/70 px-4 py-3 text-right align-top font-semibold text-gray-700 dark:bg-gray-900/50 dark:text-gray-300 sm:w-36"
                      >
                        تاریخ انقضا
                      </th>

                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                        <span dir="ltr" className="inline-block font-medium">
                          {provider.license.expires_at}
                        </span>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div
          className="
                                min-w-0 border-r-2 border-primary/25 pr-4
                                sm:pr-6
                                lg:h-(--about-column-height)
                                lg:overflow-y-auto
                                lg:overscroll-contain
                                lg:pr-10 lg:pl-3
                                lg:scrollbar-thin
                                lg:[scrollbar-color:rgba(29,78,216,0.35)_transparent]
                                lg:[&::-webkit-scrollbar]:w-1
                                lg:[&::-webkit-scrollbar-track]:bg-transparent
                                lg:[&::-webkit-scrollbar-thumb]:rounded-full
                                lg:[&::-webkit-scrollbar-thumb]:bg-primary/30
                                lg:hover:[&::-webkit-scrollbar-thumb]:bg-primary/60
                            "
          style={
            {
              "--about-column-height": `${leftColumnHeight}px`,
            } as React.CSSProperties
          }
        >
          {facts.length > 0 && (
            <dl className="grid gap-7">
              {facts.map((fact) => (
                <div
                  key={fact.title}
                  className="border-b border-gray-200 pb-5 dark:border-gray-800"
                >
                  <dt className="flex items-center gap-2 text-sm font-extrabold text-gray-950 dark:text-white">
                    <TbRosetteDiscountCheck
                      className="shrink-0 text-primary"
                      size={19}
                    />

                    {fact.title}
                  </dt>

                  <dd className="mt-3 wrap-break-word whitespace-pre-line text-sm leading-7 text-gray-600 dark:text-gray-400">
                    {fact.value}
                  </dd>
                </div>
              ))}
            </dl>
          )}
          <p className="mt-4 whitespace-pre-line text-justify text-base leading-7 text-gray-700 dark:text-gray-200">
            {provider.profile.biography ??
              `اطلاعات تکمیلی درباره این ${labels.singular} به‌زودی در دادلاین منتشر می‌شود.`}
          </p>
        </div>
      </div>
    </section>
  )
}
