export type DashboardQuestionCategory = {
  id: number
  name: string
  slug: string
}

export type DashboardQuestionReview = {
  id: number
  rating: number
  review: string | null
}

export type DashboardQuestionAnswer = {
  id: number
  body: string
  createdAt: string | null
  vendor: {
    id: number | null
    name: string | null
    role: string | null
    slug: string | null
    type: string | null
    profilePath: string | null
    avatar: string | null
  } | null
  review: DashboardQuestionReview | null
}

export type DashboardQuestion = {
  uuid: string
  title: string
  slug: string | null
  body: string
  excerpt: string
  isPrivate: boolean
  status: "pending" | "approved" | "publish"
  statusLabel: string
  answersCount: number
  createdAt: string | null
  category: DashboardQuestionCategory | null
  answers: DashboardQuestionAnswer[]
}

export type DashboardQuestionMeta = {
  categories: DashboardQuestionCategory[]
  pricing: {
    publicPrice: number
    privatePrice: number
    privateSurchargePercent: number
  }
  walletBalance: number
}

export type DashboardQuestionPagination = {
  currentPage: number
  lastPage: number
  perPage: number
  total: number
}
