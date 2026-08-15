export type ProviderType = "lawyer" | "expert"

export type Expertise = {
  id: number
  name: string
  slug: string
}

export type LocationRef = {
  id: number
  name: string
  slug: string
}

export interface Vendor {
  name: string
  role: string
  avatar: string | null
  tagline: string | null
  slug: string
  type: string
  isOnline: boolean
  isRecommended?: boolean
  specialty: string
}

export type Provider = {
  id: number
  name: string
  type: ProviderType
  role: string
  slug: string
  tagline: string | null
  online: boolean
  recomended: boolean | false
  lastActive: string
  city: LocationRef
  citySlug: LocationRef
  provinceSlug: LocationRef
  province: LocationRef
  expertise: Expertise[]
  avatar: string | null
  rating: number
  reviewCount: number
}

export type Lawyer = Provider

// ─────────────────────────────────────────────────────────────
// موارد زیر مربوط به صفحه‌ی پروفایل اختصاصی هر وکیل است که فعلاً
// (تا وصل‌شدن GET /legal-providers/{slug} یا معادلش) پیاده نمی‌شود.
// این تایپ‌ها دست‌نخورده نگه داشته شدند تا در آن مرحله استفاده شوند.
// ─────────────────────────────────────────────────────────────

export type Review = {
  id: number
  rating: number
  text: string
  date: string
  type: "مشاوره متنی" | "مشاوره تلفنی" | "بررسی پرونده" | "تنظیم اوراق"
}

export type Service = {
  id: string
  title: string
  desc: string
  price: number
  priceLabel: string
  icon: string
  ctaLabel: string
  ctaHref: string
}

export type RatingBreakdown = {
  label: string
  rating: number
  count: number
}

export type LawyerProfile = {
  id: number
  name: string
  slug: string
  type: string
  city: string
  province: string
  rating: number
  reviewCount: number
  specialties: string[]
  avatar: string
  lastActive: string
  about: string
  stats: {
    phoneConsult: number
    textConsult: number
    caseReview: number
    docDraft: number
  }
  ratingBreakdown: RatingBreakdown[]
  services: Service[]
  reviews: Review[]
  isVerified: boolean
}

// ─────────────────────────────────────────────────────────────
// جزئیات کامل یک ارائه‌دهنده (خروجی GET /legal-providers/{type}/{slug})
// ─────────────────────────────────────────────────────────────

export type ProviderCategory = {
  name: string
  slug: string
}

export type ProviderProfile = {
  tagline: string | null
  biography: string | null
  intro_video_url?: string | null
  video_url?: string | null
  work_history: string | null
  education: string | null
}

export type ProviderLicense = {
  issuer: string
  number: string
  expires_at: string | null
}

export type ProviderLocationDetail = {
  city: string
  citySlug: string
  province: string
  provinceSlug: string
}

export type CallServiceSettings = {
  prices: number[]
}

export type DocumentServiceSettings = {
  prices: Record<string, number>
  offer: string
}

export type CaseServiceSettings = {
  offer: string
}

export type ProviderService = {
  type: "call"
  name: string
  price: number | null
  settings: CallServiceSettings
  sort: number
} | {
  type: "document"
  name: string
  price: number | null
  settings: DocumentServiceSettings
  sort: number
} | {
  type: "case"
  name: string
  price: number | null
  settings: CaseServiceSettings
  sort: number
} | {
  type: "subscription"
  name: string
  price: number | null
  settings: null
  sort: number
}

export type ProviderDetail = {
  name: string
  role: string
  online: boolean
  lastActive: string | null
  slug: string
  recomended: boolean
  profile: ProviderProfile
  introVideoUrl: string | null
  license: ProviderLicense
  location: ProviderLocationDetail
  services: ProviderService[]
  categories: ProviderCategory[]
  avatar: string | null
  blogs: ProviderContentResource[]
  stories: ProviderContentResource[]
  documents: ProviderDocumentResource[]
  products: ProviderDocumentResource[]
  reviews: ProviderReview[]
}

export type ProviderReview = {
  id?: number
  rating?: number
  text?: string
  date?: string
  type?: string
}

export type ProviderProduct = {
  slug: string
  title: string
  type: string
  description: string | null
  price: number
  salesCount: number
  viewsCount: number
  publishedAt: string | null
  updatedAt: string | null
  vendor: {
    name: string
    role: string
    slug: string | null
    type: string | null
    avatarUrl: string | null
  } | null
  category: {
    name: string
    slug: string
  } | null
}
export type ProviderStory = {
  title: string
  slug: string
  excerpt: string | null
  content: string | null
  viewsCount: number
  likesCount: number
  dislikesCount: number
  commentsCount: number
  publishedAt: string | null
  createdAt: string | null
  updatedAt: string | null
  author: { name: string | null } | null
  category: { name: string slug: string } | null
  featuredImageUrl: string | null
  tags: Array<{
    name: string
    slug: string
    description: string | null
    storiesCount?: number
    blogsCount?: number
  }>
}

export type ProviderContentResource = ProviderStory

export type ProviderDocumentResource = ProviderProduct
