"use client"
/** شماره موبایلی که کاربر در گام اول وارد کرده */

import { useState } from "react"
import Alert from "@/components/ui/Alert"
import { sendOtp } from "@/server/actions/auth/sendOtp"
import OtpMethodSelector from "./OtpMethodSelector"
import OtpVerificationForm from "./OtpVerificationForm"

export type OtpSignInType = "sms" | "call"

export type OnOtpVerifyPayload = {
  mobile: string
  code: string
  setSubmitting: (isSubmitting: boolean) => void
  setMessage: (message: string) => void
}

export type OnOtpVerify = (payload: OnOtpVerifyPayload) => void

type OtpSignInProps = {
  mobile: string
  setMessage?: (message: string) => void
  onOtpVerify?: OnOtpVerify
  onOtpSent?: () => void
}

type Feedback = {
  type: "info" | "danger"
  message: string
}

const OtpSignIn = ({
  mobile,
  onOtpVerify,
  onOtpSent,
  setMessage,
}: OtpSignInProps) => {
  const [sentVia, setSentVia] = useState<OtpSignInType | null>(null)
  const [isSending, setSending] = useState(false)
  const [feedback, setFeedback] = useState<Feedback | null>(null)

  const requestOtp = async (channel: OtpSignInType, isResend = false) => {
    if (!mobile) {
      setMessage?.("لطفاً ابتدا شماره موبایل را وارد کنید.")
      return
    }

    setSending(true)
    setFeedback(null)
    setMessage?.("")

    const result = await sendOtp(mobile, channel)

    setSending(false)

    if (!result.success) {
      setFeedback({
        type: "danger",
        message: result.error ?? "ارسال کد ناموفق بود.",
      })
      return
    }

    setSentVia(channel)
    onOtpSent?.()

    if (isResend) {
      setFeedback({
        type: "info",
        message: `کد تأیید ${
          channel === "sms" ? "پیامکی" : "تماس صوتی"
        } دوباره برای شما ارسال شد.`,
      })
    }
  }

  const handleChangeMethod = () => {
    setSentVia(null)
    setFeedback(null)
  }

  if (!sentVia) {
    return (
      <section aria-label="انتخاب روش رمز یکبار مصرف" className="space-y-4">
        {feedback && (
          <Alert showIcon type={feedback.type}>
            <span className="break-all">{feedback.message}</span>
          </Alert>
        )}
        <OtpMethodSelector
          isSending={isSending}
          onSelect={(channel) => requestOtp(channel)}
        />
      </section>
    )
  }

  return (
    <section aria-label="تأیید رمز یکبار مصرف" className="space-y-5">
      <div>
        <h3 className="mb-2 text-xl font-bold heading-text">
          تأیید شماره موبایل
        </h3>
        <p className="text-sm leading-6 text-gray-500 dark:text-gray-400">
          کد ۶ رقمی {sentVia === "sms" ? "پیامکی" : "تماس صوتی"} به شمارهٔ{" "}
          <span dir="ltr" className="font-semibold heading-text">
            {mobile}
          </span>{" "}
          ارسال شد.
        </p>
      </div>

      {feedback && (
        <Alert showIcon type={feedback.type} className="mb-4">
          <span className="break-all">{feedback.message}</span>
        </Alert>
      )}

      <OtpVerificationForm
        mobile={mobile}
        onOtpVerify={onOtpVerify}
        setMessage={setMessage}
      />

      <div className="text-center text-sm">
        <span className="font-semibold">رمز یکبار مصرف را دریافت نکردید؟ </span>
        <button
          type="button"
          className="font-bold heading-text underline underline-offset-4 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isSending}
          onClick={() => requestOtp(sentVia, true)}
        >
          {isSending ? "در حال ارسال..." : "ارسال مجدد"}
        </button>
        <button
          type="button"
          className="mr-3 text-xs text-primary underline underline-offset-4"
          disabled={isSending}
          onClick={handleChangeMethod}
        >
          انتخاب روش دیگر
        </button>
      </div>
    </section>
  )
}

export default OtpSignIn
