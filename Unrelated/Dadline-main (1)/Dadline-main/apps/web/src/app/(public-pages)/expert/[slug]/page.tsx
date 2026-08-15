import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { getProvider } from "@/server/actions/provider/getProvider"
import { getReviews } from "@/server/actions/reviews/getReviews"
import { ProviderProfile } from "../../_shared/provider-profile/ProviderProfile"

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const { provider } = await getProvider("expert", slug)

  if (!provider) return { title: "کارشناس حقوقی یافت نشد | دادلاین" }

  const description =
    provider.profile.tagline ??
    provider.profile.biography?.replace(/\s+/g, " ").slice(0, 155) ??
    `پروفایل، خدمات و حوزه‌های تخصصی ${provider.name} در دادلاین`

  return {
    title: `${provider.name} | کارشناس حقوقی در ${provider.location.city} | دادلاین`,
    description,
    openGraph: {
      title: `${provider.name} | دادلاین`,
      description,
      images: provider.avatar
        ? [{ url: provider.avatar, alt: provider.name }]
        : [],
    },
  }
}

const ExpertProfilePage = async ({ params }: Props) => {
  const { slug } = await params
  const [providerResult, reviewsResult] = await Promise.all([
    getProvider("expert", slug),
    getReviews(slug),
  ])
  const { provider, notFound: isNotFound, error } = providerResult

  if (isNotFound) notFound()

  if (error || !provider) {
    return (
      <main className="min-h-screen px-4 pb-16 pt-32">
        <div className="mx-auto max-w-xl rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {error ?? "دریافت اطلاعات این کارشناس حقوقی با خطا مواجه شد."}
          </p>
          <Link
            href="/expert"
            className="mt-6 inline-flex rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
          >
            بازگشت به فهرست کارشناسان
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen overflow-hidden">
      <ProviderProfile
        provider={provider}
        kind="expert"
        reviews={reviewsResult.reviews}
        reviewsPagination={reviewsResult.pagination}
        reviewsStats={reviewsResult.stats}
      />
    </main>
  )
}

export default ExpertProfilePage
