"use server"
/** Pretend create user */

import type { SignUpCredential } from "@/@types/auth"

export const onSignUpWithCredentials = async ({
  email,
  userName,
}: SignUpCredential) => {
  try {
    return {
      email,
      userName,
      id: userName,
    }
  } catch (error) {
    throw error
  }
}
