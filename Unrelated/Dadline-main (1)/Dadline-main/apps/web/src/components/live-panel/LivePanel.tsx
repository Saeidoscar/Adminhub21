import { revalidateTag } from "next/cache"
import { getLivePanelVendors } from "@/server/actions/provider/getLivePanelVendors"
import { getReviews } from "@/server/actions/reviews/getReviews"
import { LiveButton } from "./LiveButton"
import { LiveDrawer } from "./LiveDrawer"
import { Vendor } from "@/@types/vendors"
import { Review } from "@/@types/reviews"

async function refreshLivePanel() {
  "use server"
  revalidateTag("live-panel", "max")
}

export async function LivePanel() {
  const [vendorsResult, reviewsResult] = await Promise.all([
    getLivePanelVendors(),
    getReviews(),
  ])

  const vendors: Vendor[] = vendorsResult.vendors.map((provider) => ({
    id: String(provider.slug),
    name: provider.name,
    role: provider.role,
    avatar: provider.avatar,
    tagline: provider.tagline,
    isOnline: provider.online,
    isRecommended: provider.recomended,
    type: provider.type,
    slug: provider.slug,
    specialty:
      provider.tagline ||
      provider.expertise
        .slice(0, 3)
        .map((item) => item.name)
        .join("، "),
  }))

  const reviews: Review[] = reviewsResult.reviews
    .map((review) => ({
      id: String(review.id),
      rating: review.rating,
      serviceType: review.type,
      comment: review.review ?? "",
      vendorName: review.vendorName ?? "ارائه‌دهنده خدمات حقوقی",
      vendorAvatar: review.vendorAvatar,
      vendorSlug: review.vendorSlug,
      vendorType: review.vendorType,
      timeAgo: review.createdAgo ?? "",
    }))
    .filter((review): review is Review => review.serviceType !== undefined)

  return (
    <>
      <LiveButton />
      <LiveDrawer
        vendors={vendors}
        reviews={reviews}
        refreshAction={refreshLivePanel}
      />
    </>
  )
}
