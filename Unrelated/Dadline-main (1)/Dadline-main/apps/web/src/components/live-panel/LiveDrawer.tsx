"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { LiveHeader } from "./LiveHeader"
import { LiveLoading } from "./LiveLoading"
import { useLiveDrawer } from "./useLiveDrawer"
import { VendorCard, ReviewCard } from "./LiveCard"
import { Vendor } from "@/@types/vendors"
import { Review } from "@/@types/reviews"

type TabType = "vendors" | "reviews"

type LiveDrawerProps = {
  vendors: Vendor[]
  reviews: Review[]
  refreshAction: () => Promise<void>
}

export function LiveDrawer({
  vendors,
  reviews,
  refreshAction,
}: LiveDrawerProps) {
  const { isOpen, closeDrawer } = useLiveDrawer()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>("vendors")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [loading, setLoading] = useState(true)
  const drawerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
      setLoading(true)
      const timer = setTimeout(() => setLoading(false), 500)
      return () => {
        document.body.style.overflow = ""
        clearTimeout(timer)
      }
    }
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) closeDrawer()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, closeDrawer])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refreshAction()
      router.refresh()
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/10 dark:bg-black/40 backdrop-blur-sm"
            onClick={closeDrawer}
            aria-hidden="true"
          />

          <motion.aside
            ref={drawerRef}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{
              type: "spring",
              damping: 28,
              stiffness: 220,
            }}
            className="fixed top-0 right-0 h-full w-full sm:w-105 max-w-full z-60 bg-gray-50/90 dark:bg-neutral-950/95 backdrop-blur-xl border-l border-gray-200 dark:border-white/10 shadow-2xl flex flex-col overflow-hidden outline-none"
            role="dialog"
            aria-modal="true"
          >
            <LiveHeader
              onClose={closeDrawer}
              onRefresh={handleRefresh}
              isRefreshing={isRefreshing}
            />
            <div className="px-3 py-2 bg-white dark:bg-neutral-950 border-b border-gray-100 dark:border-white/5">
              <div
                className="flex bg-gray-100 dark:bg-neutral-900 p-1 rounded-xl relative"
                dir="rtl"
              >
                <button
                  onClick={() => setActiveTab("vendors")}
                  className={`flex-1 text-center py-2 text-xs font-bold rounded-lg relative z-10 transition-colors duration-300 ${
                    activeTab === "vendors"
                      ? "text-gray-950 dark:text-white"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  وکلای آنلاین
                  {activeTab === "vendors" && (
                    <motion.div
                      layoutId="activeTabGlow"
                      className="absolute inset-0 bg-white dark:bg-neutral-800 rounded-lg shadow-sm -z-10"
                    />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("reviews")}
                  className={`flex-1 text-center py-2 text-xs font-bold rounded-lg relative z-10 transition-colors duration-300 ${
                    activeTab === "reviews"
                      ? "text-gray-950 dark:text-white"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  آخرین دیدگاه‌ها
                  {activeTab === "reviews" && (
                    <motion.div
                      layoutId="activeTabGlow"
                      className="absolute inset-0 bg-white dark:bg-neutral-800 rounded-lg shadow-sm -z-10"
                    />
                  )}
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {loading || isRefreshing ? (
                <LiveLoading />
              ) : activeTab === "vendors" ? (
                vendors.length === 0 ? (
                  ""
                ) : (
                  vendors.map((vendor, idx) => (
                    <VendorCard key={vendor.slug} vendor={vendor} index={idx} />
                  ))
                )
              ) : reviews.length === 0 ? (
                ""
              ) : (
                reviews.map((review, idx) => (
                  <ReviewCard key={review.id} review={review} index={idx} />
                ))
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
