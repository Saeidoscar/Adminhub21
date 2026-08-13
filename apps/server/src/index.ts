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
app.route("/api", catalogRoutes)

const port = env.PORT

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`[adminhub-api] listening on http://localhost:${info.port}`)
})
