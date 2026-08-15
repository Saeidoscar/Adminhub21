import authRoute from "./authRoute"
import type { Routes } from "@/@types/routes"

const protectedMeta = {
  pageBackgroundType: "default" as const,
  pageContainerType: "contained" as const,
  footer: false,
}

export const protectedRoutes: Routes = {
  "/home": { key: "dashboard", authority: ["admin"], meta: protectedMeta },
  "/users": { key: "users", authority: ["admin"], meta: protectedMeta },
  "/finance/transactions": {
    key: "finance.transactions",
    authority: ["admin"],
    meta: protectedMeta,
  },
  "/finance/ledger": {
    key: "finance.ledger",
    authority: ["admin"],
    meta: protectedMeta,
  },
  "/operations": {
    key: "operations",
    authority: ["admin"],
    meta: protectedMeta,
  },
  "/tickets": {
    key: "tickets.list",
    authority: ["admin"],
    meta: protectedMeta,
  },
  "/tickets/[uuid]": {
    key: "tickets.list",
    authority: ["admin"],
    dynamicRoute: true,
    meta: protectedMeta,
  },
  "/tickets/departments": {
    key: "tickets.departments",
    authority: ["admin"],
    meta: protectedMeta,
  },
  "/settings": { key: "settings", authority: ["admin"], meta: protectedMeta },
}

export const publicRoutes: Routes = {}
export const authRoutes = authRoute
