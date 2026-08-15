"use client"

import { useRouter } from "next/navigation"
import SignIn from "@/components/auth/SignIn"
import {
  onSignInWithCredentials,
  onSignInWithOtp,
} from "@/server/actions/auth/handleSignIn"
import { REDIRECT_URL_KEY } from "@/constants/app.constant"
import { useSearchParams } from "next/navigation"
import type { OnSignInPayload } from "@/components/auth/SignIn/SignInForm"
import type { OnOtpVerifyPayload } from "@/components/auth/SignIn/OtpSignIn"

const SignInClient = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get(REDIRECT_URL_KEY)

  const handleSignIn = ({
    values,
    setSubmitting,
    setMessage,
  }: OnSignInPayload) => {
    setSubmitting(true)

    onSignInWithCredentials(values, callbackUrl || "").then((data) => {
      if (data?.error) {
        setMessage(data.error as string)
        setSubmitting(false)
      }
    })
  }

  const handleOtpVerify = ({
    mobile,
    code,
    setSubmitting,
    setMessage,
  }: OnOtpVerifyPayload) => {
    onSignInWithOtp({ mobile, code }, callbackUrl || "").then((data) => {
      if (data?.error) {
        setMessage(data.error as string)
        setSubmitting(false)
      }
    })
  }

  const handleMobileNotRegistered = (mobile: string) => {
    router.push(`/sign-up?mobile=${encodeURIComponent(mobile)}`)
  }

  return (
    <SignIn
      onSignIn={handleSignIn}
      onOtpVerify={handleOtpVerify}
      onMobileNotRegistered={handleMobileNotRegistered}
    />
  )
}

export default SignInClient
