"use client" /* <div>
                <div className="mt-6 text-center">
                    <span>حساب کاربری ندارید؟ </span>
                    <ActionLink
                        href={signUpUrl}
                        className="heading-text font-bold"
                        themeColor={false}
                    >
                        ثبت نام کنید
                    </ActionLink>
                </div>
            </div> */

import { useState } from "react"
import Logo from "@/components/template/Logo"
import Alert from "@/components/ui/Alert"
import SignInForm from "@/components/auth/SignIn/SignInForm"
import OtpSignIn, { OnOtpVerify } from "./OtpSignIn"
import ActionLink from "@/components/shared/ActionLink"
import useTimeOutMessage from "@/utils/hooks/useTimeOutMessage"
import useTheme from "@/utils/hooks/useTheme"
import type {
  OnSignIn,
  OnMobileNotRegistered,
} from "@/components/auth/SignIn/SignInForm"

type SignInProps = {
  signUpUrl?: string
  forgetPasswordUrl?: string
  onSignIn?: OnSignIn
  onOtpVerify?: OnOtpVerify
  onMobileNotRegistered?: OnMobileNotRegistered
}

const SignIn = ({
  signUpUrl = "/sign-up",
  forgetPasswordUrl = "/forgot-password",
  onSignIn,
  onOtpVerify,
  onMobileNotRegistered,
}: SignInProps) => {
  const [message, setMessage] = useTimeOutMessage()
  const [verifiedMobile, setVerifiedMobile] = useState<string | null>(null)
  const [isOtpActive, setOtpActive] = useState(false)

  const mode = useTheme((state) => state.mode)

  return (
    <>
      <div className="mb-8">
        <Logo type="streamline" mode={mode} logoWidth={60} logoHeight={60} />
      </div>
      <div className="mb-10">
        <h4 className="font-semibold heading-text">ورود به دادلاین</h4>
        <p className="mb-2">خوش آمدید</p>
      </div>
      {message && (
        <Alert showIcon className="mb-4" type="danger">
          <span className="break-all">{message}</span>
        </Alert>
      )}
      {!isOtpActive && (
        <SignInForm
          setMessage={setMessage}
          onMobileNotRegistered={onMobileNotRegistered}
          onMobileVerified={(mobile) => setVerifiedMobile(mobile)}
          passwordHint={
            <div className="mb-5 mt-2">
              <ActionLink
                href={forgetPasswordUrl}
                className="text-xs mt-2"
                themeColor={false}
              >
                فراموشی رمز عبور
              </ActionLink>
            </div>
          }
          onSignIn={onSignIn}
        />
      )}
      {verifiedMobile && (
        <div className={isOtpActive ? "mt-2" : "mt-8"}>
          {!isOtpActive && (
            <div className="flex items-center gap-2 mb-6">
              <div className="border-t border-gray-200 dark:border-gray-800 flex-1 mt-px" />
              <p className="font-semibold heading-text">یا ادامه با</p>
              <div className="border-t border-gray-200 dark:border-gray-800 flex-1 mt-px" />
            </div>
          )}
          <OtpSignIn
            key="otp-sign-in"
            mobile={verifiedMobile}
            setMessage={setMessage}
            onOtpVerify={onOtpVerify}
            onOtpSent={() => setOtpActive(true)}
          />
        </div>
      )}
      {}
    </>
  )
}

export default SignIn
