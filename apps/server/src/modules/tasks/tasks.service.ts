import { desc, eq } from "drizzle-orm"
import { db } from "../../db"
import { cases, tasks, users } from "../../db/schema"
import type { CreateTaskInput, UpdateTaskInput } from "./tasks.schemas"

export type TaskRow = {
  id: string
  caseId: string
  caseTitle: string
  assignedTo: string | null
  assignedName: string
  title: string
  description: string
  status: "todo" | "in_progress" | "done" | "blocked"
  priority: string
  dueDate: string | null
  createdAt: string
  updatedAt: string
}

function toSafe(row: {
  id: string
  caseId: string
  caseTitle: string
  assignedTo: string | null
  assignedName: string
  title: string
  description: string
  status: string
  priority: string
  dueDate: string | null
  createdAt: Date
  updatedAt: Date
}): TaskRow {
  return {
    id: row.id,
    caseId: row.caseId,
    caseTitle: row.caseTitle,
    assignedTo: row.assignedTo,
    assignedName: row.assignedName,
    title: row.title,
    description: row.description,
    status: row.status as TaskRow["status"],
    priority: row.priority,
    dueDate: row.dueDate,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

export async function createTask(data: CreateTaskInput): Promise<TaskRow> {
  const [row] = await db
    .insert(tasks)
    .values({
      caseId: data.caseId,
      title: data.title,
      description: data.description,
      assignedTo: data.assignedTo,
      status: data.status,
      priority: data.priority,
      dueDate: data.dueDate,
    })
    .returning()

  if (!row) {
    throw new Error("Failed to create task")
  }

  const [case_] = await db
    .select({ title: cases.title })
    .from(cases)
    .where(eq(cases.id, data.caseId))
    .limit(1)

  let assignedName = ""
  if (row.assignedTo) {
    const [user] = await db
      .select({ nameFa: users.nameFa, nameEn: users.nameEn })
      .from(users)
      .where(eq(users.id, row.assignedTo))
      .limit(1)
    assignedName = user?.nameFa || user?.nameEn || ""
  }

  return toSafe({
    ...row,
    caseTitle: case_?.title || "",
    assignedName,
  })
}

export async function listTasksForCase(caseId: string): Promise<TaskRow[]> {
  const rows = await db
    .select({
      id: tasks.id,
      caseId: tasks.caseId,
      caseTitle: cases.title,
      assignedTo: tasks.assignedTo,
      assignedName: users.nameFa,
      title: tasks.title,
      description: tasks.description,
      status: tasks.status,
      priority: tasks.priority,
      dueDate: tasks.dueDate,
      createdAt: tasks.createdAt,
      updatedAt: tasks.updatedAt,
    })
    .from(tasks)
    .innerJoin(cases, eq(cases.id, tasks.caseId))
    .leftJoin(users, eq(users.id, tasks.assignedTo))
    .where(eq(tasks.caseId, caseId))
    .orderBy(desc(tasks.createdAt))

  return rows.map((row) =>
    toSafe({
      ...row,
      assignedName: row.assignedName || "",
    }),
  )
}

export async function getTaskById(id: string): Promise<TaskRow | null> {
  const [row] = await db
    .select({
      id: tasks.id,
      caseId: tasks.caseId,
      caseTitle: cases.title,
      assignedTo: tasks.assignedTo,
      assignedName: users.nameFa,
      title: tasks.title,
      description: tasks.description,
      status: tasks.status,
      priority: tasks.priority,
      dueDate: tasks.dueDate,
      createdAt: tasks.createdAt,
      updatedAt: tasks.updatedAt,
    })
    .from(tasks)
    .innerJoin(cases, eq(cases.id, tasks.caseId))
    .leftJoin(users, eq(users.id, tasks.assignedTo))
    .where(eq(tasks.id, id))
    .limit(1)

  if (!row) return null

  return toSafe({
    ...row,
    assignedName: row.assignedName || "",
  })
}

export async function updateTask(
  id: string,
  data: UpdateTaskInput,
): Promise<TaskRow> {
  const [row] = await db
    .update(tasks)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(tasks.id, id))
    .returning()

  if (!row) {
    throw new Error("Task not found")
  }

  const [case_] = await db
    .select({ title: cases.title })
    .from(cases)
    .where(eq(cases.id, row.caseId))
    .limit(1)

  let assignedName = ""
  if (row.assignedTo) {
    const [user] = await db
      .select({ nameFa: users.nameFa, nameEn: users.nameEn })
      .from(users)
      .where(eq(users.id, row.assignedTo))
      .limit(1)
    assignedName = user?.nameFa || user?.nameEn || ""
  }

  return toSafe({
    ...row,
    caseTitle: case_?.title || "",
    assignedName,
  })
}
