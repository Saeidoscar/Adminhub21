import AdaptiveCard from "@/components/shared/AdaptiveCard"
import Container from "@/components/shared/Container"
import { getNotificationSettings } from "@/server/actions/notifications/getNotificationSettings"
import { redirect } from "next/navigation"
import NotificationSettingsClient from "./_components/NotificationSettingsClient"

export default async function Page() {
  const result = await getNotificationSettings()

  if (result.status === 401) redirect("/sign-in")

  return (
    <Container className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          تنظیمات اعلان‌ها
        </h2>
        <p className="mt-1 text-sm leading-6 text-gray-500">
          کانال‌های اطلاع‌رسانی، ساعت سکوت و سهمیه پیامک
        </p>
      </div>

      <AdaptiveCard>
        {result.data ? (
          <NotificationSettingsClient settings={result.data} />
        ) : (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-100">
            {result.error ?? "تنظیمات اعلان‌ها قابل نمایش نیست."}
          </div>
        )}
      </AdaptiveCard>
    </Container>
  )
}
