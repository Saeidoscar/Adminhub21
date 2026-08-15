// src/components/live-panel/LiveHeader.tsx
"use client"
import { motion } from "framer-motion"
import Image from "next/image"
import { TbX, TbRefresh } from "react-icons/tb"
import useTheme from "@/utils/hooks/useTheme"
import { MODE_DARK } from "@/constants/theme.constant"
import logoDark from "./../../../public/img/logo/logo-dark-full.png"
import logoLight from "./../../../public/img/logo/logo-light-full.png"

interface LiveHeaderProps {
  onClose: () => void
  onRefresh: () => void
  isRefreshing: boolean
}

export function LiveHeader({
  onClose,
  onRefresh,
  isRefreshing,
}: LiveHeaderProps) {
  const mode = useTheme((s) => s.mode)
  return (
    <div className="relative flex items-center justify-between px-4 py-1 bg-linear-to-b from-white to-white/95 dark:from-neutral-950 dark:to-neutral-950/95 border-b border-gray-100 dark:border-white/5 backdrop-blur-xl z-20">
      <Image
        src={mode === MODE_DARK ? logoDark : logoLight}
        width={90}
        height={30}
        alt="دادلاین"
        placeholder="blur"
        priority
      />
      <div className="flex items-center gap-2">
        <button
          onClick={onRefresh}
          className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-900 text-gray-500 dark:text-gray-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
            isRefreshing ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={isRefreshing}
          aria-label="Refresh events"
        >
          <motion.div
            animate={{ rotate: isRefreshing ? 360 : 0 }}
            transition={{
              repeat: isRefreshing ? Infinity : 0,
              duration: 1,
              ease: "linear",
            }}
          >
            <TbRefresh className="w-5 h-5" />
          </motion.div>
        </button>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-900 text-gray-500 dark:text-gray-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          aria-label="Close panel"
        >
          <TbX className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
