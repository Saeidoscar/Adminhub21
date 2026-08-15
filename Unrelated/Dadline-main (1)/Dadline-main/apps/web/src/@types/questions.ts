export type QuestionCategory = {
  name: string
  slug: string
}

export type QuestionAuthor = {
  name: string | null
}

export type QuestionAnswerVendor = {
  name: string | null
  slug: string | null
  type: "lawyer" | "expert" | string | null
  profilePath: string | null
  role: string | null
  avatar: string | null
  rating: number
  reviewCount: number
}

export type QuestionResponder = {
  name: string | null
  slug: string | null
  type: "lawyer" | "expert" | string | null
  profilePath: string | null
  avatar: string | null
}

export type QuestionAnswer = {
  body: string
  createdAt: string | null
  vendor: QuestionAnswerVendor | null
}

export type Question = {
  title: string
  slug: string
  excerpt: string
  body?: string | null
  createdAt: string | null
  answersCount: number
  author: QuestionAuthor | null
  category: QuestionCategory | null
  latestResponders: QuestionResponder[]
  answers?: QuestionAnswer[]
}
