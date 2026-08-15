"use server"

import { apiPost } from "@/lib/apiClient"
import type { SignInCredential } from "@/@types/auth"

type LaravelUser = {
  id: number
  firstName: string
  lastName: string
  mobile: string
  email: string | null
  roles: string[]
}

type LoginResponse = {
  success: boolean
  message: string
  data: {
    user: LaravelUser
    token: string
  }
}

const validateCredential = async ({ mobile, password }: SignInCredential) => {
  const res = await apiPost<LoginResponse>("/auth/login", {
    identifier: mobile,
    password,
  })

  if (!res.ok || !res.data?.data) {
    return null
  }

  const { user, token } = res.data.data

  return {
    id: String(user.id),
    name: `${user.firstName} ${user.lastName}`.trim(),
    mobile: user.mobile,
    email: user.email,
    roles: user.roles,
    accessToken: token,
  }
}

export default validateCredential
