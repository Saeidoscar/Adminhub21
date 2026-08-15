export type ContentKind = "story" | "blog"
export type ContentSort = "recent" | "views" | "likes" | "comments"
export type ReactionType = "like" | "dislike"

export type ContentTag = {
  name: string
  slug: string
  description: string | null
  storiesCount?: number
  blogsCount?: number
}

export type ContentItem = {
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
  tags: ContentTag[]
}

export type ContentComment = {
  publicId: string
  content: string
  likesCount: number
  dislikesCount: number
  createdAt: string | null
  author: { name: string | null } | null
  replies: ContentComment[]
}

export type ContentStats = {
  contentsCount: number
  viewsCount: number
  likesCount: number
  dislikesCount: number
  commentsCount: number
  tagsCount: number
}

export type ContentPagination = {
  currentPage: number
  lastPage: number
  perPage: number
  total: number
}

export type ContentListParams = {
  search?: string
  author?: string
  category?: string
  tag?: string
  sort?: ContentSort
  page?: number
  perPage?: number
}

export type ContentReactionState = {
  reaction: ReactionType | null
  likesCount: number
  dislikesCount: number
}
