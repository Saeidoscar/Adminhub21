import { and, desc, eq, sql } from "drizzle-orm"
import { db } from "../../db"
import { stories, users } from "../../db/schema"
import type {
  CreateStoryInput,
  UpdateStoryInput,
  ListStoriesQuery,
} from "./stories.schemas"

export type StoryRow = {
  id: string
  authorId: string
  authorName: string
  title: string
  content: string
  coverUrl: string
  status: "draft" | "published" | "archived"
  views: number
  createdAt: string
  updatedAt: string
}

function toSafe(row: {
  id: string
  authorId: string
  title: string
  content: string
  coverUrl: string | null
  status: string
  views: number
  createdAt: Date
  updatedAt: Date
  authorName: string
}): StoryRow {
  return {
    id: row.id,
    authorId: row.authorId,
    authorName: row.authorName,
    title: row.title,
    content: row.content,
    coverUrl: row.coverUrl ?? "",
    status: row.status as StoryRow["status"],
    views: row.views,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

export async function createStory(
  userId: string,
  data: CreateStoryInput,
): Promise<StoryRow> {
  const [row] = await db
    .insert(stories)
    .values({
      authorId: userId,
      title: data.title,
      content: data.content,
      coverUrl: data.coverUrl ?? null,
      status: data.status,
    })
    .returning()

  if (!row) {
    throw new Error("Failed to create story")
  }

  const [user] = await db
    .select({ nameEn: users.nameEn, nameFa: users.nameFa })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  const authorName = user?.nameFa || user?.nameEn || "Unknown"

  return toSafe({
    ...row,
    authorName,
  })
}

export async function listStories(
  query: ListStoriesQuery,
): Promise<StoryRow[]> {
  const conditions = []

  if (query.status) {
    conditions.push(eq(stories.status, query.status))
  }

  if (query.search) {
    const term = `%${query.search.replace(/%/g, "\\%")}%`
    conditions.push(
      sql`(${stories.title} ILIKE ${term} OR ${stories.content} ILIKE ${term})`,
    )
  }

  const rows = await db
    .select({
      id: stories.id,
      authorId: stories.authorId,
      title: stories.title,
      content: stories.content,
      coverUrl: stories.coverUrl,
      status: stories.status,
      views: stories.views,
      createdAt: stories.createdAt,
      updatedAt: stories.updatedAt,
      authorName: sql<string>`${users.nameFa || users.nameEn}`,
    })
    .from(stories)
    .innerJoin(users, eq(users.id, stories.authorId))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(stories.createdAt))

  return rows.map(toSafe)
}

export async function getStoryById(id: string): Promise<StoryRow | null> {
  const [row] = await db
    .select({
      id: stories.id,
      authorId: stories.authorId,
      title: stories.title,
      content: stories.content,
      coverUrl: stories.coverUrl,
      status: stories.status,
      views: stories.views,
      createdAt: stories.createdAt,
      updatedAt: stories.updatedAt,
      authorName: sql<string>`${users.nameFa || users.nameEn}`,
    })
    .from(stories)
    .innerJoin(users, eq(users.id, stories.authorId))
    .where(eq(stories.id, id))
    .limit(1)

  if (!row) return null
  return toSafe(row)
}

export async function updateStory(
  id: string,
  userId: string,
  data: UpdateStoryInput,
): Promise<StoryRow> {
  const [existing] = await db
    .select()
    .from(stories)
    .where(eq(stories.id, id))
    .limit(1)

  if (!existing) {
    throw new Error("Story not found")
  }

  if (existing.authorId !== userId) {
    throw new Error("Forbidden")
  }

  const [row] = await db
    .update(stories)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(stories.id, id))
    .returning()

  if (!row) {
    throw new Error("Story not found")
  }

  const [user] = await db
    .select({ nameEn: users.nameEn, nameFa: users.nameFa })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  const authorName = user?.nameFa || user?.nameEn || "Unknown"

  return toSafe({
    ...row,
    authorName,
  })
}

export async function deleteStory(id: string, userId: string): Promise<void> {
  const [existing] = await db
    .select()
    .from(stories)
    .where(eq(stories.id, id))
    .limit(1)

  if (!existing) {
    throw new Error("Story not found")
  }

  if (existing.authorId !== userId) {
    throw new Error("Forbidden")
  }

  await db.delete(stories).where(eq(stories.id, id))
}
