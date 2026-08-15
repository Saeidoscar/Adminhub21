"use server"

import { apiPost } from "@/lib/apiClient"
import { OtpError } from "@/lib/auth-errors"

type LaravelUser = {
  id: number
  firstName: string
  lastName: string
  mobile: string
  email: string | null
  roles: string[]
}

type VerifyOtpResponse = {
  user: LaravelUser
  token: string
}

const validateOtpCredential = async ({
  mobile,
  code,
}: {
  mobile: string
  code: string
}) => {
  const res = await apiPost<VerifyOtpResponse>("/auth/otp/verify", {
    mobile,
    code,
  })

  if (!res.ok || !res.data) {
    throw new OtpError(res.error || "کد تایید صحیح نیست.")
  }

  const { user, token } = res.data

  return {
    id: String(user.id),
    name: `${user.firstName} ${user.lastName}`.trim(),
    mobile: user.mobile,
    email: user.email,
    roles: user.roles,
    accessToken: token,
  }
}

export default validateOtpCredential
