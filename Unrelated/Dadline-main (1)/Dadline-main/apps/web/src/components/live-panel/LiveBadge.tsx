// src/components/live-panel/LiveBadge.tsx
"use client"

// تعریف تایپ به صورت داخلی برای مستقل شدن کامپوننت و حل مشکل ایمپورت

// استفاده از فال‌بک پیش‌فرض در صورت نبود استاتوس معتبر

import React from "react"
import { motion } from "framer-motion"
export type BadgeStatus = "success" | "warning" | "info" | "error" | "default"

interface LiveBadgeProps {
  status: BadgeStatus
  children: React.ReactNode
}

export function LiveBadge({ status, children }: LiveBadgeProps) {
  const statusConfig = {
    success:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20",
    warning:
      "bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-500/20",
    info: "bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-500/20",
    error:
      "bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-400 border-red-200 dark:border-red-500/20",
    default:
      "bg-gray-100 text-gray-800 dark:bg-neutral-800 dark:text-neutral-300 border-gray-200 dark:border-neutral-700",
  }
  const currentClass = statusConfig[status] || statusConfig.default

  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${currentClass}`}
    >
      {children}
    </motion.span>
  )
}
