import AdaptiveCard from "@/components/shared/AdaptiveCard"
import Container from "@/components/shared/Container"
import { getNotifications } from "@/server/actions/notifications/getNotifications"
import Link from "next/link"
import { redirect } from "next/navigation"
import NotificationsClient from "./_components/NotificationsClient"

export default async function Page() {
  const result = await getNotifications()

  if (result.status === 401) redirect("/sign-in")

  return (
    <Container className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            اعلان‌ها
          </h2>
          <p className="mt-1 text-sm leading-6 text-gray-500">
            اعلان‌های شخصی و پیام‌های سیستم دادلاین
          </p>
        </div>
        <Link
          href="/pishkhan/settings/notifications"
          className="inline-flex h-10 shrink-0 items-center justify-center rounded-xl border border-gray-300 bg-white px-5 text-sm font-bold text-gray-600 transition hover:border-primary hover:text-primary dark:border-gray-700 dark:bg-gray-700 dark:text-gray-100 dark:hover:border-white dark:hover:text-white"
        >
          تنظیمات اعلان‌ها
        </Link>
      </div>

      <AdaptiveCard>
        {result.data ? (
          <NotificationsClient data={result.data} />
        ) : (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-100">
            {result.error ?? "اعلان‌ها قابل نمایش نیستند."}
          </div>
        )}
      </AdaptiveCard>
    </Container>
  )
}
