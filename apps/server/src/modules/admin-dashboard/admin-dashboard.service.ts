import { eq, sql } from "drizzle-orm"
import { db } from "../../db"
import {
  adminProfiles,
  contracts,
  packages,
  reviews,
  users,
} from "../../db/schema"
import type { DashboardStats } from "./admin-dashboard.schemas"

export async function getDashboardStats(): Promise<DashboardStats> {
  const [usersCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
  const [adminsCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .where(eq(users.role, "admin"))
  const [employersCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .where(eq(users.role, "employer"))
  const [contractsCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(contracts)
  const [activeContractsCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(contracts)
    .where(eq(contracts.status, "active"))
  const [revenueRow] = await db
    .select({
      toman: sql<number>`coalesce(sum(${contracts.amountToman}), 0)`,
      usd: sql<number>`coalesce(sum(${contracts.amountUSD}), 0)`,
    })
    .from(contracts)
  const [packagesCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(packages)
  const [reviewsCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(reviews)
  const [ratingRow] = await db
    .select({ avg: sql<number>`coalesce(avg(${reviews.rating}), 0)` })
    .from(reviews)

  return {
    totalUsers: Number(usersCount.count),
    totalAdmins: Number(adminsCount.count),
    totalEmployers: Number(employersCount.count),
    totalContracts: Number(contractsCount.count),
    activeContracts: Number(activeContractsCount.count),
    totalRevenueToman: Number(revenueRow.toman),
    totalRevenueUSD: Number(revenueRow.usd),
    totalPackages: Number(packagesCount.count),
    totalReviews: Number(reviewsCount.count),
    avgRating: Number(ratingRow.avg),
  }
}
