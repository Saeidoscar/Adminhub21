"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Link as ScrollLink } from "react-scroll"
import { usePathname } from "next/navigation"
import classNames from "@/utils/classNames"

type AnchorTab = {
  title: string
  value: string
  to: string
  icon?: any
}

type LinkTab = {
  title: string
  value: string
  href: string
  icon?: any
}

type Tab = LinkTab | AnchorTab

const NavList = ({
  tabs,
  tabClassName,
  onTabClick,
}: {
  tabs: Tab[]
  tabClassName?: string
  onTabClick?: () => void
}) => {
  const [hovered, setHovered] = useState<string | null>(null)
  const pathname = usePathname()
  return (
    <>
      {tabs.map((tab) => {
        const isAnchor = "to" in tab
        const isActive = !isAnchor && pathname === (tab as LinkTab).href
        const isSelected =
          hovered === tab.value || (hovered === null && isActive)
        const content = (
          <div
            className={classNames(
              "relative px-2 py-2 rounded-xl w-full cursor-pointer transition-colors duration-300",
              tabClassName,
            )}
          >
            {isSelected && (
              <motion.div
                layoutId="clickedbutton"
                transition={{
                  type: "spring",
                  bounce: 0.3,
                  duration: 0.6,
                }}
                className="absolute inset-0 rounded-xl bg-gray-100 dark:bg-gray-700"
              />
            )}

            <span className="flex items-center justify-center gap-1 relative z-10 heading-text">
              <span className="text-base">{tab?.icon}</span>
              {tab.title}
            </span>
          </div>
        )

        if (isAnchor) {
          return (
            <ScrollLink
              key={tab.value}
              to={tab.to}
              smooth
              duration={500}
              className="block"
              onClick={() => onTabClick?.()}
              onMouseEnter={() => setHovered(tab.value)}
              onMouseLeave={() => setHovered(null)}
            >
              {content}
            </ScrollLink>
          )
        }

        return (
          <Link
            key={tab.value}
            href={tab.href}
            className="block"
            onClick={() => onTabClick?.()}
            onMouseEnter={() => setHovered(tab.value)}
            onMouseLeave={() => setHovered(null)}
          >
            {content}
          </Link>
        )
      })}
    </>
  )
}

export default NavList
