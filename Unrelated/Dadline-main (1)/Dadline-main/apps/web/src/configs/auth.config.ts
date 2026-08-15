import type { NextAuthConfig } from "next-auth"
import validateCredential from "../server/actions/user/validateCredential"
import validateOtpCredential from "../server/actions/user/validateOtpCredential"
import Credentials from "next-auth/providers/credentials"

import type { SignInCredential } from "@/@types/auth"

export default {
  providers: [
    Credentials({
      id: "credentials",
      async authorize(credentials) {
        const user = await validateCredential(credentials as SignInCredential)

        return user
      },
    }),
    Credentials({
      id: "otp-credentials",
      async authorize(credentials) {
        const user = await validateOtpCredential(
          credentials as { mobile: string code: string },
        )
        return user
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Persist user info + Laravel Sanctum token right after signin
      if (user) {
        token.mobile = user.mobile
        token.roles = user.roles
        token.accessToken = user.accessToken
      }
      return token
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.sub,
          mobile: token.mobile as string,
          roles: token.roles as string[],
        },
        accessToken: token.accessToken as string,
      }
    },
  },
} satisfies NextAuthConfig
