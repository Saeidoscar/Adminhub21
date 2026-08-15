import { DefaultSession, DefaultUser } from 'next-auth'
import { DefaultJWT } from 'next-auth/jwt'

declare module 'next-auth' {
    interface Session {
        user: {
            id: string
            mobile: string
            role: 'admin'
            authority: string[]
        } & DefaultSession['user']
    }

    interface User extends DefaultUser {
        mobile: string
        role: 'admin'
        authority: string[]
        accessToken: string
    }
}

declare module 'next-auth/jwt' {
    interface JWT extends DefaultJWT {
        mobile: string
        role: 'admin'
        authority: string[]
        adminAccessToken: string
    }
}
