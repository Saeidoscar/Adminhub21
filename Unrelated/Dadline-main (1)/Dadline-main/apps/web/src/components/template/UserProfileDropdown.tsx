"use client"

import {
  useEffect,
  useState,
  type JSX,
  type MouseEvent,
  type ReactNode,
} from "react"
import Avatar from "@/components/ui/Avatar"
import Dropdown from "@/components/ui/Dropdown"
import withHeaderItem from "@/utils/hoc/withHeaderItem"
import classNames from "@/utils/classNames"
import Link from "next/link"
import signOut from "@/server/actions/auth/handleSignOut"
import useCurrentSession from "@/utils/hooks/useCurrentSession"
import useResponsive from "@/utils/hooks/useResponsive"
import {
  useDashboardHeader,
  type DashboardNotification,
  type DashboardTask,
} from "./DashboardHeaderProvider"
import {
  PiBellDuotone,
  PiCheckSquareDuotone,
  PiCurrencyCircleDollarDuotone,
  PiFileTextDuotone,
  PiGearDuotone,
  PiListChecksDuotone,
  PiNotePencilDuotone,
  PiSignOutDuotone,
  PiSparkleDuotone,
  PiUserDuotone,
} from "react-icons/pi"
type HeaderDropdownPlacement = "bottom" | "bottom-end"

type DropdownList = {
  label: string
  path: string
  icon: JSX.Element
}

const dropdownItemList: DropdownList[] = [
  {
    label: "حساب کاربری",
    path: "/pishkhan/profile",
    icon: <PiUserDuotone />,
  },
  {
    label: "کیف پول و پرداخت‌ها",
    path: "/pishkhan/payments",
    icon: <PiCurrencyCircleDollarDuotone />,
  },
  {
    label: "تنظیمات",
    path: "/pishkhan/settings",
    icon: <PiGearDuotone />,
  },
]

const shortcutItems = [
  {
    label: "هوش مصنوعی حقوقی",
    path: "/pishkhan/ai",
    icon: PiSparkleDuotone,
    className: "",
  },
  {
    label: "قراردادهای آنلاین",
    path: "/pishkhan/contracts",
    icon: PiFileTextDuotone,
    className: "hidden md:inline-flex",
  },
  {
    label: "تنظیم مستندات حقوقی",
    path: "/pishkhan/legal-document",
    icon: PiNotePencilDuotone,
    className: "hidden lg:inline-flex",
  },
]

const taskPriorityClasses: Record<DashboardTask["priority"], string> = {
  low: "bg-sky-100 text-sky-600 dark:bg-sky-950/70 dark:text-sky-300",
  medium:
    "bg-amber-100 text-amber-600 dark:bg-amber-950/70 dark:text-amber-300",
  high: "bg-red-100 text-red-600 dark:bg-red-950/70 dark:text-red-300",
}

const formatCurrency = (value: number) =>
  `${value.toLocaleString("fa-IR")} تومان`

const formatDate = (value: string | null) => {
  if (!value) return null

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null

  return new Intl.DateTimeFormat("fa-IR", {
    month: "short",
    day: "numeric",
  }).format(date)
}

const HeaderIcon = ({
  children,
  label,
  className,
}: {
  children: ReactNode
  label: string
  className?: string
}) => (
  <span
    className={classNames(
      "relative inline-flex size-10 items-center justify-center rounded-full text-2xl text-gray-600 transition duration-200 hover:bg-gray-100 hover:text-primary dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-primary-mild",
      className,
    )}
    aria-label={label}
  >
    {children}
  </span>
)

const CountBadge = ({ count }: { count: number }) => {
  if (count <= 0) return null

  return (
    <span className="absolute -right-0.5 -top-0.5 flex min-w-4.5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-4.5 text-white ring-2 ring-white dark:ring-gray-800">
      {Math.min(count, 99).toLocaleString("fa-IR")}
      {count > 99 ? "+" : ""}
    </span>
  )
}

const dismissedSystemNotificationsStorageKey =
  "dadline.dismissed-system-notifications"

const EmptyDropdown = ({ text, icon }: { text: string icon: ReactNode }) => (
  <div className="flex min-h-52 flex-col items-center justify-center px-6 py-8 text-center">
    <span className="mb-3 flex size-14 items-center justify-center rounded-full bg-gray-100 text-3xl text-gray-400 dark:bg-gray-800 dark:text-gray-500">
      {icon}
    </span>
    <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
      {text}
    </span>
  </div>
)

