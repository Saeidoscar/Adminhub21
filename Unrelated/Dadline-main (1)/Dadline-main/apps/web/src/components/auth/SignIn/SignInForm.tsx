"use client"

/** گام اول: فقط موبایل — چک می‌کند کاربر ثبت‌نام کرده یا نه */
// کاربر جدید است → ارجاع به فرم ثبت‌نام

// کاربر موجود است → نمایش گزینه‌های رمز/OTP

/** گام دوم: رمز عبور */

import { useState } from "react"
import Input from "@/components/ui/Input"
import Button from "@/components/ui/Button"
import { FormItem, Form } from "@/components/ui/Form"
import PasswordInput from "@/components/shared/PasswordInput"
import classNames from "@/utils/classNames"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { checkMobile } from "@/server/actions/auth/checkMobile"
import type { CommonProps } from "@/@types/common"
import type { ReactNode } from "react"

export type OnSignInPayload = {
  values: SignInFormSchema
  setSubmitting: (isSubmitting: boolean) => void
  setMessage: (message: string) => void
}

export type OnSignIn = (payload: OnSignInPayload) => void

export type OnMobileNotRegistered = (mobile: string) => void

type SignInFormSchema = {
  mobile: string
  password: string
}

type Step = "mobile" | "password"

interface SignInFormProps extends CommonProps {
  passwordHint?: string | ReactNode
  setMessage: (message: string) => void
  onSignIn?: OnSignIn
  onMobileNotRegistered?: OnMobileNotRegistered
  onMobileVerified?: (mobile: string, firstName: string | null) => void
}

const mobileSchema = z.object({
  mobile: z.string().length(11, { message: "لطفاً موبایل خود را وارد کنید" }),
})

const fullSchema = z.object({
  mobile: z.string().length(11, { message: "لطفاً موبایل خود را وارد کنید" }),
  password: z.string().min(1, { message: "لطفاً رمز عبور خود را وارد کنید" }),
})

const SignInForm = (props: SignInFormProps) => {
  const [step, setStep] = useState<Step>("mobile")
  const [isCheckingMobile, setCheckingMobile] = useState(false)
  const [isSubmitting, setSubmitting] = useState<boolean>(false)
  const [firstName, setFirstName] = useState<string | null>(null)

  const {
    className,
    setMessage,
    onSignIn,
    onMobileNotRegistered,
    onMobileVerified,
    passwordHint,
  } = props

  const {
    handleSubmit,
    formState: { errors },
    control,
    getValues,
  } = useForm<SignInFormSchema>({
    defaultValues: {
      mobile: "",
      password: "",
    },
    resolver: zodResolver(
      step ===
        "mobile"
        ? mobileSchema
        : fullSchema,
    ),
  })
  const handleMobileSubmit = async () => {
    const mobile = getValues("mobile")

    const result = mobileSchema.safeParse({ mobile })
    if (!result.success) {
      return
    }

    setCheckingMobile(true)
    setMessage("")

    const res = await checkMobile(mobile)

    setCheckingMobile(false)

    if (res.error) {
      setMessage(res.error)
      return
    }

    if (!res.exists) {
      onMobileNotRegistered?.(mobile)
      return
    }
    setFirstName(res.firstName)
    onMobileVerified?.(mobile, res.firstName)
    setStep("password")
  }
  const handlePasswordSubmit = async (values: SignInFormSchema) => {
    if (onSignIn) {
      onSignIn({ values, setSubmitting, setMessage })
    }
  }

  const handleFormSubmit = handleSubmit((values) => {
    if (step === "mobile") {
      handleMobileSubmit()
    } else {
      handlePasswordSubmit(values)
    }
  })

  return (
    <div className={className}>
      <Form onSubmit={handleFormSubmit}>
        <div className="flex justify-between items-center px-2 mb-1">
          {step === "password" && firstName && (
            <p className="text-xs">👋 سلام {firstName} جان</p>
          )}
          {step === "password" && (
            <button
              type="button"
              className="text-xs"
              onClick={() => {
                setStep("mobile")
                setFirstName(null)
                setMessage("")
              }}
            >
              تغییر شماره موبایل
            </button>
          )}
        </div>

        <FormItem
          invalid={Boolean(errors.mobile)}
          errorMessage={errors.mobile?.message}
        >
          <Controller
            name="mobile"
            control={control}
            render={({ field }) => (
              <Input
                type="text"
                placeholder="موبایل"
                autoComplete="on"
                disabled={step === "password"}
                {...field}
              />
            )}
          />
        </FormItem>

        {step === "password" && (
          <FormItem
            invalid={Boolean(errors.password)}
            errorMessage={errors.password?.message}
            className={classNames(
              passwordHint ? "mb-0" : "",
              errors.password?.message ? "mb-8" : "",
            )}
          >
            <Controller
              name="password"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <PasswordInput
                  type="text"
                  placeholder="رمز عبور"
                  autoComplete="on"
                  autoFocus
                  {...field}
                />
              )}
            />
          </FormItem>
        )}

        {step === "password" && passwordHint}

        <Button
          block
          loading={isSubmitting || isCheckingMobile}
          variant="solid"
          type="submit"
        >
          {step === "mobile"
            ? isCheckingMobile
              ? "در حال بررسی..."
              : "ادامه"
            : isSubmitting
              ? "در حال ورود..."
              : "ورود"}
        </Button>
      </Form>
    </div>
  )
}

export default SignInForm
