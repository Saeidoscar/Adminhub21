"use client"

import { useEffect, useState } from "react"
import classNames from "@/utils/classNames"
import ScrollBar from "@/components/ui/ScrollBar"
import VerticalMenuContent from "@/components/template/VerticalMenuContent"
import useTheme from "@/utils/hooks/useTheme"
import useCurrentSession from "@/utils/hooks/useCurrentSession"
import useNavigation from "@/utils/hooks/useNavigation"
import queryRoute from "@/utils/queryRoute"
import appConfig from "@/configs/app.config"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { TbMoonStars, TbSunHigh, TbSunset2 } from "react-icons/tb"

import {
  SIDE_NAV_WIDTH,
  SIDE_NAV_COLLAPSED_WIDTH,
  HEADER_HEIGHT,
} from "@/constants/theme.constant"
import type { Mode } from "@/@types/theme"

const getGreeting = (hour: number) => {
  if (hour >= 5 && hour < 11) {
    return {
      text: "صبح بخیر",
      icon: TbSunHigh,
      background: "from-amber-400 via-orange-500 to-rose-500",
      glow: "bg-yellow-200/40",
    }
  }

  if (hour >= 11 && hour < 15) {
    return {
      text: "ظهر بخیر",
      icon: TbSunHigh,
      background: "from-sky-500 via-blue-600 to-indigo-600",
      glow: "bg-sky-200/40",
    }
  }

  if (hour >= 15 && hour < 19) {
    return {
      text: "عصر بخیر",
      icon: TbSunset2,
      background: "from-orange-500 via-rose-500 to-fuchsia-600",
      glow: "bg-orange-200/40",
    }
  }

  return {
    text: "شب بخیر",
    icon: TbMoonStars,
    background: "from-indigo-700 via-slate-800 to-gray-950",
    glow: "bg-indigo-300/30",
  }
}

const formatCurrentDate = (date: Date) => {
  const datePart = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })
    .format(date)
    .replace("،", "")

  const timePart = new Intl.DateTimeFormat("fa-IR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date)

  return `${datePart} ${timePart}`
}

type SideNavProps = {
  translationSetup?: boolean
  background?: boolean
  className?: string
  contentClass?: string
  currentRouteKey?: string
  mode?: Mode
}

const sideNavStyle = {
  width: SIDE_NAV_WIDTH,
  minWidth: SIDE_NAV_WIDTH,
}

const sideNavCollapseStyle = {
  width: SIDE_NAV_COLLAPSED_WIDTH,
  minWidth: SIDE_NAV_COLLAPSED_WIDTH,
}

const SideNav = ({
  translationSetup = appConfig.activeNavTranslation,
  background = true,
  className,
  contentClass,
}: SideNavProps) => {
  const pathname = usePathname()
  const [currentDate, setCurrentDate] = useState<Date | null>(null)

  const route = queryRoute(pathname)
  const { navigationTree } = useNavigation()
  const direction = useTheme((state) => state.direction)
  const sideNavCollapse = useTheme((state) => state.layout.sideNavCollapse)
  const currentRouteKey = route?.key || ""
  const { session } = useCurrentSession()

  useEffect(() => {
    const updateCurrentDate = () => setCurrentDate(new Date())

    updateCurrentDate()
    const interval = window.setInterval(updateCurrentDate, 1_000)

    return () => window.clearInterval(interval)
  }, [])

  const firstName = session?.user?.name?.trim().split(/\s+/)[0] || "کاربر"
  const greeting = getGreeting(currentDate?.getHours() ?? 12)
  const GreetingIcon = greeting.icon
  const formattedDate = currentDate
    ? formatCurrentDate(currentDate)
    : "خوش آمدید"

  return (
    <div
      style={sideNavCollapse ? sideNavCollapseStyle : sideNavStyle}
      className={classNames(
        "side-nav hidden lg:block",
        background && "side-nav-bg",
        !sideNavCollapse && "side-nav-expand",
        className,
      )}
    >
      <div
        className="side-nav-header flex items-center p-1"
        style={{ height: HEADER_HEIGHT }}
      >
        <Link
          href={appConfig.authenticatedEntryPath}
          className={classNames(
            "group relative flex h-full w-full items-center overflow-hidden bg-gray-100 border-gray-300 border rounded-xl p-2",
            sideNavCollapse ? "justify-center" : "justify-center",
          )}
          title={formattedDate}
        >
          <span
            className={classNames(
              "absolute -right-5 -top-8 size-20 rounded-full blur-2xl animate-pulse",
              greeting.glow,
            )}
          />

          <span className="relative flex size-8 shrink-0 items-center justify-center transition group-hover:scale-105">
            <GreetingIcon size={32} aria-hidden />
          </span>

          {!sideNavCollapse && (
            <span className="relative mr-2.5 min-w-0 text-right">
              <strong className="block truncate text-[13px] font-extrabold text-primary">
                {greeting.text} {firstName} جان
              </strong>
              <span className="mt-0.5 block truncate text-[10px] font-medium text-dark tabular-nums">
                {formattedDate}
              </span>
            </span>
          )}
        </Link>
      </div>

      <div className={classNames("side-nav-content", contentClass)}>
        <ScrollBar style={{ height: "100%" }} direction={direction}>
          <VerticalMenuContent
            collapsed={sideNavCollapse}
            navigationTree={navigationTree}
            routeKey={currentRouteKey}
            direction={direction}
            translationSetup={translationSetup}
            userAuthority={session?.user?.authority || []}
          />
        </ScrollBar>
      </div>
    </div>
  )
}

export default SideNav
