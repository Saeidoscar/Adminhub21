"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { TbGridDots } from "react-icons/tb"
import {
  dashboardItems,
  publicItems,
  publicMoreItems,
  pishkhanMoreItems,
} from "./navigation"

import MoreBottomSheet from "./MoreBottomSheet"

export default function MobileBottomNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const isDashboard = pathname.startsWith("/pishkhan")
  const isAuthPage =
    pathname.startsWith("/login") || pathname.startsWith("/register")
  const items = useMemo(
    () => (isDashboard ? dashboardItems : publicItems),
    [isDashboard],
  )
  const moreItems = useMemo(
    () => (isDashboard ? pishkhanMoreItems : publicMoreItems),
    [isDashboard],
  )
  const isMoreActive =
    open ||
    moreItems.some(
      (item) => pathname === item.href || pathname.startsWith(item.href + "/"),
    )
  if (isAuthPage) return null

  return (
    <>
      <nav
        className="
                    fixed
                    bottom-2
                    inset-x-2
                    md:hidden

                    overflow-hidden

                    rounded-[28px]

                    border
                    border-white/20
                    dark:border-white/10

                    bg-white/45
                    dark:bg-zinc-950/40

                    backdrop-blur-3xl

                    shadow-[0_10px_50px_rgba(15,23,42,.16),0_1px_3px_rgba(15,23,42,.08)]

                    before:absolute
                    before:inset-0
                    before:bg-linear-to-b
                    before:from-white/20
                    before:to-transparent
                    before:pointer-events-none

                    after:absolute
                    after:top-0
                    after:left-8
                    after:right-8
                    after:h-px
                    after:bg-white/30
                    after:pointer-events-none
                "
      >
        <ul
          className={`relative z-10 grid p-0 ${
            isDashboard ? "grid-cols-5" : "grid-cols-5"
          }`}
        >
          {items.map((item) => {
            const Icon = item.icon

            const active =
              pathname === item.href || pathname.startsWith(item.href + "/")

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="
                                        relative

                                        flex
                                        flex-col
                                        items-center
                                        justify-center

                                        rounded-2xl

                                        py-2.5

                                        transition-all
                                        duration-300

                                        active:scale-95
                                    "
                >
                  {active && (
                    <>
                      <motion.div
                        layoutId="bottom-nav-bg"
                        transition={{
                          type: "spring",
                          stiffness: 450,
                          damping: 35,
                        }}
                        className="
                                                    absolute
                                                    inset-0

                                                    rounded-2xl

                                                    bg-white/65
                                                    dark:bg-white/8

                                                    shadow-[inset_0_1px_1px_rgba(255,255,255,.35)]
                                                "
                      />

                      <motion.div
                        layoutId="bottom-nav-line"
                        transition={{
                          type: "spring",
                          stiffness: 450,
                          damping: 35,
                        }}
                        className="
                                                    absolute
                                                    top-1

                                                    h-1
                                                    w-7

                                                    rounded-full

                                                    bg-primary
                                                "
                      />
                    </>
                  )}

                  <div className="relative z-10 flex flex-col items-center">
                    <Icon
                      size={23}
                      strokeWidth={active ? 2.3 : 1.8}
                      className={
                        active
                          ? "text-primary"
                          : "text-zinc-500 dark:text-zinc-400"
                      }
                    />

                    <span
                      className={`
                                                mt-1
                                                text-[10px]
                                                font-medium

                                                ${
                                                  active
                                                    ? "text-primary"
                                                    : "text-zinc-500 dark:text-zinc-400"
                                                }
                                            `}
                    >
                      {item.title}
                    </span>
                  </div>
                </Link>
              </li>
            )
          })}

          {
            <li>
              <button
                onClick={() => setOpen(true)}
                className="
        relative
        flex
        flex-col
        items-center
        justify-center
        rounded-2xl
        py-2.5
        w-full
        transition-all
        duration-300
        active:scale-95
    "
              >
                {isMoreActive && (
                  <>
                    <motion.div
                      layoutId="bottom-nav-bg"
                      transition={{
                        type: "spring",
                        stiffness: 450,
                        damping: 35,
                      }}
                      className="
                    absolute
                    inset-0
                    rounded-2xl
                    bg-white/65
                    dark:bg-white/8
                    shadow-[inset_0_1px_1px_rgba(255,255,255,.35)]
                "
                    />

                    <motion.div
                      layoutId="bottom-nav-line"
                      transition={{
                        type: "spring",
                        stiffness: 450,
                        damping: 35,
                      }}
                      className="
                    absolute
                    top-1
                    h-1
                    w-7
                    rounded-full
                    bg-primary
                "
                    />
                  </>
                )}

                <div className="relative z-10 flex flex-col items-center">
                  <TbGridDots
                    size={23}
                    className={
                      isMoreActive
                        ? "text-primary"
                        : "text-zinc-500 dark:text-zinc-400"
                    }
                  />

                  <span
                    className={`mt-1 text-[10px] font-medium ${
                      isMoreActive
                        ? "text-primary"
                        : "text-zinc-500 dark:text-zinc-400"
                    }`}
                  >
                    بیشتر
                  </span>
                </div>
              </button>
            </li>
          }
        </ul>

        <div className="h-[env(safe-area-inset-bottom)]" />
      </nav>

      <AnimatePresence>
        {open && (
          <MoreBottomSheet
            open={open}
            onClose={() => setOpen(false)}
            isDashboard={isDashboard}
          />
        )}
      </AnimatePresence>
    </>
  )
}
