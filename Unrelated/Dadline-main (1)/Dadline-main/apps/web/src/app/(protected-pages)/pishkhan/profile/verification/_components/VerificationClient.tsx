"use client"

import { useActionState, useEffect, useMemo, useRef, useState } from "react"
import type { ReactNode } from "react"
import { useRouter } from "next/navigation"
import Button from "@/components/ui/Button"
import Dialog from "@/components/ui/Dialog"
import Input from "@/components/ui/Input"
import { Form, FormItem } from "@/components/ui/Form"
import { activateApiToken } from "@/server/actions/profile/activateApiToken"
import { verifyLevelOne } from "@/server/actions/profile/verifyLevelOne"
import { verifyLevelTwo } from "@/server/actions/profile/verifyLevelTwo"
import { verifyLevelThree } from "@/server/actions/profile/verifyLevelThree"
import type {
  UserVerificationPayload,
  VerificationActionState,
} from "@/server/actions/profile/verification.schemas"
import {
  TbApi,
  TbCheck,
  TbClipboard,
  TbCreditCard,
  TbClock,
  TbDeviceMobileCheck,
  TbId,
  TbLock,
  TbShieldCheck,
} from "react-icons/tb"

type VerificationClientProps = {
  data: UserVerificationPayload
  paymentStatus?: "success" | "failed" | null
  inquiryStatus?: "matched" | "not_matched" | "unavailable" | null
  returnContext?: string | null
}

const initialActionState: VerificationActionState = {
  status: "idle",
  message: null,
  token: null,
}

const jalaliMonths = [
  { value: "01", label: "فروردین" },
  { value: "02", label: "اردیبهشت" },
  { value: "03", label: "خرداد" },
  { value: "04", label: "تیر" },
  { value: "05", label: "مرداد" },
  { value: "06", label: "شهریور" },
  { value: "07", label: "مهر" },
  { value: "08", label: "آبان" },
  { value: "09", label: "آذر" },
  { value: "10", label: "دی" },
  { value: "11", label: "بهمن" },
  { value: "12", label: "اسفند" },
]

const formatMoney = (value: number) => `${value.toLocaleString("fa-IR")} تومان`

const formatCost = (value: number) =>
  value > 0 ? formatMoney(value) : "رایگان"

const formatValidity = (expiresAt: string | null, expired: boolean) => {
  if (!expiresAt) return "ثبت نشده"

  if (expired) return "منقضی شده"

  const now = new Date()
  const expiry = new Date(expiresAt)
  const diffMs = expiry.getTime() - now.getTime()
  const days = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)))

  if (days === 0) return "تا پایان امروز معتبر است"

  return `تا ${days.toLocaleString("fa-IR")} روز دیگر معتبر است`
}

const parseBirthDate = (value?: string | null) => {
  const [year = "", month = "", day = ""] = (value ?? "").split("-")

  return { day, month, year }
}

function StatusPill({
  active,
  pendingLabel = "در انتظار",
}: {
  active: boolean
  pendingLabel?: string
}) {
  return (
    <span
      className={
        active
          ? "inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-100"
          : "inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-100"
      }
    >
      {active ? <TbCheck /> : <TbClock />}
      {active ? "تایید شد" : pendingLabel}
    </span>
  )
}

function SectionHeader({ icon, title }: { icon: ReactNode title: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-xl text-gray-700 dark:bg-gray-800 dark:text-gray-100">
        {icon}
      </div>
      <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
        {title}
      </h3>
    </div>
  )
}

