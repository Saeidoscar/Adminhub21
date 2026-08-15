import NextAuth from "next-auth"
import authConfig from "@/configs/auth.config"
import {
  authRoutes as _authRoutes,
  publicRoutes as _publicRoutes,
} from "@/configs/routes.config"
import { REDIRECT_URL_KEY } from "@/constants/app.constant"
import appConfig from "@/configs/app.config"

const { auth } = NextAuth(authConfig)
const publicRoutes = Object.keys(_publicRoutes)
const authRoutes = Object.keys(_authRoutes)
const apiAuthPrefix = `${appConfig.apiPrefix}/auth`

export default auth((request) => {
  const { nextUrl } = request
  const isSignedIn = Boolean(request.auth)
  const isAdmin = request.auth?.user?.authority?.includes("admin") === true
  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix)
  const isHealthRoute = nextUrl.pathname === "/api/health"
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname)
  const isAuthRoute = authRoutes.includes(nextUrl.pathname)

  if (isApiAuthRoute || isHealthRoute) return

  if (isAuthRoute) {
    if (isSignedIn && isAdmin) {
      return Response.redirect(
        new URL(appConfig.authenticatedEntryPath, nextUrl),
      )
    }
    return
  }

  if ((!isSignedIn || !isAdmin) && !isPublicRoute) {
    const callbackUrl = `${nextUrl.pathname}${nextUrl.search}`
    return Response.redirect(
      new URL(
        `${appConfig.unAuthenticatedEntryPath}?${REDIRECT_URL_KEY}=${encodeURIComponent(callbackUrl)}`,
        nextUrl,
      ),
    )
  }
})

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api)(.*)"],
}
