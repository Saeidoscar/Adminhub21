import { and, eq, ilike, desc } from "drizzle-orm"
import { db } from "../../db"
import { stories, blogs, comments } from "../../db/schema"
import { ApiError } from "../../lib/errors"

export async function listStoriesAdmin(input: {
  status?: string
  search?: string
}): Promise<typeof stories.$inferSelect[]> {
  const conditions = []
  if (input.status) {
    conditions.push(eq(stories.status, input.status))
  }
  if (input.search) {
    conditions.push(ilike(stories.title, `%${input.search}%`))
  }

  return db
    .select()
    .from(stories)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(stories.createdAt))
}

export async function listBlogsAdmin(input: {
  status?: string
  search?: string
}): Promise<typeof blogs.$inferSelect[]> {
  const conditions = []
  if (input.status) {
    conditions.push(eq(blogs.status, input.status))
  }
  if (input.search) {
    conditions.push(ilike(blogs.title, `%${input.search}%`))
  }

  return db
    .select()
    .from(blogs)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(blogs.createdAt))
}

export async function moderateStory(
  id: string,
  action: string,
): Promise<typeof stories.$inferSelect | null> {
  const statusMap: Record<string, string> = {
    approve: "published",
    reject: "archived",
    archive: "archived",
  }

  const newStatus = statusMap[action]
  if (!newStatus) {
    throw new ApiError(400, "Invalid action", "INVALID_ACTION")
  }

  const [updated] = await db
    .update(stories)
    .set({ status: newStatus, updatedAt: new Date() })
    .where(eq(stories.id, id))
    .returning()

  return updated ?? null
}

export async function moderateBlog(
  id: string,
  action: string,
): Promise<typeof blogs.$inferSelect | null> {
  const statusMap: Record<string, string> = {
    approve: "published",
    reject: "archived",
    archive: "archived",
  }

  const newStatus = statusMap[action]
  if (!newStatus) {
    throw new ApiError(400, "Invalid action", "INVALID_ACTION")
  }

  const [updated] = await db
    .update(blogs)
    .set({ status: newStatus, updatedAt: new Date() })
    .where(eq(blogs.id, id))
    .returning()

  return updated ?? null
}

export async function listCommentsAdmin(input: {
  postType?: string
}): Promise<typeof comments.$inferSelect[]> {
  const conditions = []
  if (input.postType) {
    conditions.push(eq(comments.postType, input.postType))
  }

  return db
    .select()
    .from(comments)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(comments.createdAt))
}

export async function deleteCommentAdmin(id: string): Promise<void> {
  const [comment] = await db
    .select()
    .from(comments)
    .where(eq(comments.id, id))
    .limit(1)

  if (!comment) {
    throw new ApiError(404, "Comment not found", "NOT_FOUND")
  }

  await db.delete(comments).where(eq(comments.id, id))
}
