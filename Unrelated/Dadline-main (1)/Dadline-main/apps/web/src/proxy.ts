// proxy.ts
import NextAuth from "next-auth"
import authConfig from "@/configs/auth.config"
import { authRoutes as _authRoutes } from "@/configs/routes.config"
import { REDIRECT_URL_KEY } from "@/constants/app.constant"
import appConfig from "@/configs/app.config"

const { auth } = NextAuth(authConfig)
const authRoutes = Object.entries(_authRoutes).map(([key]) => key)
const apiAuthPrefix = `${appConfig.apiPrefix}/auth`
export default auth((req) => {
  const { nextUrl } = req
  const isSignedIn = !!req.auth
  const pathname = nextUrl.pathname

  const isApiAuthRoute = pathname.startsWith(apiAuthPrefix)
  if (isApiAuthRoute) {
    return
  }

  const isAuthRoute = authRoutes.includes(pathname)
  if (isAuthRoute) {
    if (isSignedIn) {
      return Response.redirect(
        new URL(appConfig.authenticatedEntryPath, nextUrl),
      )
    }
    return
  }

  const isProtectedRoute =
    pathname === "/pishkhan" || pathname.startsWith("/pishkhan/")
  if (isProtectedRoute && !isSignedIn) {
    let callbackUrl = pathname
    if (nextUrl.search) {
      callbackUrl += nextUrl.search
    }
    return Response.redirect(
      new URL(
        `${appConfig.unAuthenticatedEntryPath}?${REDIRECT_URL_KEY}=${encodeURIComponent(callbackUrl)}`,
        nextUrl,
      ),
    )
  }
  return
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
