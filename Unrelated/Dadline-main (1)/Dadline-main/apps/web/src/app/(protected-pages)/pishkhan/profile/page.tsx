import AdaptiveCard from "@/components/shared/AdaptiveCard"
import Container from "@/components/shared/Container"
import { getLocations } from "@/server/actions/locations/getLocations"
import { getProfile } from "@/server/actions/profile/getProfile"
import ProfileSettingsClient from "./_components/ProfileSettingsClient"

type PageProps = {
  searchParams?: Promise<{
    payment?: string
    inquiry?: string
    returnContext?: string
  }>
}

const paymentStatus = (value?: string) =>
  value === "success" || value === "failed" ? value : null

const inquiryStatus = (value?: string) =>
  value === "matched" || value === "not_matched" || value === "unavailable"
    ? value
    : null

export default async function Page({ searchParams }: PageProps) {
  const query = (await searchParams) ?? {}
  const [profileResult, locationsResult] = await Promise.all([
    getProfile(),
    getLocations(),
  ])

  return (
    <Container className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          پروفایل من
        </h2>
        <p className="mt-1 text-sm leading-6 text-gray-500">
          اطلاعات هویتی، مالی، احراز هویت و تنظیمات حساب کاربری شما در دادلاین.
        </p>
      </div>

      <AdaptiveCard>
        {profileResult.data ? (
          <ProfileSettingsClient
            profile={profileResult.data}
            provinces={locationsResult.data ?? []}
            paymentStatus={paymentStatus(query.payment)}
            inquiryStatus={inquiryStatus(query.inquiry)}
            returnContext={query.returnContext ?? null}
          />
        ) : (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-100">
            {profileResult.error ?? "اطلاعات پروفایل قابل نمایش نیست."}
          </div>
        )}
      </AdaptiveCard>
    </Container>
  )
}