const DropdownHeader = ({
  title,
  description,
  icon,
}: {
  title: string
  description: string
  icon: ReactNode
}) => (
  <Dropdown.Item variant="header">
    <div className="mb-1 flex items-center justify-between px-2 py-1.5">
      <div className="min-w-0">
        <h6 className="truncate text-sm font-bold">{title}</h6>
        <p className="mt-0.5 text-xs text-gray-400">{description}</p>
      </div>
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xl text-primary">
        {icon}
      </span>
    </div>
  </Dropdown.Item>
)

const TaskDropdown = ({
  tasks,
  unreadCount,
  placement,
}: {
  tasks: DashboardTask[]
  unreadCount: number
  placement: HeaderDropdownPlacement
}) => (
  <Dropdown
    renderTitle={
      <HeaderIcon label="اقدام‌های من">
        <PiListChecksDuotone />
        <CountBadge count={unreadCount} />
      </HeaderIcon>
    }
    menuClass="w-[320px] max-w-[calc(100vw-16px)] p-2"
    placement={placement}
  >
    <DropdownHeader
      title="اقدام‌های من"
      description={`${unreadCount.toLocaleString("fa-IR")} مورد مشاهده‌نشده`}
      icon={<PiListChecksDuotone />}
    />

    {tasks.length === 0 ? (
      <EmptyDropdown
        text="فعلا کاری برای انجام ندارید "
        icon={<PiListChecksDuotone />}
      />
    ) : (
      <div className="max-h-80 overflow-y-auto px-1 py-1">
        {tasks.map((task, index) => {
          const content = (
            <div className="group flex w-full items-start gap-3 rounded-xl px-2 py-3 text-right transition hover:bg-gray-100 dark:hover:bg-gray-800">
              <Avatar
                size={38}
                shape="circle"
                className={taskPriorityClasses[task.priority]}
                icon={<PiCheckSquareDuotone />}
              />
              <span className="min-w-0 flex-1">
                <span className="line-clamp-2 block text-sm font-semibold leading-6 text-gray-800 dark:text-gray-100">
                  {task.title}
                </span>
                <span className="mt-1 flex items-center justify-between gap-2 text-xs text-gray-400">
                  <span>{task.isViewed ? "مشاهده‌شده" : "نیازمند بررسی"}</span>
                  {formatDate(task.updatedAt) && (
                    <span>{formatDate(task.updatedAt)}</span>
                  )}
                </span>
              </span>
            </div>
          )

          return (
            <div key={task.id}>
              {task.link ? (
                <Link href={task.link} className="block">
                  {content}
                </Link>
              ) : (
                content
              )}
              {index < tasks.length - 1 && (
                <div className="mx-2 border-b border-gray-100 dark:border-gray-800" />
              )}
            </div>
          )
        })}
      </div>
    )}
  </Dropdown>
)

