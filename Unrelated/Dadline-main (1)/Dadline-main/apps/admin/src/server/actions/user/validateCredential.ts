"use server"

import type { SignInCredential } from "@/@types/auth"
import { adminApiPost } from "@/lib/adminApi"
import { adminLoginResponseSchema } from "@/server/admin/admin.schemas"

const validateCredential = async (values: SignInCredential) => {
  const response = await adminApiPost<unknown>("/admin/auth/login", {
    identifier: values.identifier,
    password: values.password,
  })

  if (!response.ok || !response.data) return null

  const parsed = adminLoginResponseSchema.safeParse(response.data)
  if (!parsed.success) return null

  const { user, token } = parsed.data.data

  return {
    id: user.id,
    name: user.fullName,
    email: user.email,
    mobile: user.mobile,
    role: user.role,
    authority: ["admin"],
    accessToken: token,
  }
}

export default validateCredential
