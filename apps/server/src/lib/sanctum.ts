import { createHash, randomBytes } from "crypto"
import { eq } from "drizzle-orm"
import { db } from "../db"
import { apiTokens } from "../db/schema"

export type TokenAbility = "*" | string

export interface TokenRecord {
  id: string
  userId: string
  name: string
  abilities: TokenAbility[]
  lastUsedAt: Date | null
  createdAt: Date
}

export function generatePlainToken(): string {
  return `adminhub_${randomBytes(32).toString("hex")}`
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex")
}

export async function createApiToken(
  userId: string,
  name = "default",
  abilities: TokenAbility[] = ["*"],
): Promise<string> {
  const plain = generatePlainToken()
  const hashed = hashToken(plain)

  await db.insert(apiTokens).values({
    userId,
    name,
    token: hashed,
    abilities,
  })

  return plain
}

export async function validateApiToken(
  plain: string,
): Promise<TokenRecord | null> {
  const hashed = hashToken(plain)

  const [row] = await db
    .select()
    .from(apiTokens)
    .where(eq(apiTokens.token, hashed))
    .limit(1)

  if (!row || row.revokedAt) {
    return null
  }

  await db
    .update(apiTokens)
    .set({ lastUsedAt: new Date() })
    .where(eq(apiTokens.id, row.id))

  return {
    id: row.id,
    userId: row.userId,
    name: row.name,
    abilities: row.abilities,
    lastUsedAt: row.lastUsedAt,
    createdAt: row.createdAt,
  }
}

export async function revokeApiToken(plain: string): Promise<boolean> {
  const hashed = hashToken(plain)

  const [row] = await db
    .select()
    .from(apiTokens)
    .where(eq(apiTokens.token, hashed))
    .limit(1)

  if (!row || row.revokedAt) {
    return false
  }

  await db
    .update(apiTokens)
    .set({ revokedAt: new Date() })
    .where(eq(apiTokens.id, row.id))

  return true
}
