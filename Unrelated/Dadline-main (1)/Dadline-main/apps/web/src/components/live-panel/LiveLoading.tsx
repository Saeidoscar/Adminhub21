"use client"
import { motion } from "framer-motion"
export function LiveLoading() {
  return (
    <div className="space-y-4 p-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.1 }}
          className="flex items-start gap-4 p-4 rounded-2xl bg-white dark:bg-neutral-900/50 border border-gray-100 dark:border-white/5 animate-pulse"
        >
          <div className="w-9 h-9 rounded-xl bg-gray-200 dark:bg-neutral-800 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="flex justify-between">
              <div className="w-24 h-4 bg-gray-200 dark:bg-neutral-800 rounded" />
              <div className="w-12 h-3 bg-gray-200 dark:bg-neutral-800 rounded" />
            </div>
            <div className="w-3/4 h-3 bg-gray-200 dark:bg-neutral-800 rounded" />
            <div className="flex justify-between pt-2">
              <div className="w-16 h-3 bg-gray-200 dark:bg-neutral-800 rounded" />
              <div className="w-14 h-4 bg-gray-200 dark:bg-neutral-800 rounded-full" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
