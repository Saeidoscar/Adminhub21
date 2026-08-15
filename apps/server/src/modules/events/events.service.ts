import { and, desc, eq, sql } from "drizzle-orm"
import { db } from "../../db"
import { events, users } from "../../db/schema"
import type {
  CreateEventInput,
  UpdateEventInput,
  ListEventsQuery,
} from "./events.schemas"

export type EventRow = {
  id: string
  userId: string
  title: string
  description: string
  startAt: string
  endAt: string
  allDay: boolean
  color: string
  createdAt: string
  updatedAt: string
}

function toSafe(row: {
  id: string
  userId: string
  title: string
  description: string
  startAt: string
  endAt: string
  allDay: boolean
  color: string
  createdAt: Date
  updatedAt: Date
}): EventRow {
  return {
    id: row.id,
    userId: row.userId,
    title: row.title,
    description: row.description,
    startAt: row.startAt,
    endAt: row.endAt,
    allDay: row.allDay,
    color: row.color,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

export async function createEvent(
  userId: string,
  data: CreateEventInput,
): Promise<EventRow> {
  const [row] = await db
    .insert(events)
    .values({
      userId,
      title: data.title,
      description: data.description ?? "",
      startAt: data.startAt,
      endAt: data.endAt,
      allDay: data.allDay,
      color: data.color,
    })
    .returning()

  if (!row) {
    throw new Error("Failed to create event")
  }

  return toSafe(row)
}

export async function listEventsForUser(
  userId: string,
  query: ListEventsQuery,
): Promise<EventRow[]> {
  const conditions = [eq(events.userId, userId)]

  if (query.from) {
    conditions.push(sql`${events.startAt} >= ${query.from}`)
  }
  if (query.to) {
    conditions.push(sql`${events.endAt} <= ${query.to}`)
  }

  const rows = await db
    .select()
    .from(events)
    .where(and(...conditions))
    .orderBy(desc(events.startAt))

  return rows.map(toSafe)
}

export async function getEventById(
  id: string,
  userId: string,
): Promise<EventRow | null> {
  const [row] = await db.select().from(events).where(eq(events.id, id)).limit(1)

  if (!row || row.userId !== userId) {
    return null
  }

  return toSafe(row)
}

export async function updateEvent(
  id: string,
  userId: string,
  data: UpdateEventInput,
): Promise<EventRow> {
  const [row] = await db
    .update(events)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(events.id, id))
    .returning()

  if (!row || row.userId !== userId) {
    throw new Error("Event not found")
  }

  return toSafe(row)
}

export async function deleteEvent(id: string, userId: string): Promise<void> {
  const [row] = await db.select().from(events).where(eq(events.id, id)).limit(1)

  if (!row || row.userId !== userId) {
    throw new Error("Event not found")
  }

  await db.delete(events).where(eq(events.id, id))
}
