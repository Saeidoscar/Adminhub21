import { and, desc, eq, sql } from "drizzle-orm"
import { db } from "../../db"
import { editors, tools, vibeCoders } from "../../db/schema"

export type ToolRow = {
  id: string
  name: string
  category: string
  icon: string
  rating: number
  reviews: number
  popular: boolean
  priceToman: number
  priceUSD: number
  descEn: string
  descFa: string
  active: boolean
  createdAt: string
  updatedAt: string
}

export type EditorRow = {
  id: string
  nameEn: string
  nameFa: string
  photo: string
  specialty: string
  rating: number
  reviews: number
  projects: number
  delivery: string
  rateToman: number
  rateUSD: number
  bioEn: string
  bioFa: string
  active: boolean
  createdAt: string
  updatedAt: string
}

export type VibeCoderRow = {
  id: string
  nameEn: string
  nameFa: string
  photo: string
  stack: string
  rating: number
  reviews: number
  projects: number
  rateToman: number
  rateUSD: number
  delivery: string
  bioEn: string
  bioFa: string
  active: boolean
  createdAt: string
  updatedAt: string
}

function toToolSafe(row: {
  id: string
  name: string
  category: string
  icon: string
  rating: number
  reviews: number
  popular: boolean
  priceToman: number
  priceUSD: number
  descEn: string
  descFa: string
  active: boolean
  createdAt: Date
  updatedAt: Date
}): ToolRow {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    icon: row.icon,
    rating: Number(row.rating),
    reviews: row.reviews,
    popular: row.popular,
    priceToman: row.priceToman,
    priceUSD: row.priceUSD,
    descEn: row.descEn,
    descFa: row.descFa,
    active: row.active,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

function toEditorSafe(row: {
  id: string
  nameEn: string
  nameFa: string
  photo: string
  specialty: string
  rating: number
  reviews: number
  projects: number
  delivery: string
  rateToman: number
  rateUSD: number
  bioEn: string
  bioFa: string
  active: boolean
  createdAt: Date
  updatedAt: Date
}): EditorRow {
  return {
    id: row.id,
    nameEn: row.nameEn,
    nameFa: row.nameFa,
    photo: row.photo,
    specialty: row.specialty,
    rating: Number(row.rating),
    reviews: row.reviews,
    projects: row.projects,
    delivery: row.delivery,
    rateToman: row.rateToman,
    rateUSD: row.rateUSD,
    bioEn: row.bioEn,
    bioFa: row.bioFa,
    active: row.active,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

function toVibeCoderSafe(row: {
  id: string
  nameEn: string
  nameFa: string
  photo: string
  stack: string
  rating: number
  reviews: number
  projects: number
  rateToman: number
  rateUSD: number
  delivery: string
  bioEn: string
  bioFa: string
  active: boolean
  createdAt: Date
  updatedAt: Date
}): VibeCoderRow {
  return {
    id: row.id,
    nameEn: row.nameEn,
    nameFa: row.nameFa,
    photo: row.photo,
    stack: row.stack,
    rating: Number(row.rating),
    reviews: row.reviews,
    projects: row.projects,
    rateToman: row.rateToman,
    rateUSD: row.rateUSD,
    delivery: row.delivery,
    bioEn: row.bioEn,
    bioFa: row.bioFa,
    active: row.active,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

export async function listTools(query: {
  category?: string
  popular?: boolean
  minRating?: number
  search?: string
}): Promise<ToolRow[]> {
  const whereClauses = [eq(tools.active, true)]

  if (query.category) {
    whereClauses.push(eq(tools.category, query.category))
  }

  if (query.popular !== undefined) {
    whereClauses.push(eq(tools.popular, query.popular))
  }

  if (query.minRating !== undefined) {
    whereClauses.push(sql`${tools.rating} >= ${query.minRating}`)
  }

  if (query.search) {
    const term = `%${query.search.replace(/%/g, "\\%")}%`
    whereClauses.push(
      sql`(${tools.name} ILIKE ${term} OR ${tools.descEn} ILIKE ${term} OR ${tools.descFa} ILIKE ${term})`,
    )
  }

  const rows = await db
    .select({
      id: tools.id,
      name: tools.name,
      category: tools.category,
      icon: tools.icon,
      rating: tools.rating,
      reviews: tools.reviews,
      popular: tools.popular,
      priceToman: tools.priceToman,
      priceUSD: tools.priceUSD,
      descEn: tools.descEn,
      descFa: tools.descFa,
      active: tools.active,
      createdAt: tools.createdAt,
      updatedAt: tools.updatedAt,
    })
    .from(tools)
    .where(and(...whereClauses))
    .orderBy(desc(tools.popular), desc(tools.rating), desc(tools.reviews))

  return rows.map(toToolSafe)
}

export async function listEditors(query: {
  specialty?: string
  minRating?: number
  search?: string
}): Promise<EditorRow[]> {
  const whereClauses = [eq(editors.active, true)]

  if (query.specialty) {
    whereClauses.push(eq(editors.specialty, query.specialty))
  }

  if (query.minRating !== undefined) {
    whereClauses.push(sql`${editors.rating} >= ${query.minRating}`)
  }

  if (query.search) {
    const term = `%${query.search.replace(/%/g, "\\%")}%`
    whereClauses.push(
      sql`(${editors.nameEn} ILIKE ${term} OR ${editors.nameFa} ILIKE ${term} OR ${editors.bioEn} ILIKE ${term} OR ${editors.bioFa} ILIKE ${term})`,
    )
  }

  const rows = await db
    .select({
      id: editors.id,
      nameEn: editors.nameEn,
      nameFa: editors.nameFa,
      photo: editors.photo,
      specialty: editors.specialty,
      rating: editors.rating,
      reviews: editors.reviews,
      projects: editors.projects,
      delivery: editors.delivery,
      rateToman: editors.rateToman,
      rateUSD: editors.rateUSD,
      bioEn: editors.bioEn,
      bioFa: editors.bioFa,
      active: editors.active,
      createdAt: editors.createdAt,
      updatedAt: editors.updatedAt,
    })
    .from(editors)
    .where(and(...whereClauses))
    .orderBy(desc(editors.rating), desc(editors.reviews))

  return rows.map(toEditorSafe)
}

export async function listVibeCoders(query: {
  stack?: string
  minRating?: number
  search?: string
}): Promise<VibeCoderRow[]> {
  const whereClauses = [eq(vibeCoders.active, true)]

  if (query.stack) {
    whereClauses.push(eq(vibeCoders.stack, query.stack))
  }

  if (query.minRating !== undefined) {
    whereClauses.push(sql`${vibeCoders.rating} >= ${query.minRating}`)
  }

  if (query.search) {
    const term = `%${query.search.replace(/%/g, "\\%")}%`
    whereClauses.push(
      sql`(${vibeCoders.nameEn} ILIKE ${term} OR ${vibeCoders.nameFa} ILIKE ${term} OR ${vibeCoders.bioEn} ILIKE ${term} OR ${vibeCoders.bioFa} ILIKE ${term})`,
    )
  }

  const rows = await db
    .select({
      id: vibeCoders.id,
      nameEn: vibeCoders.nameEn,
      nameFa: vibeCoders.nameFa,
      photo: vibeCoders.photo,
      stack: vibeCoders.stack,
      rating: vibeCoders.rating,
      reviews: vibeCoders.reviews,
      projects: vibeCoders.projects,
      rateToman: vibeCoders.rateToman,
      rateUSD: vibeCoders.rateUSD,
      delivery: vibeCoders.delivery,
      bioEn: vibeCoders.bioEn,
      bioFa: vibeCoders.bioFa,
      active: vibeCoders.active,
      createdAt: vibeCoders.createdAt,
      updatedAt: vibeCoders.updatedAt,
    })
    .from(vibeCoders)
    .where(and(...whereClauses))
    .orderBy(desc(vibeCoders.rating), desc(vibeCoders.reviews))

  return rows.map(toVibeCoderSafe)
}
