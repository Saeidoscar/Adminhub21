import { desc, eq, sql } from "drizzle-orm"
import { db } from "../../db"
import { ticketMessages, tickets, users } from "../../db/schema"
import type {
  CreateTicketInput,
  CreateTicketMessageInput,
  UpdateTicketInput,
} from "./tickets.schemas"

export type TicketRow = {
  id: string
  userId: string
  userName: string
  userEmail: string
  subject: string
  category: string
  priority: "low" | "medium" | "high" | "urgent"
  status: "open" | "in_progress" | "resolved" | "closed"
  createdAt: string
  updatedAt: string
}

export type TicketMessageRow = {
  id: string
  ticketId: string
  senderId: string
  senderName: string
  body: string
  createdAt: string
}

function toSafeTicket(row: {
  id: string
  userId: string
  subject: string
  category: string
  priority: string
  status: string
  createdAt: Date
  updatedAt: Date
  userName: string
  userEmail: string
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

function toSafeTicketMessage(row: {
  id: string
  ticketId: string
  senderId: string
  body: string
  createdAt: Date
  senderName: string
}): TicketMessageRow {
  return {
    id: row.id,
    ticketId: row.ticketId,
    senderId: row.senderId,
    senderName: row.senderName,
    body: row.body,
    createdAt: row.createdAt.toISOString(),
  }
}

export async function createTicket(
  userId: string,
  data: CreateTicketInput,
): Promise<TicketRow> {
  const [row] = await db
    .insert(tickets)
    .values({
      userId,
      subject: data.subject,
      category: data.category,
      priority: data.priority,
    })
    .returning()

  if (!row) {
    throw new Error("Failed to create ticket")
  }

  const [user] = await db
    .select({ nameEn: users.nameEn, nameFa: users.nameFa, email: users.email })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  const userName = user?.nameFa || user?.nameEn || "Unknown"
  const userEmail = user?.email || ""

  return toSafeTicket({
    ...row,
    userName,
    userEmail,
  })
}

export async function listTicketsForUser(userId: string): Promise<TicketRow[]> {
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
    .where(eq(tickets.userId, userId))
    .orderBy(desc(tickets.createdAt))

  return rows.map(toSafeTicket)
}

export async function getTicketById(
  id: string,
  userId: string,
  role: string,
): Promise<TicketRow | null> {
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

  if (role !== "admin" && row.userId !== userId) {
    return null
  }

  return toSafeTicket(row)
}

export async function updateTicket(
  id: string,
  data: UpdateTicketInput,
): Promise<TicketRow> {
  const [row] = await db
    .update(tickets)
    .set({
      ...data,
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

  const userName = user?.nameFa || user?.nameEn || "Unknown"
  const userEmail = user?.email || ""

  return toSafeTicket({
    ...row,
    userName,
    userEmail,
  })
}

export async function createTicketMessage(
  ticketId: string,
  senderId: string,
  body: string,
): Promise<TicketMessageRow> {
  const [row] = await db
    .insert(ticketMessages)
    .values({
      ticketId,
      senderId,
      body,
    })
    .returning()

  if (!row) {
    throw new Error("Failed to create ticket message")
  }

  const [user] = await db
    .select({ nameEn: users.nameEn, nameFa: users.nameFa })
    .from(users)
    .where(eq(users.id, senderId))
    .limit(1)

  const senderName = user?.nameFa || user?.nameEn || "Unknown"

  return toSafeTicketMessage({
    ...row,
    senderName,
  })
}

export async function listTicketMessages(
  ticketId: string,
): Promise<TicketMessageRow[]> {
  const rows = await db
    .select({
      id: ticketMessages.id,
      ticketId: ticketMessages.ticketId,
      senderId: ticketMessages.senderId,
      body: ticketMessages.body,
      createdAt: ticketMessages.createdAt,
      senderName: sql<string>`${users.nameFa || users.nameEn}`,
    })
    .from(ticketMessages)
    .innerJoin(users, eq(users.id, ticketMessages.senderId))
    .where(eq(ticketMessages.ticketId, ticketId))
    .orderBy(ticketMessages.createdAt)

  return rows.map(toSafeTicketMessage)
}
