import { and, desc, eq, sql } from "drizzle-orm"
import { db } from "../../db"
import { ticketMessages, tickets, users } from "../../db/schema"
import type { ListAdminTicketsQuery } from "./admin-tickets.schemas"
import type { TicketRow } from "../../modules/tickets/tickets.service"

function toSafe(row: {
  id: string
  userId: string
  userName: string
  userEmail: string
  subject: string
  category: string
  priority: string
  status: string
  createdAt: Date
  updatedAt: Date
}): TicketRow {
  return {
    id: row.id,
    userId: row.userId,
    userName: row.userName,
    userEmail: row.userEmail,
    subject: row.subject,
    category: row.category,
    priority: row.priority as TicketRow["priority"],
    status: row.status as TicketRow["status"],
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

export async function listAllTickets(
  query: ListAdminTicketsQuery,
): Promise<TicketRow[]> {
  const conditions = []

  if (query.status) {
    conditions.push(eq(tickets.status, query.status))
  }

  if (query.category) {
    conditions.push(eq(tickets.category, query.category))
  }

  if (query.priority) {
    conditions.push(eq(tickets.priority, query.priority))
  }

  const rows = await db
    .select({
      id: tickets.id,
      userId: tickets.userId,
      subject: tickets.subject,
      category: tickets.category,
      priority: tickets.priority,
      status: tickets.status,
      createdAt: tickets.createdAt,
      updatedAt: tickets.updatedAt,
      userName: sql<string>`${users.nameFa || users.nameEn}`,
      userEmail: users.email,
    })
    .from(tickets)
    .innerJoin(users, eq(users.id, tickets.userId))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(tickets.createdAt))

  return rows.map(toSafe)
}

export async function getTicketById(id: string): Promise<TicketRow | null> {
  const [row] = await db
    .select({
      id: tickets.id,
      userId: tickets.userId,
      subject: tickets.subject,
      category: tickets.category,
      priority: tickets.priority,
      status: tickets.status,
      createdAt: tickets.createdAt,
      updatedAt: tickets.updatedAt,
      userName: sql<string>`${users.nameFa || users.nameEn}`,
      userEmail: users.email,
    })
    .from(tickets)
    .innerJoin(users, eq(users.id, tickets.userId))
    .where(eq(tickets.id, id))
    .limit(1)

  if (!row) return null
  return toSafe(row)
}

export async function updateTicketStatus(
  id: string,
  data: { status?: string; priority?: string },
): Promise<TicketRow> {
  const [row] = await db
    .update(tickets)
    .set({
      ...(data.status ? { status: data.status } : {}),
      ...(data.priority ? { priority: data.priority } : {}),
      updatedAt: new Date(),
    })
    .where(eq(tickets.id, id))
    .returning()

  if (!row) {
    throw new Error("Ticket not found")
  }

  const [user] = await db
    .select({ nameEn: users.nameEn, nameFa: users.nameFa, email: users.email })
    .from(users)
    .where(eq(users.id, row.userId))
    .limit(1)

  return toSafe({
    id: row.id,
    userId: row.userId,
    subject: row.subject,
    category: row.category,
    priority: row.priority,
    status: row.status,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    userName: `${user?.nameFa || user?.nameEn || ""}`.trim() || "Unknown",
    userEmail: user?.email || "",
  })
}
