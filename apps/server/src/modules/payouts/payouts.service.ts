import { desc, eq } from "drizzle-orm"
import { db } from "../../db"
import { payouts, users } from "../../db/schema"
import type {
  RequestPayoutInput,
  UpdatePayoutStatusInput,
} from "./payouts.schemas"

export type PayoutRow = {
  id: string
  userId: string
  userName: string
  amountToman: number
  amountUSD: number
  currency: string
  method: string
  accountDetails: Record<string, unknown>
  status: "pending" | "approved" | "rejected" | "completed"
  processedAt: string | null
  processedByName: string | null
  note: string | null
  createdAt: string
}

function toSafe(row: {
  id: string
  userId: string
  userName: string
  amountToman: number
  amountUSD: number
  currency: string
  method: string
  accountDetails: Record<string, unknown>
  status: string
  processedAt: string | null
  processedByName: string | null
  note: string | null
  createdAt: Date
}): PayoutRow {
  return {
    id: row.id,
    userId: row.userId,
    userName: row.userName,
    amountToman: row.amountToman,
    amountUSD: row.amountUSD,
    currency: row.currency,
    method: row.method,
    accountDetails: row.accountDetails,
    status: row.status as PayoutRow["status"],
    processedAt: row.processedAt,
    processedByName: row.processedByName,
    note: row.note,
    createdAt: row.createdAt.toISOString(),
  }
}

export async function requestPayout(
  userId: string,
  data: RequestPayoutInput,
): Promise<PayoutRow> {
  const [user] = await db
    .select({ nameFa: users.nameFa, nameEn: users.nameEn })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  const userName = user?.nameFa || user?.nameEn || ""

  const [row] = await db
    .insert(payouts)
    .values({
      userId,
      amountToman: data.amountToman ?? 0,
      amountUSD: data.amountUSD ?? 0,
      currency: data.currency,
      method: data.method,
      accountDetails: data.accountDetails,
    })
    .returning()

  if (!row) {
    throw new Error("Failed to create payout")
  }

  return toSafe({
    ...row,
    userName,
    processedByName: null,
  })
}

export async function listPayoutsForUser(userId: string): Promise<PayoutRow[]> {
  const rows = await db
    .select()
    .from(payouts)
    .where(eq(payouts.userId, userId))
    .orderBy(desc(payouts.createdAt))

  const [user] = await db
    .select({ nameFa: users.nameFa, nameEn: users.nameEn })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  const userName = user?.nameFa || user?.nameEn || ""

  const result: PayoutRow[] = []

  for (const row of rows) {
    let processedByName: string | null = null

    if (row.processedBy) {
      const [admin] = await db
        .select({ nameFa: users.nameFa, nameEn: users.nameEn })
        .from(users)
        .where(eq(users.id, row.processedBy))
        .limit(1)

      processedByName = admin?.nameFa || admin?.nameEn || null
    }

    result.push(
      toSafe({
        ...row,
        userName,
        processedByName,
      }),
    )
  }

  return result
}

export async function updatePayoutStatus(
  id: string,
  adminId: string,
  data: UpdatePayoutStatusInput,
): Promise<PayoutRow | null> {
  const [existing] = await db
    .select()
    .from(payouts)
    .where(eq(payouts.id, id))
    .limit(1)

  if (!existing) {
    return null
  }

  const now = new Date().toISOString().replace("T", " ").slice(0, 19)

  const [row] = await db
    .update(payouts)
    .set({
      status: data.status,
      processedAt: now,
      processedBy: adminId,
      note: data.note,
    })
    .where(eq(payouts.id, id))
    .returning()

  if (!row) {
    return null
  }

  const [user] = await db
    .select({ nameFa: users.nameFa, nameEn: users.nameEn })
    .from(users)
    .where(eq(users.id, row.userId))
    .limit(1)

  const userName = user?.nameFa || user?.nameEn || ""

  let processedByName: string | null = null

  if (row.processedBy) {
    const [admin] = await db
      .select({ nameFa: users.nameFa, nameEn: users.nameEn })
      .from(users)
      .where(eq(users.id, row.processedBy))
      .limit(1)

    processedByName = admin?.nameFa || admin?.nameEn || null
  }

  return toSafe({
    ...row,
    userName,
    processedByName,
  })
}
