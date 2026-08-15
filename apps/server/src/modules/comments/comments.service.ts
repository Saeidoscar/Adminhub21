import { and, desc, eq, sql } from "drizzle-orm"
import { db } from "../../db"
import { comments, users } from "../../db/schema"
import type { CreateCommentInput, ListCommentsQuery } from "./comments.schemas"

export type CommentRow = {
  id: string
  postId: string
  postType: "story" | "blog"
  authorId: string
  authorName: string
  parentId: string
  body: string
  createdAt: string
}

function toSafe(row: {
  id: string
  postId: string
  postType: string
  authorId: string
  body: string
  parentId: string | null
  createdAt: Date
  authorName: string
}): CommentRow {
  return {
    id: row.id,
    postId: row.postId,
    postType: row.postType as CommentRow["postType"],
    authorId: row.authorId,
    authorName: row.authorName,
    parentId: row.parentId ?? "",
    body: row.body,
    createdAt: row.createdAt.toISOString(),
  }
}

export async function createComment(
  userId: string,
  data: CreateCommentInput,
): Promise<CommentRow> {
  const [row] = (await db
    .insert(comments)
    .values({
      postId: data.postId,
      postType: data.postType,
      authorId: userId,
      parentId: data.parentId,
      body: data.body,
    })
    .returning()) as {
    id: string
    postId: string
    postType: string
    authorId: string
    body: string
    parentId: string | null
    createdAt: Date
  }[]

  if (!row) {
    throw new Error("Failed to create comment")
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

export async function listComments(
  query: ListCommentsQuery,
): Promise<CommentRow[]> {
  const rows = await db
    .select({
      id: comments.id,
      postId: comments.postId,
      postType: comments.postType,
      authorId: comments.authorId,
      body: comments.body,
      parentId: comments.parentId,
      createdAt: comments.createdAt,
      authorName: sql<string>`${users.nameFa || users.nameEn}`,
    })
    .from(comments)
    .innerJoin(users, eq(users.id, comments.authorId))
    .where(
      and(
        eq(comments.postId, query.postId),
        eq(comments.postType, query.postType),
      ),
    )
    .orderBy(comments.createdAt)

  return rows.map(toSafe)
}

export async function deleteComment(id: string, userId: string): Promise<void> {
  const [existing] = await db
    .select()
    .from(comments)
    .where(eq(comments.id, id))
    .limit(1)

  if (!existing) {
    throw new Error("Comment not found")
  }

  if (existing.authorId !== userId) {
    throw new Error("Forbidden")
  }

  await db.delete(comments).where(eq(comments.id, id))
}
