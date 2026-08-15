// src/components/live-panel/LiveButton.tsx
"use client"

import { motion } from "framer-motion"
import { TbBroadcast } from "react-icons/tb"
import { useLiveDrawer } from "./useLiveDrawer"

export function LiveButton() {
  const { openDrawer } = useLiveDrawer()

  return (
    <div className="fixed right-0 top-4/5 -translate-y-1/2 z-40 select-none">
      <motion.div
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute inset-0 right-0 w-8 h-24 md:w-12 md:h-48 bg-[#1d4ed8]/10 blur-xl rounded-l-full pointer-events-none group-hover:bg-[#1d4ed8]/30 transition-colors duration-500"
      />

      <motion.button
        onClick={openDrawer}
        initial={{ x: 15, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        whileHover={{ x: -4 }}
        whileTap={{ scale: 0.96, x: -1 }}
        transition={{ type: "spring", stiffness: 380, damping: 28 }}
        className="relative flex flex-col items-center gap-3 md:gap-5 w-10 md:w-12 py-3.5 md:py-5 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md border border-r-0 border-gray-200 dark:border-neutral-800 rounded-l-2xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.4)] hover:shadow-[#1d4ed8]/10 dark:hover:shadow-[#1d4ed8]/5 cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1d4ed8]"
        aria-label="نمایش وکلای آنلاین"
      >
        <div className="absolute inset-0 rounded-l-2xl overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              y: ["-100%", "100%"],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute left-0 w-[1.5px] h-12 md:h-24 bg-linear-to-b from-transparent via-[#1d4ed8] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          />
        </div>

        <div className="relative flex items-center justify-center w-6 h-6 md:w-7 md:h-7 rounded-lg bg-gray-50 dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800/60 group-hover:border-[#1d4ed8]/30 dark:group-hover:border-[#1d4ed8]/20 transition-all duration-300">
          <TbBroadcast className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-500 dark:text-neutral-400 group-hover:text-[#1d4ed8] transition-colors duration-300" />

          <span className="absolute -top-0.5 -left-0.5 flex h-2 w-2">
            <motion.span
              animate={{ scale: [1, 2.3, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="absolute inline-flex h-full w-full rounded-full bg-primary-deep opacity-75"
            />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
          </span>
        </div>

        <div className="hidden md:flex h-15 items-center justify-center relative w-full">
          <span className="absolute text-[11px] font-black tracking-wider text-gray-700 dark:text-neutral-300 group-hover:text-gray-950 dark:group-hover:text-white transition-colors duration-200 whitespace-nowrap -rotate-90 origin-center select-none">
            وکلای آنلاین
          </span>
        </div>

        <div className="absolute inset-0 rounded-l-2xl bg-linear-to-b from-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </motion.button>
    </div>
  )
}
