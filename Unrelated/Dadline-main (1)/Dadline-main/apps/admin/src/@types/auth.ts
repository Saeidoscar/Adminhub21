export type SignInCredential = {
    identifier: string
    password: string
}

export type AdminSignInUser = {
    id: string
    firstName: string
    lastName: string
    fullName: string
    mobile: string
    email: string | null
    role: 'admin'
    roles: ['admin']
    accessToken: string
    authority: ['admin']
}

export type AuthRequestStatus = 'success' | 'failed' | ''

export type AuthResult = Promise<{
    status: AuthRequestStatus
    message: string
}>
