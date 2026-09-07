import { apiFetch, unwrapList, unwrapItem } from "./core"

export interface StoryRow {
  id: string
  authorId: string
  authorName: string
  title: string
  content: string
  coverUrl: string | null
  status: string
  views: number
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface BlogRow {
  id: string
  authorId: string
  authorName: string
  title: string
  content: string
  coverUrl: string | null
  status: string
  views: number
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface CommentRow {
  id: string
  postId: string
  postType: string
  authorId: string
  authorName: string
  parentId: string | null
  body: string
  createdAt: string
}

export interface CreateStoryInput {
  title: string
  content: string
  coverUrl?: string
  status?: "draft" | "published" | "archived"
}

export async function listStories(query: {
  status?: string
  search?: string
} = {}): Promise<StoryRow[]> {
  const params = new URLSearchParams()
  if (query.status) params.set("status", query.status)
  if (query.search) params.set("search", query.search)
  const qs = params.toString()
  const payload = await apiFetch<Record<string, unknown>>(
    `/api/stories${qs ? `?${qs}` : ""}`,
  )
  return unwrapList<StoryRow>(payload, "stories")
}

export async function getStory(id: string): Promise<StoryRow | null> {
  const payload = await apiFetch<Record<string, unknown>>(`/api/stories/${id}`)
  return unwrapItem<StoryRow>(payload, "story")
}

export async function createStory(input: CreateStoryInput): Promise<StoryRow> {
  const payload = await apiFetch<Record<string, unknown>>("/api/stories", {
    method: "POST",
    body: JSON.stringify(input),
  })
  const story = unwrapItem<StoryRow>(payload, "story")
  if (!story) {
    throw new Error("Create story response was empty")
  }
  return story
}

export async function updateStory(
  id: string,
  input: Partial<CreateStoryInput>,
): Promise<StoryRow> {
  const payload = await apiFetch<Record<string, unknown>>(`/api/stories/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  })
  const story = unwrapItem<StoryRow>(payload, "story")
  if (!story) {
    throw new Error("Update story response was empty")
  }
  return story
}

export async function deleteStory(id: string): Promise<void> {
  await apiFetch<Record<string, unknown>>(`/api/stories/${id}`, {
    method: "DELETE",
  })
}

export interface CreateBlogInput {
  title: string
  content: string
  coverUrl?: string
  status?: "draft" | "published" | "archived"
}

export async function listBlogs(query: {
  status?: string
  search?: string
} = {}): Promise<BlogRow[]> {
  const params = new URLSearchParams()
  if (query.status) params.set("status", query.status)
  if (query.search) params.set("search", query.search)
  const qs = params.toString()
  const payload = await apiFetch<Record<string, unknown>>(
    `/api/blogs${qs ? `?${qs}` : ""}`,
  )
  return unwrapList<BlogRow>(payload, "blogs")
}

export async function getBlog(id: string): Promise<BlogRow | null> {
  const payload = await apiFetch<Record<string, unknown>>(`/api/blogs/${id}`)
  return unwrapItem<BlogRow>(payload, "blog")
}

export async function createBlog(input: CreateBlogInput): Promise<BlogRow> {
  const payload = await apiFetch<Record<string, unknown>>("/api/blogs", {
    method: "POST",
    body: JSON.stringify(input),
  })
  const blog = unwrapItem<BlogRow>(payload, "blog")
  if (!blog) {
    throw new Error("Create blog response was empty")
  }
  return blog
}

export async function updateBlog(
  id: string,
  input: Partial<CreateBlogInput>,
): Promise<BlogRow> {
  const payload = await apiFetch<Record<string, unknown>>(`/api/blogs/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  })
  const blog = unwrapItem<BlogRow>(payload, "blog")
  if (!blog) {
    throw new Error("Update blog response was empty")
  }
  return blog
}

export async function deleteBlog(id: string): Promise<void> {
  await apiFetch<Record<string, unknown>>(`/api/blogs/${id}`, {
    method: "DELETE",
  })
}

export interface CreateCommentInput {
  postId: string
  postType: "story" | "blog"
  body: string
  parentId?: string
}

export async function listComments(query: {
  postId: string
  postType: string
}): Promise<CommentRow[]> {
  const params = new URLSearchParams()
  params.set("postId", query.postId)
  params.set("postType", query.postType)
  const qs = params.toString()
  const payload = await apiFetch<Record<string, unknown>>(
    `/api/comments${qs ? `?${qs}` : ""}`,
  )
  return unwrapList<CommentRow>(payload, "comments")
}

export async function getComment(id: string): Promise<CommentRow | null> {
  const payload = await apiFetch<Record<string, unknown>>(`/api/comments/${id}`)
  return unwrapItem<CommentRow>(payload, "comment")
}

export async function createComment(input: CreateCommentInput): Promise<CommentRow> {
  const payload = await apiFetch<Record<string, unknown>>("/api/comments", {
    method: "POST",
    body: JSON.stringify(input),
  })
  const comment = unwrapItem<CommentRow>(payload, "comment")
  if (!comment) {
    throw new Error("Create comment response was empty")
  }
  return comment
}

export async function deleteComment(id: string): Promise<void> {
  await apiFetch<Record<string, unknown>>(`/api/comments/${id}`, {
    method: "DELETE",
  })
}