const NotificationDropdown = ({
  personalNotifications,
  systemNotifications,
  placement,
}: {
  personalNotifications: DashboardNotification[]
  systemNotifications: DashboardNotification[]
  placement: HeaderDropdownPlacement
}) => {
  const { refresh } = useDashboardHeader()
  const [dismissingKey, setDismissingKey] = useState<string | null>(null)
  const [dismissedSystemIds, setDismissedSystemIds] = useState<number[]>([])
  const [activeTab, setActiveTab] = useState<"personal" | "system">("personal")
  const visibleSystemNotifications = systemNotifications.filter(
    (notification) => !dismissedSystemIds.includes(notification.id),
  )
  const visibleCount =
    personalNotifications.length + visibleSystemNotifications.length
  const hasNotifications =
    personalNotifications.length > 0 || visibleSystemNotifications.length > 0
  const activeNotifications =
    activeTab === "personal"
      ? personalNotifications
      : visibleSystemNotifications

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(
        dismissedSystemNotificationsStorageKey,
      )
      const parsed = stored ? JSON.parse(stored) : []

      if (Array.isArray(parsed)) {
        setDismissedSystemIds(parsed.filter((item) => Number.isInteger(item)))
      }
    } catch {
      setDismissedSystemIds([])
    }
  }, [])

  const dismissNotification = async (
    event: MouseEvent<HTMLButtonElement>,
    source: "personal" | "system",
    id: number,
  ) => {
    event.preventDefault()
    event.stopPropagation()

    const key = `${source}-${id}`
    setDismissingKey(key)

    if (source === "system") {
      setDismissedSystemIds((current) => {
        const next = Array.from(new Set([...current, id]))
        window.localStorage.setItem(
          dismissedSystemNotificationsStorageKey,
          JSON.stringify(next),
        )

        return next
      })
      setDismissingKey(null)

      return
    }

    try {
      const response = await fetch("/api/dashboard/notifications/dismiss", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ source, id }),
      })

      if (response.ok) {
        await refresh()
      }
    } finally {
      setDismissingKey(null)
    }
  }

  const dismissAllNotifications = async () => {
    setDismissedSystemIds((current) => {
      const next = Array.from(
        new Set([
          ...current,
          ...visibleSystemNotifications.map((notification) => notification.id),
        ]),
      )
      window.localStorage.setItem(
        dismissedSystemNotificationsStorageKey,
        JSON.stringify(next),
      )

      return next
    })

    if (personalNotifications.length === 0) {
      return
    }

    const response = await fetch("/api/dashboard/notifications/dismiss", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ source: "personal", all: true }),
    })

    if (response.ok) {
      await refresh()
    }
  }

  const renderNotificationList = (
    items: DashboardNotification[],
    source: "personal" | "system",
  ) => (
    <div className="space-y-1">
      {items.map((notification, index) => {
        const dismissKey = `${source}-${notification.id}`
        const body = (
          <span className="min-w-0 flex-1">
            <span className="line-clamp-3 block text-sm leading-6 text-gray-700 wrap-anywhere dark:text-gray-200">
              {notification.message}
            </span>
            <span className="mt-1 flex items-center justify-between gap-3 text-xs">
              {notification.buttonText && (
                <span className="font-semibold text-primary">
                  {notification.buttonText}
                </span>
              )}
            </span>
          </span>
        )
        const content = (
          <div className="group flex w-full items-start gap-3 rounded-xl px-2 py-3 text-right transition hover:bg-gray-100 dark:hover:bg-gray-800">
            {notification.link ? (
              <Link href={notification.link} className="min-w-0 flex-1">
                {body}
              </Link>
            ) : (
              body
            )}
            <button
              type="button"
              className="mt-0.5 shrink-0 rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-bold text-gray-500 transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
              disabled={dismissingKey === dismissKey}
              onClick={(event) =>
                dismissNotification(event, source, notification.id)
              }
            >
              باشه
            </button>
          </div>
        )

        return (
          <div key={dismissKey}>
            {content}
            {index < items.length - 1 && (
              <div className="mx-2 border-b border-gray-100 dark:border-gray-800" />
            )}
          </div>
        )
      })}
    </div>
  )

  return (
    <Dropdown
      renderTitle={
        <HeaderIcon label="اعلان‌های دادلاین">
          <PiBellDuotone />
          <CountBadge count={visibleCount} />
        </HeaderIcon>
      }
      menuClass="w-[380px] max-w-[calc(100vw-16px)] p-2"
      placement={placement}
    >
      <DropdownHeader title="اعلان‌های دادلاین" icon={<PiBellDuotone />} />

      {!hasNotifications ? (
        <EmptyDropdown
          text="اعلان جدیدی وجود ندارد."
          icon={<PiBellDuotone />}
        />
      ) : (
        <div className="px-1 py-1">
          <div className="mb-2 grid grid-cols-2 gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
            <button
              type="button"
              className={classNames(
                "flex h-9 items-center justify-center gap-2 rounded-lg px-2 text-xs font-bold transition",
                activeTab === "personal"
                  ? "bg-white text-primary shadow-sm dark:bg-gray-700 dark:text-primary-mild"
                  : "text-gray-500 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white",
              )}
              onClick={() => setActiveTab("personal")}
            >
              <span>شخصی</span>
              <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500 dark:bg-gray-800 dark:text-gray-300">
                {personalNotifications.length.toLocaleString("fa-IR")}
              </span>
            </button>
            <button
              type="button"
              className={classNames(
                "flex h-9 items-center justify-center gap-2 rounded-lg px-2 text-xs font-bold transition",
                activeTab === "system"
                  ? "bg-white text-primary shadow-sm dark:bg-gray-700 dark:text-primary-mild"
                  : "text-gray-500 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white",
              )}
              onClick={() => setActiveTab("system")}
            >
              <span>سیستم</span>
              <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500 dark:bg-gray-800 dark:text-gray-300">
                {visibleSystemNotifications.length.toLocaleString("fa-IR")}
              </span>
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {activeNotifications.length > 0 ? (
              renderNotificationList(activeNotifications, activeTab)
            ) : (
              <div className="px-3 py-10 text-center text-xs text-gray-400">
                {activeTab === "personal"
                  ? "اعلان شخصی جدیدی ندارید."
                  : "اعلان سیستمی جدیدی وجود ندارد."}
              </div>
            )}
          </div>
        </div>
      )}

      <Dropdown.Item variant="header">
        <div className="grid grid-cols-2 gap-2 px-1 pt-2">
          {hasNotifications && (
            <button
              type="button"
              className="flex h-9 w-full items-center justify-center rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-600 transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
              onClick={dismissAllNotifications}
            >
              همه را خواندم
            </button>
          )}
          <Link
            href="/pishkhan/notifications"
            className="flex h-9 w-full items-center justify-center rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-600 transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
          >
            مشاهده همه
          </Link>
        </div>
      </Dropdown.Item>
    </Dropdown>
  )
}

