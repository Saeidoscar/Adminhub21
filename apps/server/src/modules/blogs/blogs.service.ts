import { and, desc, eq, sql } from "drizzle-orm"
import { db } from "../../db"
import { blogs, users } from "../../db/schema"
import type {
  CreateBlogInput,
  UpdateBlogInput,
  ListBlogsQuery,
} from "./blogs.schemas"

export type BlogRow = {
  id: string
  authorId: string
  authorName: string
  title: string
  content: string
  coverUrl: string
  status: "draft" | "published" | "archived"
  views: number
  publishedAt: string
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
  publishedAt: string | null
  createdAt: Date
  updatedAt: Date
  authorName: string
}): BlogRow {
  return {
    id: row.id,
    authorId: row.authorId,
    authorName: row.authorName,
    title: row.title,
    content: row.content,
    coverUrl: row.coverUrl ?? "",
    status: row.status as BlogRow["status"],
    views: row.views,
    publishedAt: row.publishedAt ?? "",
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

export async function createBlog(
  userId: string,
  data: CreateBlogInput,
): Promise<BlogRow> {
  const [row] = await db
    .insert(blogs)
    .values({
      authorId: userId,
      title: data.title,
      content: data.content,
      coverUrl: data.coverUrl ?? null,
      status: data.status,
    })
    .returning()

  if (!row) {
    throw new Error("Failed to create blog")
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

export async function listBlogs(query: ListBlogsQuery): Promise<BlogRow[]> {
  const conditions = []

  if (query.status) {
    conditions.push(eq(blogs.status, query.status))
  }

  if (query.search) {
    const term = `%${query.search.replace(/%/g, "\\%")}%`
    conditions.push(
      sql`(${blogs.title} ILIKE ${term} OR ${blogs.content} ILIKE ${term})`,
    )
  }

  const rows = await db
    .select({
      id: blogs.id,
      authorId: blogs.authorId,
      title: blogs.title,
      content: blogs.content,
      coverUrl: blogs.coverUrl,
      status: blogs.status,
      views: blogs.views,
      publishedAt: blogs.publishedAt,
      createdAt: blogs.createdAt,
      updatedAt: blogs.updatedAt,
      authorName: sql<string>`${users.nameFa || users.nameEn}`,
    })
    .from(blogs)
    .innerJoin(users, eq(users.id, blogs.authorId))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(blogs.createdAt))

  return rows.map(toSafe)
}

export async function getBlogById(id: string): Promise<BlogRow | null> {
  const [row] = await db
    .select({
      id: blogs.id,
      authorId: blogs.authorId,
      title: blogs.title,
      content: blogs.content,
      coverUrl: blogs.coverUrl,
      status: blogs.status,
      views: blogs.views,
      publishedAt: blogs.publishedAt,
      createdAt: blogs.createdAt,
      updatedAt: blogs.updatedAt,
      authorName: sql<string>`${users.nameFa || users.nameEn}`,
    })
    .from(blogs)
    .innerJoin(users, eq(users.id, blogs.authorId))
    .where(eq(blogs.id, id))
    .limit(1)

  if (!row) return null
  return toSafe(row)
}

export async function updateBlog(
  id: string,
  userId: string,
  data: UpdateBlogInput,
): Promise<BlogRow> {
  const [existing] = await db
    .select()
    .from(blogs)
    .where(eq(blogs.id, id))
    .limit(1)

  if (!existing) {
    throw new Error("Blog not found")
  }

  if (existing.authorId !== userId) {
    throw new Error("Forbidden")
  }

  const [row] = await db
    .update(blogs)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(blogs.id, id))
    .returning()

  if (!row) {
    throw new Error("Blog not found")
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

export async function deleteBlog(id: string, userId: string): Promise<void> {
  const [existing] = await db
    .select()
    .from(blogs)
    .where(eq(blogs.id, id))
    .limit(1)

  if (!existing) {
    throw new Error("Blog not found")
  }

  if (existing.authorId !== userId) {
    throw new Error("Forbidden")
  }

  await db.delete(blogs).where(eq(blogs.id, id))
}
