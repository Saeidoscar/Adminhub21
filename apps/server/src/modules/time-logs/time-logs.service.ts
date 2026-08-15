import { and, desc, eq, sql } from "drizzle-orm"
import { db } from "../../db"
import { cases, tasks, timeLogs, users } from "../../db/schema"
import type { CreateTimeLogInput, ListTimeLogsQuery } from "./time-logs.schemas"

export type TimeLogRow = {
  id: string
  userId: string
  userName: string
  caseId: string | null
  caseTitle: string
  taskId: string | null
  taskTitle: string
  description: string
  startedAt: string
  endedAt: string
  durationMinutes: number
  createdAt: string
}

function toSafe(row: {
  id: string
  userId: string
  userName: string
  caseId: string | null
  caseTitle: string
  taskId: string | null
  taskTitle: string
  description: string
  startedAt: string
  endedAt: string
  durationMinutes: number | null
  createdAt: Date
}): TimeLogRow {
  return {
    id: row.id,
    userId: row.userId,
    userName: row.userName,
    caseId: row.caseId,
    caseTitle: row.caseTitle,
    taskId: row.taskId,
    taskTitle: row.taskTitle,
    description: row.description,
    startedAt: row.startedAt,
    endedAt: row.endedAt,
    durationMinutes: row.durationMinutes ?? 0,
    createdAt: row.createdAt.toISOString(),
  }
}

function calculateDurationMinutes(startedAt: string, endedAt: string): number {
  const start = new Date(startedAt).getTime()
  const end = new Date(endedAt).getTime()
  if (isNaN(start) || isNaN(end) || end <= start) return 0
  return Math.round((end - start) / 60000)
}

export async function createTimeLog(
  userId: string,
  data: CreateTimeLogInput,
): Promise<TimeLogRow> {
  const durationMinutes = calculateDurationMinutes(data.startedAt, data.endedAt)

  const [row] = await db
    .insert(timeLogs)
    .values({
      userId,
      caseId: data.caseId,
      taskId: data.taskId,
      description: data.description,
      startedAt: data.startedAt,
      endedAt: data.endedAt,
      durationMinutes,
    })
    .returning()

  if (!row) {
    throw new Error("Failed to create time log")
  }

  const [user] = await db
    .select({ nameFa: users.nameFa, nameEn: users.nameEn })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  let caseTitle = ""
  if (row.caseId) {
    const [case_] = await db
      .select({ title: cases.title })
      .from(cases)
      .where(eq(cases.id, row.caseId))
      .limit(1)
    caseTitle = case_?.title || ""
  }

  let taskTitle = ""
  if (row.taskId) {
    const [task] = await db
      .select({ title: tasks.title })
      .from(tasks)
      .where(eq(tasks.id, row.taskId))
      .limit(1)
    taskTitle = task?.title || ""
  }

  return toSafe({
    ...row,
    userName: user?.nameFa || user?.nameEn || "",
    caseTitle,
    taskTitle,
  })
}

export async function listTimeLogsForUser(
  userId: string,
  query: ListTimeLogsQuery,
): Promise<TimeLogRow[]> {
  const conditions = [eq(timeLogs.userId, userId)]

  if (query.caseId) {
    conditions.push(eq(timeLogs.caseId, query.caseId))
  }
  if (query.taskId) {
    conditions.push(eq(timeLogs.taskId, query.taskId))
  }

  const rows = await db
    .select({
      id: timeLogs.id,
      userId: timeLogs.userId,
      userName: users.nameFa,
      caseId: timeLogs.caseId,
      caseTitle: cases.title,
      taskId: timeLogs.taskId,
      taskTitle: tasks.title,
      description: timeLogs.description,
      startedAt: timeLogs.startedAt,
      endedAt: timeLogs.endedAt,
      durationMinutes: timeLogs.durationMinutes,
      createdAt: timeLogs.createdAt,
    })
    .from(timeLogs)
    .innerJoin(users, eq(users.id, timeLogs.userId))
    .leftJoin(cases, eq(cases.id, timeLogs.caseId))
    .leftJoin(tasks, eq(tasks.id, timeLogs.taskId))
    .where(and(...conditions))
    .orderBy(desc(timeLogs.createdAt))

  return rows.map((row) =>
    toSafe({
      ...row,
      userName: row.userName || "",
      caseTitle: row.caseTitle || "",
      taskTitle: row.taskTitle || "",
    }),
  )
}

export async function getTimeLogById(
  id: string,
  userId: string,
): Promise<TimeLogRow | null> {
  const [row] = await db
    .select({
      id: timeLogs.id,
      userId: timeLogs.userId,
      userName: users.nameFa,
      caseId: timeLogs.caseId,
      caseTitle: cases.title,
      taskId: timeLogs.taskId,
      taskTitle: tasks.title,
      description: timeLogs.description,
      startedAt: timeLogs.startedAt,
      endedAt: timeLogs.endedAt,
      durationMinutes: timeLogs.durationMinutes,
      createdAt: timeLogs.createdAt,
    })
    .from(timeLogs)
    .innerJoin(users, eq(users.id, timeLogs.userId))
    .leftJoin(cases, eq(cases.id, timeLogs.caseId))
    .leftJoin(tasks, eq(tasks.id, timeLogs.taskId))
    .where(eq(timeLogs.id, id))
    .limit(1)

  if (!row || row.userId !== userId) {
    return null
  }

  return toSafe({
    ...row,
    userName: row.userName || "",
    caseTitle: row.caseTitle || "",
    taskTitle: row.taskTitle || "",
  })
}
