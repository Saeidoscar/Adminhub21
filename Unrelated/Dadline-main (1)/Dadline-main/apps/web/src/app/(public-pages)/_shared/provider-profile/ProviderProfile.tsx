import type { ProviderDetail } from "@/@types/vendors"
import type {
  PublicReview,
  ReviewsPagination,
  ReviewsStats,
} from "@/@types/reviews"
import { ProviderAboutSection } from "./ProviderAboutSection"
import { ProviderContactSection } from "./ProviderContactSection"
import { ProviderProfileHero } from "./ProviderProfileHero"
import { ProviderResourcesSection } from "./ProviderResourcesSection"
import { ProviderReviewsSection } from "./ProviderReviewsSection"
import { ProviderServicesSection } from "./ProviderServicesSection"
import type { ProviderProfileKind } from "./provider-profile.types"

export const ProviderProfile = ({
  provider,
  kind,
  reviews,
  reviewsPagination,
  reviewsStats,
}: {
  provider: ProviderDetail
  kind: ProviderProfileKind
  reviews: PublicReview[]
  reviewsPagination: ReviewsPagination
  reviewsStats: ReviewsStats
}) => (
  <>
    <ProviderProfileHero
      provider={provider}
      kind={kind}
      reviews={reviews}
      reviewsStats={reviewsStats}
    />
    <ProviderServicesSection
      services={provider.services}
      providerSlug={provider.slug}
      providerName={provider.name}
    />
    <ProviderReviewsSection
      vendorSlug={provider.slug}
      reviews={reviews}
      pagination={reviewsPagination}
      stats={reviewsStats}
      providerName={provider.name}
    />
    <ProviderResourcesSection
      providerName={provider.name}
      providerSlug={provider.slug}
      blogs={provider.blogs ?? []}
      stories={provider.stories ?? []}
      documents={provider.documents ?? provider.products ?? []}
    />
    <ProviderAboutSection provider={provider} kind={kind} />
    <ProviderContactSection provider={provider} kind={kind} />
  </>
)
