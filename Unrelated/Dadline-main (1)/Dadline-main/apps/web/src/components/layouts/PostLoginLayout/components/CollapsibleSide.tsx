"use client"

import SideNav from "@/components/template/SideNav"
import Header from "@/components/template/Header"
import MobileNav from "@/components/template/MobileNav"
import SideNavToggle from "@/components/template/SideNavToggle"
import UserProfileDropdown from "@/components//template/UserProfileDropdown"
import LayoutBase from "@/components//template/LayoutBase"
import Tooltip from "@/components/ui/Tooltip"
import appConfig from "@/configs/app.config"
import Link from "next/link"
import Image from "next/image"
import { LAYOUT_COLLAPSIBLE_SIDE } from "@/constants/theme.constant"
import type { CommonProps } from "@/@types/common"

const DashboardHeaderBrand = () => {
  return (
    <Tooltip title="دادلاین" placement="bottom">
      <Link
        href={appConfig.authenticatedEntryPath}
        className="flex h-10 items-center rounded-xl px-1.5 transition hover:bg-gray-100 dark:hover:bg-gray-700"
        aria-label="دادلاین"
      >
        <Image
          src="/img/logo/logo-light-full.png"
          alt="دادلاین"
          width={140}
          height={32}
          className="h-7 w-auto object-contain dark:hidden"
          priority
        />
        <Image
          src="/img/logo/logo-dark-full.png"
          alt="دادلاین"
          width={140}
          height={32}
          className="hidden h-7 w-auto object-contain dark:block"
          priority
        />
      </Link>
    </Tooltip>
  )
}

const CollapsibleSide = ({ children }: CommonProps) => {
  return (
    <LayoutBase
      type={LAYOUT_COLLAPSIBLE_SIDE}
      className="app-layout-collapsible-side flex flex-auto flex-col"
    >
      <div className="flex min-w-0 flex-auto">
        <SideNav />
        <div className="relative flex min-h-screen min-w-0 w-full flex-auto flex-col">
          <Header
            className="shadow-sm dark:shadow-2xl"
            headerStart={
              <>
                <MobileNav />
                <SideNavToggle />
                <DashboardHeaderBrand />
              </>
            }
            headerEnd={
              <>
                <UserProfileDropdown hoverable={false} />
              </>
            }
          />
          <div className="flex h-full flex-auto flex-col">{children}</div>
        </div>
      </div>
    </LayoutBase>
  )
}

export default CollapsibleSide
