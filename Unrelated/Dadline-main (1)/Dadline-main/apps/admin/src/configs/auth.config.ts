import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import validateCredential from "@/server/actions/user/validateCredential"
import type { SignInCredential } from "@/@types/auth"

export default {
  providers: [
    Credentials({
      id: "credentials",
      async authorize(credentials) {
        return validateCredential(credentials as SignInCredential)
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.mobile = user.mobile
        token.role = user.role
        token.authority = user.authority
        token.adminAccessToken = user.accessToken
      }
      return token
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.sub ?? "",
          mobile: token.mobile,
          role: token.role,
          authority: token.authority,
        },
      }
    },
  },
} satisfies NextAuthConfig
