"use client" /* Backdrop */ /* Bottom Sheet */ /* Handle */ /* Header */ /* Grid */

import Link from "next/link"
import { motion, PanInfo } from "framer-motion"
import { publicMoreItems, pishkhanMoreItems } from "./navigation"
import { useMemo } from "react"
import { useSession, signOut } from "next-auth/react"

interface Props {
  open: boolean
  onClose: () => void
  isDashboard: boolean
}

export default function MoreBottomSheet({ open, onClose, isDashboard }: Props) {
  const handleDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    if (info.offset.y > 120 || info.velocity.y > 700) {
      onClose()
    }
  }

  const moreItems = useMemo(
    () => (isDashboard ? pishkhanMoreItems : publicMoreItems),
    [isDashboard],
  )
  const { data: session } = useSession()
  return (
    <>
      {}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        className="
                    fixed
                    inset-0
                    z-1000

                    bg-black/40

                    backdrop-blur-sm
                "
      />

      {}

      <motion.div
        drag="y"
        dragConstraints={{
          top: 0,
          bottom: 300,
        }}
        dragElastic={0.15}
        onDragEnd={handleDragEnd}
        initial={{
          y: "100%",
        }}
        animate={{
          y: 0,
        }}
        exit={{
          y: "100%",
        }}
        transition={{
          type: "spring",
          stiffness: 340,
          damping: 34,
        }}
        className="
                    fixed
                    bottom-0
                    left-0
                    right-0

                    z-1001

                    rounded-t-4xl

                    border-t
                    border-white/20
                    dark:border-white/10

                    bg-white/70
                    dark:bg-zinc-950/75

                    backdrop-blur-3xl

                    shadow-[0_-10px_50px_rgba(0,0,0,.18)]

                    pb-[calc(env(safe-area-inset-bottom)+24px)]
                "
      >
        {}

        <div className="flex justify-center pt-3">
          <div
            className="
                            h-1.5
                            w-14

                            rounded-full

                            bg-zinc-300
                            dark:bg-zinc-700
                        "
          />
        </div>

        {}

        <div className="px-6 pt-5 pb-2">
          <h2
            className="
                            text-center

                            text-lg

                            font-bold

                            text-zinc-900
                            dark:text-white
                        "
          >
            امکانات بیشتر
          </h2>

          <p
            className="
                            mt-1

                            text-center

                            text-sm

                            text-zinc-500
                        "
          >
            دسترسی سریع به تمام سرویس‌های دادلاین
          </p>
        </div>

        {}

        <div
          className="
                        grid
                        grid-cols-4

                        gap-4

                        p-6
                    "
        >
          {moreItems.map((item) => {
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className="
                                    group

                                    flex
                                    flex-col
                                    items-center

                                    rounded-2xl

                                    p-3

                                    transition-all
                                    duration-300

                                    hover:bg-white/60
                                    dark:hover:bg-white/5

                                    active:scale-95
                                "
              >
                <div
                  className="
                                        flex
                                        h-14
                                        w-14
                                        items-center
                                        justify-center

                                        rounded-2xl

                                        bg-white/80
                                        dark:bg-zinc-900

                                        shadow-[0_6px_20px_rgba(0,0,0,.08)]

                                        transition-all

                                        group-hover:scale-105
                                    "
                >
                  <Icon
                    size={26}
                    className="
                                            text-primary
                                        "
                  />
                </div>

                <span
                  className="
                                        mt-3

                                        text-xs
                                        font-medium

                                        text-center

                                        text-zinc-700
                                        dark:text-zinc-300
                                    "
                >
                  {item.title}
                </span>
              </Link>
            )
          })}
        </div>
        <div className="px-4">
          {session?.user ? (
            <div className="mt-auto flex flex-col gap-3">
              <button
                onClick={() => signOut()}
                className="bg-red-200 text-center py-2 border border-red-200 dark:border-red-800 text-red-500 rounded-lg text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                خروج از حساب
              </button>
            </div>
          ) : (
            <div className="mt-auto flex gap-2 w-full justify-between">
              <Link
                href="/sign-in"
                className="flex-2 text-center p-2 bg-primary text-white dark:border-gray-700 rounded-lg  text-sm borer"
              >
                ورود به دادلاین
              </Link>
              <Link
                href="/sign-up"
                className="flex-1 text-center p-2 border border-gray-500  rounded-lg text-sm"
              >
                ثبت‌نام سریع
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </>
  )
}