const _UserDropdown = ({ className }: { className?: string }) => {
  const { session } = useCurrentSession()
  const { larger } = useResponsive()
  const { data: dashboardData } = useDashboardHeader()

  const handleSignOut = async () => {
    await signOut()
  }

  const avatar = dashboardData?.user.avatar || session?.user?.image
  const displayName = dashboardData
    ? `${dashboardData.user.firstName ?? ""} ${dashboardData.user.lastName ?? ""}`.trim()
    : session?.user?.name
  const contact =
    dashboardData?.user.email ||
    dashboardData?.user.mobile ||
    session?.user?.email

  const avatarProps = avatar
    ? { src: avatar }
    : { icon: <PiUserDuotone aria-hidden size={20} /> }

  const tasks = dashboardData?.header.tasks ?? []
  const notifications = dashboardData?.header.notifications ?? []
  const personalNotifications =
    dashboardData?.header.personalNotifications ?? notifications
  const systemNotifications =
    dashboardData?.header.systemNotifications ??
    (dashboardData?.header.personalNotifications ? [] : notifications)
  const balance = dashboardData?.header.balance
  const dropdownPlacement: HeaderDropdownPlacement = larger.md
    ? "bottom-end"
    : "bottom"

  return (
    <div
      className={classNames(
        "flex cursor-default! items-center gap-0 rounded-2xl p-0! sm:gap-0.5",
        className,
      )}
    >
      <div className="flex items-center gap-0 sm:gap-0.5">
        {shortcutItems.map((item) => {
          const Icon = item.icon

          return (
            <Link
              key={item.path}
              href={item.path}
              className={item.className}
              aria-label={item.label}
            >
              <HeaderIcon label={item.label}>
                <Icon />
              </HeaderIcon>
            </Link>
          )
        })}
      </div>

      <Link
        href="/pishkhan/wallet"
        className="mx-1 hidden h-9 items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-2.5 text-xs font-bold text-gray-700 transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 sm:flex"
      >
        <span className="whitespace-nowrap">
          {balance === undefined ? "صبر کنید" : formatCurrency(balance)}
        </span>
      </Link>

      <TaskDropdown
        tasks={tasks}
        unreadCount={dashboardData?.header.unreadTasksCount ?? 0}
        placement={dropdownPlacement}
      />

      <NotificationDropdown
        personalNotifications={personalNotifications}
        systemNotifications={systemNotifications}
        placement={dropdownPlacement}
      />

      <Dropdown
        className="flex"
        toggleClassName="flex items-center"
        renderTitle={
          <div className="mr-0.5 flex cursor-pointer items-center rounded-full ring-2 ring-transparent transition hover:ring-primary/15">
            <Avatar size={34} {...avatarProps} />
          </div>
        }
        placement={dropdownPlacement}
        menuClass="w-[280px] max-w-[calc(100vw-16px)]"
      >
        <Dropdown.Item variant="header">
          <div className="flex items-center gap-3 px-3 py-2">
            <Avatar size={44} {...avatarProps} />
            <div className="min-w-0">
              <div className="truncate font-bold text-gray-900 dark:text-gray-100">
                {displayName || "کاربر دادلاین"}
              </div>
              <div className="mt-0.5 truncate text-xs text-gray-500">
                {contact || "صبر کنید"}
              </div>
            </div>
          </div>
        </Dropdown.Item>
        <Dropdown.Item variant="divider" />
        {dropdownItemList.map((item) => (
          <Dropdown.Item
            key={item.label}
            eventKey={item.label}
            className="px-0"
          >
            <Link className="flex h-full w-full px-2" href={item.path}>
              <span className="flex w-full items-center gap-2">
                <span className="text-xl text-gray-500 dark:text-gray-300">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </span>
            </Link>
          </Dropdown.Item>
        ))}
        <Dropdown.Item variant="divider" />
        <Dropdown.Item
          eventKey="Sign Out"
          className="gap-2 text-red-600"
          onClick={handleSignOut}
        >
          <PiSignOutDuotone className="text-xl" />
          <span>خروج از حساب</span>
        </Dropdown.Item>
      </Dropdown>
    </div>
  )
}

const UserDropdown = withHeaderItem(_UserDropdown)

export default UserDropdown
