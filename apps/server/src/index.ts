import { serve } from "@hono/node-server"
import { Hono } from "hono"
import { cors } from "hono/cors"
import { logger } from "hono/logger"
import { env, corsOrigins } from "./env"
import { onError } from "./lib/errors"
import { healthRoutes } from "./routes/health"
import { authRoutes } from "./modules/auth/auth.routes"
import { adminProfilesRoutes } from "./modules/admin-profiles/admin-profiles.routes"
import { packagesRoutes } from "./modules/packages/packages.routes"
import { offersRoutes } from "./modules/offers/offers.routes"
import { contractsRoutes } from "./modules/contracts/contracts.routes"
import { favoritesRoutes } from "./modules/favorites/favorites.routes"
import { catalogRoutes } from "./modules/catalog/catalog.routes"
import { publicContractsRoutes } from "./modules/public-contracts/public-contracts.routes"
import { reviewsRoutes } from "./modules/reviews/reviews.routes"
import { walletsRoutes } from "./modules/wallets/wallets.routes"
import { payoutsRoutes } from "./modules/payouts/payouts.routes"
import { ticketsRoutes } from "./modules/tickets/tickets.routes"
import { storiesRoutes } from "./modules/stories/stories.routes"
import { blogsRoutes } from "./modules/blogs/blogs.routes"
import { commentsRoutes } from "./modules/comments/comments.routes"
import { aiRoutes } from "./modules/ai/ai.routes"
import { casesRoutes } from "./modules/cases/cases.routes"
import { tasksRoutes } from "./modules/tasks/tasks.routes"
import { eventsRoutes } from "./modules/events/events.routes"
import { timeLogsRoutes } from "./modules/time-logs/time-logs.routes"
import { portfolioRoutes } from "./modules/portfolio/portfolio.routes"
import { affiliateRoutes } from "./modules/affiliate/affiliate.routes"
import { adminDashboardRoutes } from "./modules/admin-dashboard/admin-dashboard.routes"
import { adminUsersRoutes } from "./modules/admin-users/admin-users.routes"
import { adminTicketsRoutes } from "./modules/admin-tickets/admin-tickets.routes"
import { adminContentRoutes } from "./modules/admin-content/admin-content.routes"

const app = new Hono()

app.onError(onError)

app.use("*", logger())

app.use(
  "*",
  cors({
    origin:
      env.NODE_ENV === "production"
        ? corsOrigins
        : (origin: string) => origin,
    credentials: true,
  }),
)

app.get("/", (c) =>
  c.json({ name: "AdminHub API", version: "0.1.0", docs: "/api/health" }),
)

app.route("/api", healthRoutes)
app.route("/api/auth", authRoutes)
app.route("/api/admin-profiles", adminProfilesRoutes)
app.route("/api/packages", packagesRoutes)
app.route("/api/offers", offersRoutes)
app.route("/api/contracts", contractsRoutes)
app.route("/api/favorites", favoritesRoutes)
app.route("/api/public/contracts", publicContractsRoutes)
app.route("/api/tickets", ticketsRoutes)
app.route("/api/stories", storiesRoutes)
app.route("/api/blogs", blogsRoutes)
app.route("/api/comments", commentsRoutes)
app.route("/api/ai", aiRoutes)
app.route("/api/cases", casesRoutes)
app.route("/api/tasks", tasksRoutes)
app.route("/api/events", eventsRoutes)
app.route("/api/time-logs", timeLogsRoutes)
app.route("/api/portfolio", portfolioRoutes)
app.route("/api/reviews", reviewsRoutes)
app.route("/api/wallets", walletsRoutes)
app.route("/api/payouts", payoutsRoutes)
app.route("/api", catalogRoutes)
app.route("/api/affiliate", affiliateRoutes)
app.route("/api/admin/dashboard", adminDashboardRoutes)
app.route("/api/admin/users", adminUsersRoutes)
app.route("/api/admin/tickets", adminTicketsRoutes)
app.route("/api/admin/content", adminContentRoutes)

const port = env.PORT

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`[adminhub-api] listening on http://localhost:${info.port}`)
})