function BirthDateSelect({
  disabled,
  value,
  onChange,
}: {
  disabled: boolean
  value: { day: string month: string year: string }
  onChange: (value: { day: string month: string year: string }) => void
}) {
  const years = Array.from({ length: 91 }, (_, index) => String(1405 - index))
  const days = Array.from({ length: 31 }, (_, index) =>
    String(index + 1).padStart(2, "0"),
  )
  const selectClassName =
    "h-11 w-full rounded-xl border border-gray-300 bg-gray-100 px-4 text-sm text-gray-700 outline-none transition focus:border-primary focus:bg-transparent focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 dark:border-gray-700 dark:bg-gray-700 dark:text-gray-100 dark:disabled:bg-gray-800"

  return (
    <div className="grid gap-2 sm:grid-cols-3">
      <select
        name="birthDay"
        value={value.day}
        disabled={disabled}
        className={selectClassName}
        onChange={(event) => onChange({ ...value, day: event.target.value })}
      >
        <option value="">روز</option>
        {days.map((item) => (
          <option key={item} value={item}>
            {Number(item).toLocaleString("fa-IR")}
          </option>
        ))}
      </select>
      <select
        name="birthMonth"
        value={value.month}
        disabled={disabled}
        className={selectClassName}
        onChange={(event) => onChange({ ...value, month: event.target.value })}
      >
        <option value="">ماه</option>
        {jalaliMonths.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
      <select
        name="birthYear"
        value={value.year}
        disabled={disabled}
        className={selectClassName}
        onChange={(event) => onChange({ ...value, year: event.target.value })}
      >
        <option value="">سال</option>
        {years.map((item) => (
          <option key={item} value={item}>
            {Number(item).toLocaleString("fa-IR", {
              useGrouping: false,
            })}
          </option>
        ))}
      </select>
    </div>
  )
}

function ActionMessage({ state }: { state: VerificationActionState }) {
  if (!state.message) return null

  return (
    <div
      className={
        state.status === "success"
          ? "rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-100"
          : "rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-100"
      }
    >
      {state.message}
    </div>
  )
}

type PaidAction = "level_one" | "level_two" | "level_three"

type PaymentConfirmation = {
  action: PaidAction
  title: string
  cost: number
  submitLabel: string
  body: string
  showWalletBalance: boolean
}

function InfoRow({ label, value }: { label: string value: ReactNode }) {
  return (
    <div className="flex min-h-10 items-center justify-between gap-3 rounded-lg bg-gray-50 px-3 py-2 text-sm dark:bg-gray-800">
      <span className="text-gray-500">{label}</span>
      <span className="font-semibold text-gray-900 dark:text-gray-100">
        {value}
      </span>
    </div>
  )
}

function ValidityBadge({
  expired,
  expiresAt,
}: {
  expired: boolean
  expiresAt: string | null
}) {
  const text = formatValidity(expiresAt, expired)

  return (
    <span
      className={
        expired
          ? "inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 dark:bg-red-900/30 dark:text-red-100"
          : "inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-200"
      }
    >
      {text}
    </span>
  )
}

function StepNumber({
  active,
  children,
}: {
  active: boolean
  children: ReactNode
}) {
  return (
    <div
      className={
        active
          ? "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary text-lg font-bold text-white"
          : "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-lg font-bold text-gray-500 dark:bg-gray-800 dark:text-gray-200"
      }
    >
      {children}
    </div>
  )
}

export default function VerificationClient({
  data,
  paymentStatus,
  inquiryStatus,
  returnContext,
}: VerificationClientProps) {
  const router = useRouter()
  const levelOneFormRef = useRef<HTMLFormElement>(null)
  const levelTwoFormRef = useRef<HTMLFormElement>(null)
  const levelThreeFormRef = useRef<HTMLFormElement>(null)
  const [levelOneState, levelOneAction, levelOnePending] = useActionState(
    verifyLevelOne,
    initialActionState,
  )
  const [levelTwoState, levelTwoAction, levelTwoPending] = useActionState(
    verifyLevelTwo,
    initialActionState,
  )
  const [levelThreeState, levelThreeAction, levelThreePending] = useActionState(
    verifyLevelThree,
    initialActionState,
  )
  const [apiTokenState, apiTokenAction, apiTokenPending] = useActionState(
    activateApiToken,
    initialActionState,
  )
  const [birthDate, setBirthDate] = useState(() =>
    parseBirthDate(data.profile.birthDate),
  )
  const [returnUrl, setReturnUrl] = useState("")
  const [confirmingPayment, setConfirmingPayment] =
    useState<PaymentConfirmation | null>(null)

  const levelOneVerified = data.verification.verifiedLevel >= 1
  const levelTwoVerified = data.verification.verifiedLevel >= 2
  const levelThreeVerified = data.verification.verifiedLevel >= 3
  const levelOneActive = data.verification.activeVerifiedLevel >= 1
  const levelTwoActive = data.verification.activeVerifiedLevel >= 2
  const levelThreeActive = data.verification.activeVerifiedLevel >= 3
  const token = apiTokenState.token
  const showLevelOneAction = !levelOneActive
  const showLevelTwoAction = levelOneActive && !levelTwoActive
  const showLevelThreeAction = levelTwoActive && !levelThreeActive
  const walletBalance = data.wallet.balance

  useEffect(() => {
    setReturnUrl(`${window.location.origin}/pishkhan/profile/verification`)
  }, [])

  useEffect(() => {
    const paymentUrl =
      levelOneState.paymentUrl ??
      levelTwoState.paymentUrl ??
      levelThreeState.paymentUrl

    if (paymentUrl) {
      window.location.href = paymentUrl
      return
    }

    if (
      (levelOneState.status === "success" && !levelOneState.requiresGateway) ||
      (levelTwoState.status === "success" && !levelTwoState.requiresGateway) ||
      (levelThreeState.status === "success" &&
        !levelThreeState.requiresGateway) ||
      apiTokenState.status === "success"
    ) {
      router.refresh()
    }
  }, [
    apiTokenState.status,
    levelOneState.paymentUrl,
    levelOneState.requiresGateway,
    levelOneState.status,
    levelTwoState.paymentUrl,
    levelTwoState.requiresGateway,
    levelTwoState.status,
    levelThreeState.paymentUrl,
    levelThreeState.requiresGateway,
    levelThreeState.status,
    router,
  ])

  const paymentReturnMessage = useMemo(() => {
    if (!paymentStatus) return null

    if (paymentStatus === "failed") {
      return returnContext === "user_verification_level_three"
        ? "پرداخت تایید نشد یا کارت بانکی متعلق به کد ملی شما نبود؛ احراز هویت بانکی انجام نشد."
        : "پرداخت تایید نشد. احراز هویت انجام نشده است؛ می‌توانید دوباره تلاش کنید."
    }

    if (inquiryStatus === "unavailable") {
      return "پرداخت به کیف پول شما اضافه شد، اما سرویس استعلام پاسخ نداد و هزینه‌ای کسر نشد."
    }

    if (inquiryStatus === "not_matched") {
      return returnContext === "user_verification_level_one"
        ? "استعلام انجام شد و هزینه آن کسر شد، اما کد ملی و شماره موبایل مطابقت ندارند."
        : "استعلام انجام شد و هزینه آن کسر شد، اما اطلاعات هویتی واردشده با ثبت احوال مطابقت ندارد."
    }

    switch (returnContext) {
      case "user_verification_level_one":
        return "پرداخت و احراز هویت سطح ۱ با موفقیت انجام شد."
      case "user_verification_level_two":
        return "پرداخت و احراز هویت سطح ۲ با موفقیت انجام شد."
      case "user_verification_level_three":
        return "احراز هویت بانکی سطح ۳ تایید شد و مبلغ پرداختی به موجودی قابل برداشت کیف پول شما افزوده شد."
      default:
        return "پرداخت و استعلام با موفقیت انجام شد."
    }
  }, [inquiryStatus, paymentStatus, returnContext])

  const paymentReturnTone =
    paymentStatus === "failed"
      ? "error"
      : inquiryStatus === "not_matched" || inquiryStatus === "unavailable"
        ? "warning"
        : "success"

  const openPaymentConfirmation = (action: PaidAction) => {
    if (action === "level_three") {
      const amount = data.pricing.levelThreeDepositAmount

      setConfirmingPayment({
        action,
        title: "تایید احراز هویت بانکی سطح ۳",
        cost: amount,
        submitLabel: "ورود به درگاه بانکی",
        body: `برای اثبات مالکیت کارت باید ${formatMoney(amount)} را با کارت بانکی متعلق به کد ملی خودتان پرداخت کنید. پس از تایید تراکنش، کل مبلغ به موجودی قابل برداشت کیف پول شما افزوده می‌شود.`,
        showWalletBalance: false,
      })

      return
    }

    const isLevelOne = action === "level_one"
    const cost = isLevelOne
      ? data.pricing.levelOneCost
      : data.pricing.levelTwoCost
    const title = isLevelOne
      ? "تایید احراز هویت سطح ۱"
      : "تایید احراز هویت سطح ۲"
    const submitLabel = cost > 0 ? "تایید و پرداخت" : "تایید و ادامه"
    const body =
      cost <= 0
        ? "این مرحله رایگان است. با تایید شما، اطلاعات واردشده برای استعلام و ثبت احراز هویت ارسال می‌شود."
        : walletBalance >= cost
          ? `هزینه این مرحله ${formatMoney(cost)} است و از موجودی کیف پول شما کسر می‌شود.`
          : `هزینه این مرحله ${formatMoney(cost)} است. موجودی کیف پول کافی نیست و پس از تایید به درگاه پرداخت هدایت می‌شوید.`

    setConfirmingPayment({
      action,
      title,
      cost,
      submitLabel,
      body,
      showWalletBalance: true,
    })
  }

  const submitConfirmedPayment = () => {
    const target =
      confirmingPayment?.action === "level_one"
        ? levelOneFormRef.current
        : confirmingPayment?.action === "level_two"
          ? levelTwoFormRef.current
          : levelThreeFormRef.current

    setConfirmingPayment(null)
    window.setTimeout(() => target?.requestSubmit(), 0)
  }

  return (
    <div className="space-y-4">
      {paymentReturnMessage && (
        <div
          className={`rounded-lg px-4 py-3 text-sm ${
            paymentReturnTone === "error"
              ? "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-100"
              : paymentReturnTone === "success"
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-100"
                : "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-100"
          }`}
        >
          {paymentReturnMessage}
        </div>
      )}

      {data.verification.needsRenewal && data.verification.renewalMessage && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-7 text-amber-700 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-100">
          {data.verification.renewalMessage}
        </div>
      )}

      <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
            <div className="text-sm text-gray-500">سطح فعال</div>
            <div className="mt-3 flex items-end justify-between gap-3">
              <span className="text-5xl font-bold text-primary">
                {data.verification.activeVerifiedLevel.toLocaleString("fa-IR")}
              </span>
              <span className="text-sm text-gray-500">از ۳ سطح</span>
            </div>
          </div>
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="text-sm font-semibold">سطح ۱</span>
              <StatusPill
                active={levelOneActive}
                pendingLabel={levelOneVerified ? "نیازمند تمدید" : "در انتظار"}
              />
            </div>
            <ValidityBadge
              expired={data.verification.mobileExpired}
              expiresAt={data.verification.mobileExpiresAt}
            />
          </div>
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="text-sm font-semibold">سطح ۲</span>
              <StatusPill
                active={levelTwoActive}
                pendingLabel={
                  levelTwoVerified
                    ? "نیازمند تمدید"
                    : levelOneActive
                      ? "در انتظار تکمیل"
                      : "نیازمند سطح ۱"
                }
              />
            </div>
            <ValidityBadge
              expired={data.verification.nationalExpired}
              expiresAt={data.verification.nationalExpiresAt}
            />
          </div>
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="text-sm font-semibold">سطح ۳</span>
              <StatusPill
                active={levelThreeActive}
                pendingLabel={
                  levelThreeVerified
                    ? "نیازمند سطح ۲ فعال"
                    : levelTwoActive
                      ? "در انتظار پرداخت"
                      : "نیازمند سطح ۲"
                }
              />
            </div>
            <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600 dark:bg-gray-700 dark:text-gray-200">
              احراز مالکیت کارت بانکی
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid gap-4">
          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <StepNumber active={levelOneActive}>۱</StepNumber>
                <div className="space-y-2">
                  <SectionHeader
                    icon={<TbDeviceMobileCheck />}
                    title="احراز هویت سطح ۱"
                  />
                  <div className="flex flex-wrap gap-2">
                    <ValidityBadge
                      expired={data.verification.mobileExpired}
                      expiresAt={data.verification.mobileExpiresAt}
                    />
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-200">
                      هزینه: {formatCost(data.pricing.levelOneCost)}
                    </span>
                  </div>
                </div>
              </div>
              <StatusPill
                active={levelOneActive}
                pendingLabel={levelOneVerified ? "نیازمند تمدید" : "در انتظار"}
              />
            </div>
            <Form
              ref={levelOneFormRef}
              action={levelOneAction}
              className="mt-5 space-y-4"
            >
              <input type="hidden" name="returnUrl" value={returnUrl} />
              <div className="grid gap-4 md:grid-cols-2">
                <FormItem label="شماره همراه">
                  <Input
                    value={data.user.mobile}
                    readOnly
                    className="bg-gray-50 dark:bg-gray-800"
                  />
                </FormItem>
                <FormItem
                  label="کد ملی"
                  invalid={Boolean(levelOneState.fieldErrors?.nationalId)}
                  errorMessage={levelOneState.fieldErrors?.nationalId?.[0]}
                >
                  <Input
                    name="nationalId"
                    inputMode="numeric"
                    maxLength={10}
                    defaultValue={data.profile.nationalId ?? ""}
                    readOnly={levelOneActive}
                    className={
                      levelOneActive ? "bg-gray-50 dark:bg-gray-800" : ""
                    }
                  />
                </FormItem>
              </div>
              <ActionMessage state={levelOneState} />
              {showLevelOneAction && (
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="solid"
                    loading={levelOnePending}
                    onClick={() => openPaymentConfirmation("level_one")}
                  >
                    {levelOneVerified ? "تمدید سطح ۱" : "استعلام سطح ۱"}
                  </Button>
                </div>
              )}
            </Form>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <StepNumber active={levelTwoActive}>۲</StepNumber>
                <div className="space-y-2">
                  <SectionHeader icon={<TbId />} title="احراز هویت سطح ۲" />
                  <div className="flex flex-wrap gap-2">
                    <ValidityBadge
                      expired={data.verification.nationalExpired}
                      expiresAt={data.verification.nationalExpiresAt}
                    />
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-200">
                      هزینه: {formatCost(data.pricing.levelTwoCost)}
                    </span>
                  </div>
                </div>
              </div>
              <StatusPill
                active={levelTwoActive}
                pendingLabel={
                  levelTwoVerified
                    ? "نیازمند تمدید"
                    : levelOneActive
                      ? "در انتظار تکمیل"
                      : "نیازمند احرازهویت سطح 1"
                }
              />
            </div>

            <Form
              ref={levelTwoFormRef}
              action={levelTwoAction}
              className="mt-5 space-y-4"
            >
              <input type="hidden" name="returnUrl" value={returnUrl} />
              <div className="grid gap-4 md:grid-cols-3">
                <FormItem label="شماره همراه">
                  <Input
                    value={data.user.mobile}
                    readOnly
                    className="bg-gray-50 dark:bg-gray-800"
                  />
                </FormItem>
                <FormItem label="کد ملی">
                  <Input
                    value={data.profile.nationalId ?? ""}
                    readOnly
                    className="bg-gray-50 dark:bg-gray-800"
                  />
                </FormItem>
                <FormItem
                  label="تاریخ تولد"
                  invalid={Boolean(levelTwoState.fieldErrors?.birthDate)}
                  errorMessage={levelTwoState.fieldErrors?.birthDate?.[0]}
                >
                  <BirthDateSelect
                    disabled={!levelOneActive || levelTwoActive}
                    value={birthDate}
                    onChange={setBirthDate}
                  />
                </FormItem>
              </div>
              <ActionMessage state={levelTwoState} />
              {showLevelTwoAction && (
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="solid"
                    loading={levelTwoPending}
                    onClick={() => openPaymentConfirmation("level_two")}
                  >
                    {levelTwoVerified ? "تمدید سطح ۲" : "استعلام سطح ۲"}
                  </Button>
                </div>
              )}
            </Form>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <StepNumber active={levelThreeActive}>۳</StepNumber>
                <div className="space-y-2">
                  <SectionHeader
                    icon={<TbCreditCard />}
                    title="احراز هویت بانکی سطح ۳"
                  />
                  <p className="max-w-2xl text-sm leading-7 text-gray-500 dark:text-gray-400">
                    مبلغ ثابت{" "}
                    {formatMoney(data.pricing.levelThreeDepositAmount)} را با
                    کارت متعلق به کد ملی خودتان پرداخت کنید. پس از تایید مالکیت
                    کارت، تمام مبلغ به کیف پول شما بازمی‌گردد.
                  </p>
                </div>
              </div>
              <StatusPill
                active={levelThreeActive}
                pendingLabel={
                  levelTwoActive
                    ? "در انتظار پرداخت بانکی"
                    : "نیازمند احراز هویت سطح ۲"
                }
              />
            </div>

            <Form
              ref={levelThreeFormRef}
              action={levelThreeAction}
              className="mt-5 space-y-4"
            >
              <input type="hidden" name="returnUrl" value={returnUrl} />
              <div className="grid gap-4 md:grid-cols-3">
                <FormItem label="شماره همراه">
                  <Input
                    value={data.user.mobile}
                    readOnly
                    className="bg-gray-50 dark:bg-gray-800"
                  />
                </FormItem>
                <FormItem label="کد ملی">
                  <Input
                    value={data.profile.nationalId ?? ""}
                    readOnly
                    className="bg-gray-50 dark:bg-gray-800"
                  />
                </FormItem>
                <FormItem label="مبلغ پرداخت و بازگشت به کیف پول">
                  <Input
                    value={formatMoney(data.pricing.levelThreeDepositAmount)}
                    readOnly
                    className="bg-gray-50 dark:bg-gray-800"
                  />
                </FormItem>
              </div>
              <ActionMessage state={levelThreeState} />
              {showLevelThreeAction && (
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="solid"
                    loading={levelThreePending}
                    onClick={() => openPaymentConfirmation("level_three")}
                  >
                    پرداخت و احراز مالکیت کارت
                  </Button>
                </div>
              )}
            </Form>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
            <SectionHeader icon={<TbShieldCheck />} title="سطح احراز هویت" />
            <div className="mt-5 space-y-2">
              <InfoRow
                label="سطح فعال"
                value={data.verification.activeVerifiedLevel.toLocaleString(
                  "fa-IR",
                )}
              />
              <InfoRow
                label="سطح ثبت‌شده"
                value={data.verification.verifiedLevel.toLocaleString("fa-IR")}
              />
              <InfoRow
                label="موبایل"
                value={<StatusPill active={levelOneActive} />}
              />
              <InfoRow
                label="هویت پایه"
                value={<StatusPill active={levelTwoActive} />}
              />
              <InfoRow
                label="مالکیت کارت بانکی"
                value={<StatusPill active={levelThreeActive} />}
              />
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-start justify-between gap-3">
              <SectionHeader icon={<TbApi />} title="توکن دسترسی API" />
              {levelTwoActive ? (
                <StatusPill active={data.apiToken.enabled} />
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-500 dark:bg-gray-800">
                  <TbLock />
                  نیازمند احرازهویت
                </span>
              )}
            </div>
            <Form action={apiTokenAction} className="mt-5 space-y-3">
              {token && (
                <div className="space-y-2">
                  <Input
                    dir="ltr"
                    readOnly
                    value={token}
                    className="font-mono text-xs"
                  />
                  <Button
                    type="button"
                    size="sm"
                    icon={<TbClipboard />}
                    onClick={() => navigator.clipboard?.writeText(token)}
                  >
                    کپی توکن
                  </Button>
                </div>
              )}
              <ActionMessage state={apiTokenState} />
              <Button
                type="submit"
                variant="solid"
                block
                loading={apiTokenPending}
                disabled={!levelTwoActive}
              >
                {data.apiToken.enabled ? "صدور مجدد توکن" : "فعال‌سازی توکن API"}
              </Button>
            </Form>
          </div>
        </aside>
      </div>

      <Dialog
        isOpen={Boolean(confirmingPayment)}
        width={460}
        onClose={() => setConfirmingPayment(null)}
      >
        {confirmingPayment && (
          <div className="space-y-5">
            <div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {confirmingPayment.title}
              </h4>
              <p className="mt-2 text-sm leading-7 text-gray-600 dark:text-gray-300">
                {confirmingPayment.body}
              </p>
            </div>
            {confirmingPayment.cost > 0 && (
              <div className="grid gap-2 rounded-lg bg-gray-50 p-3 text-sm dark:bg-gray-800">
                <InfoRow
                  label="هزینه"
                  value={formatMoney(confirmingPayment.cost)}
                />
                {confirmingPayment.showWalletBalance && (
                  <InfoRow
                    label="موجودی کیف پول"
                    value={formatMoney(walletBalance)}
                  />
                )}
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button type="button" onClick={() => setConfirmingPayment(null)}>
                انصراف
              </Button>
              <Button
                type="button"
                variant="solid"
                loading={
                  confirmingPayment.action === "level_one"
                    ? levelOnePending
                    : confirmingPayment.action === "level_two"
                      ? levelTwoPending
                      : levelThreePending
                }
                onClick={submitConfirmedPayment}
              >
                {confirmingPayment.submitLabel}
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  )
}
