"use client"
/** موبایل از قبل پر شده، اگر از صفحه sign-in ارجاع داده شده باشد */

/** گام ۱: ارسال OTP به موبایل وارد‌شده */

/** گام ۲: تایید کد OTP */

/** گام ۳: تکمیل ثبت‌نام */

import { useState } from "react"
import Input from "@/components/ui/Input"
import Button from "@/components/ui/Button"
import Alert from "@/components/ui/Alert"
import { FormItem, Form } from "@/components/ui/Form"
import OtpInput from "@/components/shared/OtpInput"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { sendOtp } from "@/server/actions/auth/sendOtp"
import { checkMobile } from "@/server/actions/auth/checkMobile"
import { verifyOtpForRegistration } from "@/server/actions/auth/verifyOtpForRegistration"
import { registerUser } from "@/server/actions/auth/register"
import type { CommonProps } from "@/@types/common"

type Step = "mobile" | "otp" | "details"

const OTP_LENGTH = 6

export type OnRegisterSuccess = () => void

interface SignUpFormProps extends CommonProps {
  initialMobile?: string
  setMessage: (message: string) => void
  callbackUrl?: string
}

const mobileSchema = z.object({
  mobile: z.string().length(11, { message: "لطفاً موبایل خود را وارد کنید" }),
})

const detailsSchema = z
  .object({
    firstName: z.string().min(1, { message: "نام خود را وارد کنید" }),
    lastName: z.string().min(1, { message: "نام خانوادگی خود را وارد کنید" }),
    password: z
      .string()
      .min(8, { message: "رمز عبور باید حداقل ۸ کاراکتر باشد" }),
    confirmPassword: z
      .string()
      .min(1, { message: "تکرار رمز عبور الزامی است" }),
    referralCode: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "رمز عبور مطابقت ندارد",
    path: ["confirmPassword"],
  })

type DetailsSchema = z.infer<typeof detailsSchema>

