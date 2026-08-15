"use client"

import Logo from "@/components/template/Logo"
import Alert from "@/components/ui/Alert"
import SignUpForm from "./SignUpForm"
import ActionLink from "@/components/shared/ActionLink"
import useTimeOutMessage from "@/utils/hooks/useTimeOutMessage"
import useTheme from "@/utils/hooks/useTheme"

type SignUpProps = {
  signInUrl?: string
}

export const SignUp = ({ signInUrl = "/sign-in" }: SignUpProps) => {
  const [message, setMessage] = useTimeOutMessage()

  const mode = useTheme((state) => state.mode)

  return (
    <>
      <div className="mb-8">
        <Logo type="streamline" mode={mode} logoWidth={60} logoHeight={60} />
      </div>
      <div className="mb-8">
        <h3 className="mb-1">ثبت‌نام در دادلاین</h3>
        <p className="font-semibold heading-text">
          شما هنوز در دادلاین حساب کاربری ندارید، برای ثبت نام موبایل را وارد
          کنید
        </p>
      </div>
      {message && (
        <Alert showIcon className="mb-4" type="danger">
          <span className="break-all">{message}</span>
        </Alert>
      )}
      <SignUpForm setMessage={setMessage} />
      <div>
        <div className="mt-6 text-center">
          <span>قبلاً حساب کاربری دارید؟ </span>
          <ActionLink
            href={signInUrl}
            className="heading-text font-bold"
            themeColor={false}
          >
            ورود
          </ActionLink>
        </div>
      </div>
    </>
  )
}

export default SignUp
