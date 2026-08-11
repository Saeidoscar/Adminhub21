import { z } from "zod"

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(8787),
  DATABASE_URL: z
    .string()
    .default("postgres://postgres:postgres@localhost:5432/adminhub"),
  JWT_ACCESS_SECRET: z
    .string()
    .min(16)
    .default("dev-only-access-secret-change-me"),
  JWT_REFRESH_SECRET: z
    .string()
    .min(16)
    .default("dev-only-refresh-secret-change-me"),
  CORS_ORIGINS: z
    .string()
    .default("http://localhost:8443,http://localhost:5173"),
})

export const env = envSchema.parse(process.env)

export const corsOrigins = env.CORS_ORIGINS.split(",")
  .map((o) => o.trim())
  .filter(Boolean)
