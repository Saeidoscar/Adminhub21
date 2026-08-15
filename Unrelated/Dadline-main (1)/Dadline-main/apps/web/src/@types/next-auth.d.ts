import { DefaultSession, DefaultUser } from "next-auth"
import { DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    accessToken: string
    user: {
      id: string
      mobile: string
      roles: string[]
      authority?: string[]
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    mobile: string
    roles: string[]
    accessToken: string
    authority?: string[]
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    authority: string[]
    accessToken: string
    roles: string[]
    mobile: string
  }
}
