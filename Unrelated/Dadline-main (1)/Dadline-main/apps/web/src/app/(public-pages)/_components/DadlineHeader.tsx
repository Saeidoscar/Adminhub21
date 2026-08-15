"use client"
import Link from "next/link"
import Image from "next/image"
import { useSession } from "next-auth/react"
import classNames from "@/utils/classNames"
import useScrollTop from "@/utils/hooks/useScrollTop"
import useTheme from "@/utils/hooks/useTheme"
import { MODE_DARK, MODE_LIGHT } from "@/constants/theme.constant"
import logoDark from "./../../../../public/img/logo/logo-dark-full.png"
import logoLight from "./../../../../public/img/logo/logo-light-full.png"
import NavList from "./NavList"
import {
  TbMessageChatbot,
  TbPhone,
  TbUsers,
  TbContract,
  TbLayoutDashboard,
  TbGavel,
  TbFileDots,
} from "react-icons/tb"

const navItems = [
  {
    title: "وکیل‌پایه‌یک",
    value: "lawyer",
    href: "/lawyer",
    icon: <TbUsers size={16} />,
  },
  {
    title: "خدمات‌قضایی",
    value: "judicial-services",
    href: "/judicial-services",
    icon: <TbGavel size={16} />,
  },
  {
    title: "مشاوره‌تلفنی",
    value: "calls",
    href: "/calls",
    icon: <TbPhone size={16} />,
  },
  {
    title: "تنظیم‌اوراق",
    value: "legal-documents",
    href: "/legal-documents",
    icon: <TbFileDots size={16} />,
  },
  {
    title: "قرارداد‌آنلاین",
    value: "contracts",
    href: "/contracts",
    icon: <TbContract size={16} />,
  },
  {
    title: "بانک‌مستندات",
    value: "document",
    href: "/document",
    icon: <TbLayoutDashboard size={16} />,
  },
  {
    title: "دادبات",
    value: "ai",
    href: "/ai",
    icon: <TbMessageChatbot size={16} />,
  },
]

const DadlineHeader = () => {
  const { isSticky } = useScrollTop()
  const mode = useTheme((s) => s.mode)
  const setMode = useTheme((s) => s.setMode)

  const { data: session } = useSession()

  const toggleMode = () => setMode(mode === MODE_LIGHT ? MODE_DARK : MODE_LIGHT)

  return (
    <>
      <header
        style={{ transition: "all 0.2s ease-in-out" }}
        className={classNames("w-full fixed inset-x-0 z-50 top-0")}
      >
        <div
          className={classNames(
            "max-w-7xl mx-auto px-3 flex items-center justify-between rounded-b-xl py-2 transition-all duration-200",
            isSticky
              ? "bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-md mt-0"
              : "bg-transparent",
          )}
        >
          <Link href="/" className="shrink-0">
            <Image
              src={mode === MODE_DARK ? logoDark : logoLight}
              width={120}
              height={40}
              alt="دادلاین"
              placeholder="blur"
              priority
            />
          </Link>

          <div className="hidden lg:flex items-center text-sm font-medium gap-1">
            <NavList tabs={navItems} />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleMode}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="تغییر تم"
            >
              {mode === MODE_LIGHT ? (
                <svg
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                </svg>
              ) : (
                <svg
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2m-7.07-14.07 1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
                </svg>
              )}
            </button>

            {session?.user ? (
              <Link href="/pishkhan">
                <div className="inline-flex items-center gap-2 text-sm font-medium px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                  {session.user.image ? (
                    <Image
                      src={session.user.image}
                      width={28}
                      height={28}
                      className="rounded-full object-cover"
                      alt={session.user.name || "کاربر"}
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                      <svg
                        width="16"
                        height="16"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    </div>
                  )}
                  <span>{session.user.name || "کاربر"} </span>
                </div>
              </Link>
            ) : (
              <Link
                href="/sign-in"
                className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
              >
                ورود / ثبت نام
              </Link>
            )}
          </div>
        </div>
      </header>
      <div
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='50' height='50' fill='none' stroke='${
            mode === MODE_LIGHT
              ? "rgb(0 0 0 / 0.04)"
              : "rgb(255 255 255 / 0.04)"
          }'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e")`,
        }}
        className="absolute inset-0 mask-[linear-gradient(to_bottom,white_5%,transparent_70%)] pointer-events-none select-none"
      ></div>
    </>
  )
}

export default DadlineHeader
