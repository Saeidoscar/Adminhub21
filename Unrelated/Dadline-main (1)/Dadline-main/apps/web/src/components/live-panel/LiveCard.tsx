"use client"
import Link from "next/link"
import { motion } from "framer-motion"
import { Vendor } from "@/@types/vendors"
import { Review } from "@/@types/reviews"
import { TbStarFilled, TbAward } from "react-icons/tb"
import { LiveBadge } from "./LiveBadge"
import { useLiveDrawer } from "./useLiveDrawer"
import Image from "next/image"

export function VendorCard({
  vendor,
  index,
}: {
  vendor: Vendor
  index: number
}) {
  const { closeDrawer } = useLiveDrawer()

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -2 }}
    >
      <Link
        href={`/${vendor?.type}/${vendor?.slug}`}
        onClick={closeDrawer}
        className={`relative flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 bg-white dark:bg-neutral-900/50 ${
          vendor.isRecommended
            ? "border-amber-200/60 dark:border-amber-500/20 bg-linear-to-l from-amber-500/5 to-transparent"
            : "border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/10"
        }`}
        dir="rtl"
      >
        {vendor.isRecommended && (
          <div className="absolute top-0 left-4 -translate-y-1/2 bg-linear-to-r from-amber-500 to-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 font-bold shadow-sm">
            <TbAward className="w-3 h-3" /> پیشنهادی دادلاین
          </div>
        )}

        <div className="absolute left-0 top-0 bottom-0 w-1 bg-linear-to-b from-transparent via-[#1d4ed8]/0 to-transparent group-hover:via-[#1d4ed8]/40 transition-colors" />

        <div className="relative shrink-0">
          {vendor.avatar ? (
            <Image
              src={vendor.avatar || "/images/avatar-placeholder.webp"}
              alt={vendor.name}
              width={56}
              height={56}
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,..."
              className="w-14 h-14 rounded-xl object-cover border border-gray-200/50 dark:border-white/10"
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold border border-gray-200/50 dark:border-white/10">
              {vendor.name.slice(0, 1)}
            </div>
          )}
          <span className="absolute -bottom-0.5 -left-0.5 flex h-3.5 w-3.5">
            {vendor.isOnline ? (
              <>
                <motion.span
                  animate={{
                    scale: [1, 1.8, 1],
                    opacity: [0.6, 0, 0.6],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2,
                  }}
                  className="absolute inline-flex h-full w-full rounded-full bg-primary"
                />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-primary-deep border-2 border-white dark:border-neutral-950" />
              </>
            ) : (
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-gray-300 dark:bg-neutral-600 border-2 border-white dark:border-neutral-950" />
            )}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-sm font-bold text-gray-950 dark:text-white truncate group-hover:text-[#1d4ed8] transition-colors">
              {vendor.name}
            </h4>
            <span
              className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${
                vendor.isOnline
                  ? "text-primary dark:text-primary-mild bg-emerald-50 dark:bg-emerald-500/5"
                  : "text-gray-400 bg-gray-50 dark:bg-neutral-800"
              }`}
            >
              {vendor.isOnline ? "آماده گفتگو" : "اخیراً آنلاین"}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate mb-0.5">
            {vendor.role}
          </p>
          <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate">
            {vendor.specialty}
          </p>
        </div>
      </Link>
    </motion.div>
  )
}

export function ReviewCard({
  review,
  index,
}: {
  review: Review
  index: number
}) {
  const { closeDrawer } = useLiveDrawer()

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="p-4 rounded-2xl bg-white dark:bg-neutral-900/50 border border-gray-100 dark:border-white/5 shadow-sm space-y-3 group relative overflow-hidden"
      dir="rtl"
    >
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-linear-to-b from-transparent via-[#1d4ed8]/0 to-transparent group-hover:via-[#1d4ed8]/40 transition-colors" />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {Array.from({ length: review.rating }).map((_, i) => (
            <TbStarFilled key={i} className="w-3.5 h-3.5 text-amber-500" />
          ))}
        </div>
        <LiveBadge status="info">{review.serviceType}</LiveBadge>
      </div>

      <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed font-normal">
        {review.comment}
      </p>

      <div className="flex items-center justify-between pt-1 border-t border-gray-50 dark:border-white/5">
        <Link
          href={
            review.vendorSlug
              ? `/${review.vendorType}/${review.vendorSlug}`
              : "#"
          }
          onClick={review.vendorSlug ? closeDrawer : undefined}
          className="flex items-center gap-2 group/link"
          aria-disabled={!review.vendorSlug}
        >
          <span className="text-gray-500 text-[10px]">برای</span>
          {review.vendorAvatar ? (
            <Image
              src={review.vendorAvatar}
              alt={review.vendorName}
              width={24}
              height={24}
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,..."
              className="w-6 h-6 rounded-full object-cover border border-gray-100 dark:border-white/10"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold border border-gray-100 dark:border-white/10">
              {review.vendorName.slice(0, 1)}
            </div>
          )}
          <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 group-hover/link:text-[#1d4ed8] transition-colors">
            {review.vendorName}
          </span>
        </Link>
        <span className="text-[10px] text-gray-400 dark:text-gray-500">
          {review.timeAgo}
        </span>
      </div>
    </motion.div>
  )
}