const SignUpForm = (props: SignUpFormProps) => {
  const { className, setMessage, initialMobile, callbackUrl } = props

  const [step, setStep] = useState<Step>(initialMobile ? "otp" : "mobile")
  const [mobile, setMobile] = useState(initialMobile || "")
  const [otpCode, setOtpCode] = useState("")
  const [isSubmitting, setSubmitting] = useState(false)
  const [isSendingOtp, setSendingOtp] = useState(false)
  const [otpFeedback, setOtpFeedback] = useState<string | null>(null)

  const mobileForm = useForm<{ mobile: string }>({
    defaultValues: { mobile: initialMobile || "" },
    resolver: zodResolver(mobileSchema),
  })

  const detailsForm = useForm<DetailsSchema>({
    defaultValues: {
      firstName: "",
      lastName: "",
      password: "",
      confirmPassword: "",
      referralCode: "",
    },
    resolver: zodResolver(detailsSchema),
  })
  const handleMobileSubmit = mobileForm.handleSubmit(async (values) => {
    setSendingOtp(true)
    setMessage("")
    setOtpFeedback(null)

    const mobileCheck = await checkMobile(values.mobile)

    if (mobileCheck.error) {
      setSendingOtp(false)
      setMessage(mobileCheck.error)
      return
    }

    if (mobileCheck.exists) {
      setSendingOtp(false)
      setMessage("این شماره موبایل قبلاً ثبت‌نام کرده است. لطفاً وارد شوید.")
      return
    }

    const res = await sendOtp(values.mobile, "sms")

    setSendingOtp(false)

    if (!res.success) {
      setMessage(res.error || "ارسال کد ناموفق بود.")
      return
    }

    setMobile(values.mobile)
    setStep("otp")
  })

  const handleResendOtp = async () => {
    setSendingOtp(true)
    setMessage("")
    setOtpFeedback(null)

    const res = await sendOtp(mobile, "sms")

    setSendingOtp(false)

    if (!res.success) {
      setMessage(res.error || "ارسال مجدد کد ناموفق بود.")
      return
    }

    setOtpFeedback("کد تأیید پیامکی دوباره برای شما ارسال شد.")
  }
  const handleOtpSubmit = async () => {
    if (otpCode.length !== OTP_LENGTH) {
      setMessage("کد تأیید باید ۶ رقم باشد.")
      return
    }

    setSubmitting(true)
    setMessage("")

    const res = await verifyOtpForRegistration(mobile, otpCode)

    setSubmitting(false)

    if (!res.verified) {
      setMessage(res.error || "کد وارد شده صحیح نیست.")
      return
    }

    setStep("details")
  }
  const handleDetailsSubmit = detailsForm.handleSubmit(async (values) => {
    setSubmitting(true)
    setMessage("")

    const res = await registerUser(
      {
        firstName: values.firstName,
        lastName: values.lastName,
        mobile,
        password: values.password,
        passwordConfirmation: values.confirmPassword,
        otpCode,
        referralCode: values.referralCode,
      },
      callbackUrl,
    )

    setSubmitting(false)

    if (!res.success) {
      setMessage(res.error || "ثبت‌نام ناموفق بود.")
    }
  })

  if (step === "mobile") {
    return (
      <div className={className}>
        <Form onSubmit={handleMobileSubmit}>
          <FormItem
            invalid={Boolean(mobileForm.formState.errors.mobile)}
            errorMessage={mobileForm.formState.errors.mobile?.message}
          >
            <Controller
              name="mobile"
              control={mobileForm.control}
              render={({ field }) => (
                <Input
                  type="text"
                  placeholder="موبایل"
                  autoComplete="on"
                  {...field}
                />
              )}
            />
          </FormItem>
          <Button block loading={isSendingOtp} variant="solid" type="submit">
            {isSendingOtp ? "در حال ارسال کد..." : "ادامه ثبت نام"}
          </Button>
        </Form>
      </div>
    )
  }

  if (step === "otp") {
    return (
      <section
        aria-label="تأیید شماره موبایل برای ثبت‌نام"
        className={`${className ?? ""} space-y-5`}
      >
        <div>
          <h3 className="mb-2 text-xl font-bold heading-text">
            تأیید شماره موبایل
          </h3>
          <p className="text-sm leading-6 text-gray-500 dark:text-gray-400">
            کد ۶ رقمی پیامکی به شمارهٔ{" "}
            <span dir="ltr" className="font-semibold heading-text">
              {mobile}
            </span>{" "}
            ارسال شد.
          </p>
        </div>

        {otpFeedback && (
          <Alert showIcon type="info">
            <span className="break-all">{otpFeedback}</span>
          </Alert>
        )}

        <Form
          onSubmit={(event) => {
            event.preventDefault()
            handleOtpSubmit()
          }}
        >
          <div dir="ltr" className="flex justify-center sm:justify-start">
            <OtpInput
              autoFocus
              length={OTP_LENGTH}
              value={otpCode}
              disabled={isSubmitting}
              invalid={Boolean(otpCode) && otpCode.length < OTP_LENGTH}
              inputClass="h-[58px] w-[58px]"
              onChange={setOtpCode}
            />
          </div>
          <Button
            block
            loading={isSubmitting}
            variant="solid"
            type="submit"
            className="mt-5"
          >
            {isSubmitting ? "در حال بررسی..." : "تایید کد"}
          </Button>
        </Form>
        <div className="text-center text-sm">
          <span className="font-semibold">
            رمز یکبار مصرف را دریافت نکردید؟{" "}
          </span>
          <button
            type="button"
            className="font-bold heading-text underline underline-offset-4 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isSendingOtp}
            onClick={handleResendOtp}
          >
            {isSendingOtp ? "در حال ارسال..." : "ارسال مجدد"}
          </button>
          <button
            type="button"
            className="mr-3 text-xs text-primary underline underline-offset-4"
            disabled={isSendingOtp}
            onClick={() => {
              setOtpCode("")
              setOtpFeedback(null)
              setStep("mobile")
            }}
          >
            تغییر شماره موبایل
          </button>
        </div>
      </section>
    )
  }

  return (
    <div className={className}>
      <Form onSubmit={handleDetailsSubmit}>
        <FormItem
          label="نام"
          invalid={Boolean(detailsForm.formState.errors.firstName)}
          errorMessage={detailsForm.formState.errors.firstName?.message}
        >
          <Controller
            name="firstName"
            control={detailsForm.control}
            render={({ field }) => (
              <Input type="text" placeholder="نام" {...field} />
            )}
          />
        </FormItem>

        <FormItem
          label="نام خانوادگی"
          invalid={Boolean(detailsForm.formState.errors.lastName)}
          errorMessage={detailsForm.formState.errors.lastName?.message}
        >
          <Controller
            name="lastName"
            control={detailsForm.control}
            render={({ field }) => (
              <Input type="text" placeholder="نام خانوادگی" {...field} />
            )}
          />
        </FormItem>

        <FormItem
          label="رمز عبور"
          invalid={Boolean(detailsForm.formState.errors.password)}
          errorMessage={detailsForm.formState.errors.password?.message}
        >
          <Controller
            name="password"
            control={detailsForm.control}
            render={({ field }) => (
              <Input type="password" placeholder="رمز عبور" {...field} />
            )}
          />
        </FormItem>

        <FormItem
          label="تأیید رمز عبور"
          invalid={Boolean(detailsForm.formState.errors.confirmPassword)}
          errorMessage={detailsForm.formState.errors.confirmPassword?.message}
        >
          <Controller
            name="confirmPassword"
            control={detailsForm.control}
            render={({ field }) => (
              <Input type="password" placeholder="تأیید رمز عبور" {...field} />
            )}
          />
        </FormItem>

        <FormItem label="کد معرف (اختیاری)">
          <Controller
            name="referralCode"
            control={detailsForm.control}
            render={({ field }) => (
              <Input type="text" placeholder="کد معرف" {...field} />
            )}
          />
        </FormItem>

        <Button block loading={isSubmitting} variant="solid" type="submit">
          {isSubmitting ? "در حال ایجاد حساب..." : "ثبت نام"}
        </Button>
      </Form>
    </div>
  )
}

export default SignUpForm
