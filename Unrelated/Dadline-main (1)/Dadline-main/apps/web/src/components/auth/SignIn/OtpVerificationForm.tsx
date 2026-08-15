"use client"

import { useState } from "react"
import Button from "@/components/ui/Button"
import OtpInput from "@/components/shared/OtpInput"
import type { OnOtpVerify } from "./OtpSignIn"
import type { FormEvent } from "react"

const OTP_LENGTH = 6

type OtpVerificationFormProps = {
  mobile: string
  onOtpVerify?: OnOtpVerify
  setMessage?: (message: string) => void
}

const OtpVerificationForm = ({
  mobile,
  onOtpVerify,
  setMessage,
}: OtpVerificationFormProps) => {
  const [code, setCode] = useState("")
  const [isVerifying, setVerifying] = useState(false)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (code.length !== OTP_LENGTH) {
      setMessage?.("کد تأیید باید ۶ رقم باشد.")
      return
    }

    setMessage?.("")
    setVerifying(true)
    if (!onOtpVerify) {
      setVerifying(false)
      setMessage?.("امکان تأیید کد در حال حاضر فراهم نیست.")
      return
    }

    onOtpVerify?.({
      mobile,
      code,
      setSubmitting: setVerifying,
      setMessage: (message) => setMessage?.(message),
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <div dir="ltr" className="flex justify-center sm:justify-start">
        <OtpInput
          autoFocus
          length={OTP_LENGTH}
          value={code}
          disabled={isVerifying}
          invalid={Boolean(code) && code.length < OTP_LENGTH}
          inputClass="h-[58px] w-[58px]"
          onChange={setCode}
        />
      </div>
      <Button
        block
        loading={isVerifying}
        variant="solid"
        type="submit"
        className="mt-5"
      >
        {isVerifying ? "در حال تأیید..." : "تأیید کد"}
      </Button>
    </form>
  )
}

export default OtpVerificationForm
