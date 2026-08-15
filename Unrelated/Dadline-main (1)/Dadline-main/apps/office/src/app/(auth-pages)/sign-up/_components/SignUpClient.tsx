"use client"

import toast from "@/components/ui/toast"
import Notification from "@/components/ui/Notification"
import SignUp from "@/components/auth/SignUp"
import { apiSignUp } from "@/services/AuthService"
import { useRouter } from "next/navigation"
import type { OnSignUpPayload } from "@/components/auth/SignUp"

const SignUpClient = () => {
  const router = useRouter()

  const handlSignUp = async ({
    values,
    setSubmitting,
    setMessage,
  }: OnSignUpPayload) => {
    try {
      setSubmitting(true)
      await apiSignUp(values)
      toast.push(
        <Notification title="حساب کاربری ایجاد شد!" type="success">
          اکنون می‌توانید از صفحه ورود وارد حساب خود شوید
        </Notification>,
      )
      router.push("/sign-in")
    } catch (error) {
      setMessage(error as string)
    } finally {
      setSubmitting(false)
    }
  }

  return <SignUp onSignUp={handlSignUp} />
}

export default SignUpClient
