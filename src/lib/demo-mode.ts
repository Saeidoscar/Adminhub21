import type { SafeUser } from "@adminhub/shared"

/**
 * Demo mode is enabled when the app runs with `vite --mode demo`.
 * In that mode the Vite middleware in `dev/demo-api-plugin.ts` answers all
 * `/api` and `/ai` requests from an in-memory dataset, and the session is
 * signed in automatically so every screen can be explored immediately.
 */
export const isDemoMode = import.meta.env.VITE_DEMO_MODE === "true"

export const DEMO_TOKEN = "adminhub-demo-token"
export const DEMO_ROLE_KEY = "adminhub_demo_role"
export const DEMO_SIGNED_OUT_KEY = "adminhub_demo_signed_out"

export type DemoRole = "employer" | "admin"

const common = {
  phoneVerified: true,
  phone: null,
  photo: null,
  createdAt: "2026-01-12T09:00:00.000Z",
} satisfies Partial<SafeUser>

export const DEMO_USERS: Record<DemoRole, SafeUser> = {
  employer: {
    ...common,
    id: "user-employer-1",
    email: "employer@adminhub.ir",
    role: "employer",
    nameEn: "Ali Rezaei",
    nameFa: "علی رضایی",
    phone: "+98 912 345 6789",
  },
  admin: {
    ...common,
    id: "user-admin-1",
    email: "sarah@adminhub.ir",
    role: "admin",
    nameEn: "Sarah Johnson",
    nameFa: "سارا جانسون",
    phone: "+98 912 123 4567",
  },
}

export function readStoredDemoRole(): DemoRole {
  if (typeof window === "undefined") return "employer"
  const stored = window.localStorage.getItem(DEMO_ROLE_KEY)
  return stored === "admin" ? "admin" : "employer"
}
