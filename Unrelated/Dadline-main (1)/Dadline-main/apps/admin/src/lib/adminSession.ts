import "server-only"

import { auth } from "@/auth"
import { getToken } from "next-auth/jwt"
import { headers } from "next/headers"

export const getAdminAuthContext = async () => {
  const session = await auth()

  if (!session?.user.authority?.includes("admin")) {
    return null
  }

  const secret = process.env.AUTH_SECRET
  if (!secret) return null

  const request = new Request("http://admin.internal", {
    headers: await headers(),
  })
  const jwt = await getToken({
    req: request,
    secret,
    secureCookie: process.env.NODE_ENV === "production",
  })
  const accessToken =
    typeof jwt?.adminAccessToken === "string" ? jwt.adminAccessToken : null

  if (!accessToken) return null

  return { session, accessToken }
}
