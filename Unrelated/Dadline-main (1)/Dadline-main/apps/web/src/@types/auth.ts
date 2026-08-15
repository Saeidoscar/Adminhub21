export type SignInCredential = {
  mobile: string
  password: string
}

export type SignInOtpCredential = {
  mobile: string
  code: number
}

export type SignInResponse = {
  token: string
  user: {
    userId: string
    firstName: string
    lastName: string
    mobile: string
    authority: string[]
    avatar: string
  }
}

export type SignUpResponse = {
  status: string
  message: string
  token: string
  user: {
    userId: string
    firstName: string
    lastName: string
    mobile: string
    authority: string[]
    avatar: string
  }
}

export type SignUpCredential = {
  firstName: string
  lastName: string
  mobile: string
  password: string
}

export type ForgotPassword = {
  mobile: string
}

export type ResetPassword = {
  newPassword: string
  confirmPassword: string
  token: string
}

export type AuthRequestStatus = "success" | "failed" | ""

export type AuthResult = Promise<{
  status: AuthRequestStatus
  message: string
}>

export type User = {
  userId?: string | null
  avatar?: string | null
  firstName?: string | null
  lastName?: string | null
  mobile?: string | null
  authority?: string[]
}

export type Token = {
  accessToken: string
  refreshToken?: string
}

export type OauthSignInCallbackPayload = {
  onSignIn: (tokens: Token, user?: User) => void
  redirect: () => void
}
