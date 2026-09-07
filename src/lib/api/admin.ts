import type { Ticket as TicketRow } from "./tickets"
import { apiFetch, unwrapList, unwrapItem } from "./core"

export type { TicketRow }

export interface AdminUserRow {
  id: string
  email: string
  role: string
  nameEn: string
  nameFa: string
  phone: string | null
  phoneVerified: boolean
  createdAt: string
}

export async function listAdminUsers(query: {
  role?: string
  search?: string
}): Promise<AdminUserRow[]> {
  const params = new URLSearchParams()
  if (query.role) params.set("role", query.role)
  if (query.search) params.set("search", query.search)
  const qs = params.toString()
  const payload = await apiFetch<Record<string, unknown>>(
    `/api/admin/users${qs ? `?${qs}` : ""}`,
  )
  return unwrapList<AdminUserRow>(payload, "users")
}

export async function getAdminUser(id: string): Promise<AdminUserRow | null> {
  const payload = await apiFetch<Record<string, unknown>>(`/api/admin/users/${id}`)
  return unwrapItem<AdminUserRow>(payload, "user")
}

export async function updateAdminUser(
  id: string,
  data: Partial<{
    role: string
    nameEn: string
    nameFa: string
    phone: string | null
    phoneVerified: boolean
  }>,
): Promise<AdminUserRow> {
  const payload = await apiFetch<Record<string, unknown>>(`/api/admin/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  })
  const user = unwrapItem<AdminUserRow>(payload, "user")
  if (!user) {
    throw new Error("Update user response was empty")
  }
  return user
}

export async function deleteAdminUser(id: string): Promise<void> {
  await apiFetch<Record<string, unknown>>(`/api/admin/users/${id}`, {
    method: "DELETE",
  })
}

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

export async function listAdminStories(query: {
  status?: string
  search?: string
}): Promise<StoryRow[]> {
  const params = new URLSearchParams()
  if (query.status) params.set("status", query.status)
  if (query.search) params.set("search", query.search)
  const qs = params.toString()
  const payload = await apiFetch<Record<string, unknown>>(
    `/api/admin/content/stories${qs ? `?${qs}` : ""}`,
  )
  return unwrapList<StoryRow>(payload, "stories")
}

export async function listAdminBlogs(query: {
  status?: string
  search?: string
}): Promise<BlogRow[]> {
  const params = new URLSearchParams()
  if (query.status) params.set("status", query.status)
  if (query.search) params.set("search", query.search)
  const qs = params.toString()
  const payload = await apiFetch<Record<string, unknown>>(
    `/api/admin/content/blogs${qs ? `?${qs}` : ""}`,
  )
  return unwrapList<BlogRow>(payload, "blogs")
}

export async function moderateStoryAdmin(
  id: string,
  action: "approve" | "reject" | "archive",
): Promise<StoryRow> {
  const payload = await apiFetch<Record<string, unknown>>(
    `/api/admin/content/stories/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify({ action }),
    },
  )
  const story = unwrapItem<StoryRow>(payload, "story")
  if (!story) {
    throw new Error("Moderate story response was empty")
  }
  return story
}

export async function moderateBlogAdmin(
  id: string,
  action: "approve" | "reject" | "archive",
): Promise<BlogRow> {
  const payload = await apiFetch<Record<string, unknown>>(
    `/api/admin/content/blogs/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify({ action }),
    },
  )
  const blog = unwrapItem<BlogRow>(payload, "blog")
  if (!blog) {
    throw new Error("Moderate blog response was empty")
  }
  return blog
}

export async function listAdminComments(query: {
  postType?: string
}): Promise<CommentRow[]> {
  const params = new URLSearchParams()
  if (query.postType) params.set("postType", query.postType)
  const qs = params.toString()
  const payload = await apiFetch<Record<string, unknown>>(
    `/api/admin/content/comments${qs ? `?${qs}` : ""}`,
  )
  return unwrapList<CommentRow>(payload, "comments")
}

export async function deleteAdminComment(id: string): Promise<void> {
  await apiFetch<Record<string, unknown>>(`/api/admin/content/comments/${id}`, {
    method: "DELETE",
  })
}

export async function listAdminTickets(query: {
  status?: string
  category?: string
  priority?: string
}): Promise<TicketRow[]> {
  const params = new URLSearchParams()
  if (query.status) params.set("status", query.status)
  if (query.category) params.set("category", query.category)
  if (query.priority) params.set("priority", query.priority)
  const qs = params.toString()
  const payload = await apiFetch<Record<string, unknown>>(
    `/api/admin/tickets${qs ? `?${qs}` : ""}`,
  )
  return unwrapList<TicketRow>(payload, "tickets")
}

export async function getAdminTicket(id: string): Promise<TicketRow | null> {
  const payload = await apiFetch<Record<string, unknown>>(`/api/admin/tickets/${id}`)
  return unwrapItem<TicketRow>(payload, "ticket")
}

export async function updateAdminTicket(
  id: string,
  data: {
    status?: "open" | "in_progress" | "resolved" | "closed"
    priority?: "low" | "medium" | "high" | "urgent"
  },
): Promise<TicketRow> {
  const payload = await apiFetch<Record<string, unknown>>(`/api/admin/tickets/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  })
  const ticket = unwrapItem<TicketRow>(payload, "ticket")
  if (!ticket) {
    throw new Error("Update ticket response was empty")
  }
  return ticket
}
