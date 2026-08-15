"use client"

import { useActionState, useEffect, useMemo, useRef, useState } from "react"
import type { ReactNode } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Avatar from "@/components/ui/Avatar"
import Button from "@/components/ui/Button"
import Dialog from "@/components/ui/Dialog"
import Input from "@/components/ui/Input"
import Switcher from "@/components/ui/Switcher"
import { Form, FormItem } from "@/components/ui/Form"
import { updateProfile } from "@/server/actions/profile/updateProfile"
import { updateBankAccount } from "@/server/actions/profile/updateBankAccount"
import SignatureCanvas from "../../contracts/_components/SignatureCanvas"
import type {
  ProfileActionState,
  UserProfilePayload,
} from "@/server/actions/profile/profile.schemas"
import type { Province } from "@/server/actions/locations/getLocations"
import {
  TbBell,
  TbBuildingBank,
  TbCameraPlus,
  TbCheck,
  TbClock,
  TbDeviceMobileCheck,
  TbFileCheck,
  TbId,
  TbShieldCheck,
  TbSignature,
  TbUpload,
  TbUser,
} from "react-icons/tb"

type ProfileSettingsClientProps = {
  profile: UserProfilePayload
  provinces: Province[]
  paymentStatus?: "success" | "failed" | null
  inquiryStatus?: "matched" | "not_matched" | "unavailable" | null
  returnContext?: string | null
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

const initialState: ProfileActionState = {
  status: "idle",
  message: null,
}

const bankInitialState: ProfileActionState = {
  status: "idle",
  message: null,
}

const formatDate = (value?: string | null) => {
  if (!value) return "ثبت نشده"

  return new Intl.DateTimeFormat("fa-IR-u-ca-persian-nu-arabext", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Tehran",
  }).format(new Date(value))
}

const initialsFor = (firstName?: string, lastName?: string) => {
  const value = `${firstName?.charAt(0) ?? ""}${lastName?.charAt(0) ?? ""}`
  return value || "د"
}

const completionItems = (profile: UserProfilePayload) => [
  Boolean(profile.profile.avatarUrl),
  Boolean(profile.user.firstName && profile.user.lastName),
  Boolean(profile.user.email),
  Boolean(profile.profile.nationalId),
  Boolean(profile.profile.iban),
  Boolean(profile.profile.cityId),
  Boolean(profile.profile.signatureUrl),
]

const parseUploadResponse = (value: string) => {
  try {
    return JSON.parse(value || "{}")
  } catch {
    return null
  }
}

const dataUrlToFile = async (dataUrl: string, fileName: string) => {
  const response = await fetch(dataUrl)
  const blob = await response.blob()

  return new File([blob], fileName, { type: blob.type || "image/png" })
}

const parseJalaliDate = (value?: string | null) => {
  const [year = "", month = "", day = ""] = (value ?? "").split("-")

  return { day, month, year }
}

function StatusPill({
  active,
  children,
}: {
  active: boolean
  children: ReactNode
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
      {children}
    </span>
  )
}

function SectionTitle({ icon, title }: { icon: ReactNode title: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-xl text-gray-700 dark:bg-gray-800 dark:text-gray-100">
        {icon}
      </div>
      <div>
        <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
          {title}
        </h3>
      </div>
    </div>
  )
}

function UploadAvatar({ profile }: { profile: UserProfilePayload }) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [avatarUrl, setAvatarUrl] = useState(profile.profile.avatarUrl)
  const [progress, setProgress] = useState<number | null>(null)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const uploadFile = (file: File) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"]

    if (!allowedTypes.includes(file.type)) {
      setError("فرمت تصویر باید JPG، PNG یا WEBP باشد.")
      setMessage(null)
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("حجم تصویر پروفایل نباید بیشتر از ۵ مگابایت باشد.")
      setMessage(null)
      return
    }

    const formData = new FormData()
    formData.append("file", file)

    const request = new XMLHttpRequest()
    request.open("POST", "/api/profile/avatar")
    request.setRequestHeader("Accept", "application/json")

    setUploading(true)
    setProgress(0)
    setError(null)
    setMessage(null)

    request.upload.onprogress = (event) => {
      if (!event.lengthComputable) return
      setProgress(Math.round((event.loaded / event.total) * 100))
    }

    request.onload = () => {
      const body = parseUploadResponse(request.responseText)
      const firstError = Object.values(body?.errors ?? {})
        .flat()
        .find(Boolean)

      if (request.status < 200 || request.status >= 300) {
        setError(
          String(
            firstError || body?.message || "بارگذاری تصویر پروفایل انجام نشد.",
          ),
        )
        setUploading(false)
        setProgress(null)
        return
      }

      setAvatarUrl(body?.data?.avatarUrl ?? URL.createObjectURL(file))
      setMessage(body?.message || "تصویر پروفایل ذخیره شد.")
      setUploading(false)
      setProgress(100)
      window.setTimeout(() => setProgress(null), 800)
      router.refresh()
    }

    request.onerror = () => {
      setError("ارتباط هنگام بارگذاری تصویر برقرار نشد.")
      setUploading(false)
      setProgress(null)
    }

    request.send(formData)
  }

  return (
    <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
      <SectionTitle icon={<TbCameraPlus />} title="تصویر پروفایل" />

      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center">
        <Avatar
          size={92}
          className="border-4 border-white bg-gray-100 text-xl font-bold text-gray-500 shadow-lg dark:border-gray-900 dark:bg-gray-800"
          src={avatarUrl ?? undefined}
        >
          {initialsFor(profile.user.firstName, profile.user.lastName)}
        </Avatar>
        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="solid"
              icon={<TbUpload />}
              loading={uploading}
              onClick={() => inputRef.current?.click()}
            >
              بارگذاری تصویر
            </Button>
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0]
                event.target.value = ""
                if (file) uploadFile(file)
              }}
            />
          </div>
          {progress !== null && (
            <div className="space-y-1">
              <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-xs text-gray-500">
                {progress.toLocaleString("fa-IR")}٪ بارگذاری شده
              </div>
            </div>
          )}
          {(message || error) && (
            <div
              className={
                error
                  ? "rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-100"
                  : "rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-100"
              }
            >
              {error ?? message}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function UploadSignature({
  profile,
  className = "",
}: {
  profile: UserProfilePayload
  className?: string
}) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [mode, setMode] = useState<"upload" | "draw">(
    profile.profile.signatureUrl ? "upload" : "draw",
  )
  const [signatureUrl, setSignatureUrl] = useState(profile.profile.signatureUrl)
  const [drawing, setDrawing] = useState<string | null>(null)
  const [progress, setProgress] = useState<number | null>(null)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const openDialog = () => {
    setDialogOpen(true)
    setError(null)
    setProgress(null)
  }

  const closeDialog = () => {
    if (uploading) return

    setDialogOpen(false)
    setError(null)
    setProgress(null)
  }

  const uploadFile = (file: File) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"]

    if (!allowedTypes.includes(file.type)) {
      setError("فرمت تصویر امضا باید JPG، PNG یا WEBP باشد.")
      setMessage(null)
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("حجم تصویر امضا نباید بیشتر از ۵ مگابایت باشد.")
      setMessage(null)
      return
    }

    const formData = new FormData()
    formData.append("file", file)

    const request = new XMLHttpRequest()
    request.open("POST", "/api/profile/signature")
    request.setRequestHeader("Accept", "application/json")

    setUploading(true)
    setProgress(0)
    setError(null)
    setMessage(null)

    request.upload.onprogress = (event) => {
      if (!event.lengthComputable) return
      setProgress(Math.round((event.loaded / event.total) * 100))
    }

    request.onload = () => {
      const body = parseUploadResponse(request.responseText)
      const firstError = Object.values(body?.errors ?? {})
        .flat()
        .find(Boolean)

      if (request.status < 200 || request.status >= 300) {
        setError(
          String(
            firstError || body?.message || "بارگذاری تصویر امضا انجام نشد.",
          ),
        )
        setUploading(false)
        setProgress(null)
        return
      }

      setSignatureUrl(body?.data?.signatureUrl ?? URL.createObjectURL(file))
      setMessage("تصویر امضا با موفقیت ذخیره شد.")
      setUploading(false)
      setProgress(null)
      setDialogOpen(false)
      setDrawing(null)
      router.refresh()
    }

    request.onerror = () => {
      setError("ارتباط هنگام بارگذاری تصویر امضا برقرار نشد.")
      setUploading(false)
      setProgress(null)
    }

    request.send(formData)
  }

  const saveDrawing = async () => {
    if (!drawing) {
      setError("ابتدا امضای خود را در کادر ترسیم کنید.")
      setMessage(null)
      return
    }

    const file = await dataUrlToFile(drawing, "profile-signature.png")
    uploadFile(file)
  }

  return (
    <div
      className={`rounded-lg border border-gray-200 p-4 dark:border-gray-700 ${className}`}
    >
      <SectionTitle icon={<TbSignature />} title="امضای الکترونیکی" />
      <div className="mt-4 space-y-3">
        <div className="flex min-h-[260px] items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-800">
          {signatureUrl ? (
            <img
              src={signatureUrl}
              alt="امضای کاربر"
              className="max-h-60 max-w-full object-contain"
            />
          ) : (
            <div className="text-center text-sm leading-6 text-gray-500">
              هنوز تصویری برای امضا ثبت نشده است.
            </div>
          )}
        </div>
        <Button
          type="button"
          variant="solid"
          icon={<TbSignature />}
          block
          onClick={openDialog}
        >
          {signatureUrl ? "بروزرسانی امضا" : "ثبت امضا"}
        </Button>
        {message && (
          <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-100">
            {message}
          </div>
        )}
      </div>

      <Dialog
        isOpen={dialogOpen}
        width={620}
        contentClassName="max-h-[92vh] overflow-hidden p-0"
        onClose={closeDialog}
        onRequestClose={closeDialog}
      >
        <div className="flex max-h-[92vh] flex-col overflow-hidden">
          <div className="shrink-0 border-b border-gray-100 px-5 py-4 pe-12 dark:border-gray-800">
            <h4 className="text-base font-semibold">بروزرسانی امضا</h4>
          </div>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                active={mode === "upload"}
                disabled={uploading}
                onClick={() => setMode("upload")}
              >
                آپلود تصویر
              </Button>
              <Button
                type="button"
                active={mode === "draw"}
                disabled={uploading}
                onClick={() => setMode("draw")}
              >
                ترسیم امضا
              </Button>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-100">
                {error}
              </div>
            )}

            {mode === "upload" ? (
              <div className="space-y-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  بارگذاری تصویر امضا
                </div>
                <Button
                  type="button"
                  variant="solid"
                  icon={<TbUpload />}
                  loading={uploading}
                  block
                  onClick={() => inputRef.current?.click()}
                >
                  انتخاب و بارگذاری تصویر
                </Button>
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                  className="hidden"
                  disabled={uploading}
                  onChange={(event) => {
                    const file = event.target.files?.[0]
                    event.target.value = ""
                    if (file) uploadFile(file)
                  }}
                />
              </div>
            ) : (
              <div className="space-y-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  ترسیم امضا
                </div>
                <SignatureCanvas onChange={setDrawing} />
              </div>
            )}

            {progress !== null && (
              <div className="space-y-1 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500">
                  {progress.toLocaleString("fa-IR")}٪ بارگذاری شده
                </div>
              </div>
            )}
          </div>

          <div className="shrink-0 border-t border-gray-100 bg-white px-5 py-3 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex justify-end gap-2">
              <Button type="button" disabled={uploading} onClick={closeDialog}>
                انصراف
              </Button>
              {mode === "draw" && (
                <Button
                  type="button"
                  variant="solid"
                  loading={uploading}
                  disabled={uploading}
                  onClick={saveDrawing}
                >
                  ذخیره امضا
                </Button>
              )}
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  )
}

function JalaliBirthDateSelect({
  disabled = false,
  onChange,
  value,
}: {
  disabled?: boolean
  onChange: (value: { day: string month: string year: string }) => void
  value: { day: string month: string year: string }
}) {
  const years = Array.from({ length: 91 }, (_, index) => String(1405 - index))
  const days = Array.from({ length: 31 }, (_, index) =>
    String(index + 1).padStart(2, "0"),
  )
  const selectClassName = `h-11 w-full rounded-xl border border-gray-300 bg-gray-100 px-4 text-sm text-gray-700 outline-none transition focus:border-primary focus:bg-transparent focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 dark:border-gray-700 dark:bg-gray-700 dark:text-gray-100 dark:disabled:bg-gray-800`

  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {disabled && (
        <>
          <input type="hidden" name="birthDay" value={value.day} />
          <input type="hidden" name="birthMonth" value={value.month} />
          <input type="hidden" name="birthYear" value={value.year} />
        </>
      )}
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

function BankAccountBox({
  iban,
  verified,
  verificationCost,
  paymentMessage,
  paymentMessageStatus,
}: {
  iban: string | null
  verified: boolean
  verificationCost: number
  paymentMessage: string | null
  paymentMessageStatus: "success" | "error" | null
}) {
  const router = useRouter()
  const [returnUrl, setReturnUrl] = useState("")
  const [state, formAction, pending] = useActionState(
    updateBankAccount,
    bankInitialState,
  )

  useEffect(() => {
    setReturnUrl(`${window.location.origin}/pishkhan/profile`)
  }, [])

  useEffect(() => {
    if (state.paymentUrl) {
      window.location.href = state.paymentUrl
      return
    }

    if (state.status === "success" && !state.requiresGateway) {
      router.refresh()
    }
  }, [router, state.paymentUrl, state.requiresGateway, state.status])

  return (
    <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
      <div className="flex items-start justify-between gap-3">
        <SectionTitle icon={<TbBuildingBank />} title="شماره شبا" />
        <StatusPill active={verified}>
          {verified ? "تطبیق شده" : "استعلام نشده"}
        </StatusPill>
      </div>
      <Form action={formAction} className="mt-4 space-y-3">
        <input type="hidden" name="returnUrl" value={returnUrl} />
        <FormItem
          label={
            <div className="flex items-center gap-2">
              <span>شماره شبا</span>
              {verificationCost > 0 && (
                <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
                  هزینه استعلام: {verificationCost.toLocaleString("fa-IR")}{" "}
                  تومان
                </span>
              )}
            </div>
          }
          invalid={Boolean(state.fieldErrors?.iban)}
          errorMessage={state.fieldErrors?.iban?.[0]}
        >
          <Input
            name="iban"
            dir="ltr"
            defaultValue={iban ?? ""}
            placeholder="IR000000000000000000000000"
          />
        </FormItem>
        {state.message && (
          <div
            className={
              state.status === "success"
                ? "rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-100"
                : "rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-100"
            }
          >
            {state.message}
          </div>
        )}
        {paymentMessage && (
          <div
            className={
              paymentMessageStatus === "success"
                ? "rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-100"
                : "rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:bg-amber-900/30 dark:text-amber-100"
            }
          >
            {paymentMessage}
          </div>
        )}
        <Button type="submit" variant="solid" loading={pending} block>
          ثبت و استعلام
        </Button>
      </Form>
    </div>
  )
}

export default function ProfileSettingsClient({
  profile,
  provinces,
  paymentStatus,
  inquiryStatus,
  returnContext,
}: ProfileSettingsClientProps) {
  const router = useRouter()
  const [state, formAction, pending] = useActionState(
    updateProfile,
    initialState,
  )
  const initialProvinceId = useMemo(
    () =>
      provinces.find((province) =>
        province.cities.some((city) => city.id === profile.profile.cityId),
      )?.id ?? "",
    [profile.profile.cityId, provinces],
  )
  const profileCityId = profile.profile.cityId
    ? String(profile.profile.cityId)
    : ""
  const profileBirthDate = profile.profile.birthDate ?? ""
  const [selectedProvinceId, setSelectedProvinceId] = useState(() =>
    String(initialProvinceId),
  )
  const [selectedCityId, setSelectedCityId] = useState(profileCityId)
  const [birthDateParts, setBirthDateParts] = useState(() =>
    parseJalaliDate(profileBirthDate),
  )
  const selectedProvince = provinces.find(
    (province) => String(province.id) === selectedProvinceId,
  )
  const provinceCities = selectedProvince?.cities ?? []
  const identityLocked = profile.verification.identityLocked
  const bankPaymentMessage = useMemo(() => {
    if (returnContext !== "user_bank_account_verification") return null

    if (paymentStatus === "failed") {
      return "پرداخت تایید نشد و استعلام شماره شبا انجام نشد."
    }

    if (inquiryStatus === "unavailable") {
      return "پرداخت به کیف پول شما اضافه شد، اما سرویس استعلام پاسخ نداد و هزینه‌ای کسر نشد."
    }

    if (inquiryStatus === "not_matched") {
      return "استعلام انجام شد و هزینه آن کسر شد، اما شماره شبا متعلق به صاحب کد ملی حساب نیست."
    }

    if (paymentStatus === "success" && inquiryStatus === "matched") {
      return "پرداخت و تطبیق شماره شبا با موفقیت انجام شد."
    }

    return null
  }, [inquiryStatus, paymentStatus, returnContext])
  const activeVerifiedLevel =
    profile.verification.activeVerifiedLevel ??
    profile.verification.verifiedLevel

  const completed = completionItems(profile).filter(Boolean).length
  const completionPercent = Math.round((completed / 7) * 100)

  useEffect(() => {
    setSelectedProvinceId(String(initialProvinceId))
    setSelectedCityId(profileCityId)
    setBirthDateParts(parseJalaliDate(profileBirthDate))
  }, [initialProvinceId, profileBirthDate, profileCityId])

  useEffect(() => {
    if (state.status === "success") {
      router.refresh()
    }
  }, [router, state.status])

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px] 2xl:grid-cols-[minmax(0,1fr)_minmax(680px,760px)]">
      <div className="space-y-5">
        <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
          <SectionTitle icon={<TbUser />} title="اطلاعات هویتی و تماس" />

          <Form action={formAction} className="mt-5 space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <FormItem
                label="نام"
                invalid={Boolean(state.fieldErrors?.firstName)}
                errorMessage={state.fieldErrors?.firstName?.[0]}
              >
                <Input
                  name="firstName"
                  defaultValue={profile.user.firstName}
                  placeholder="نام"
                  readOnly={identityLocked}
                  className={
                    identityLocked ? "bg-gray-50 dark:bg-gray-800" : ""
                  }
                />
              </FormItem>
              <FormItem
                label="نام خانوادگی"
                invalid={Boolean(state.fieldErrors?.lastName)}
                errorMessage={state.fieldErrors?.lastName?.[0]}
              >
                <Input
                  name="lastName"
                  defaultValue={profile.user.lastName}
                  placeholder="نام خانوادگی"
                  readOnly={identityLocked}
                  className={
                    identityLocked ? "bg-gray-50 dark:bg-gray-800" : ""
                  }
                />
              </FormItem>
              <FormItem label="شماره موبایل">
                <Input
                  value={profile.user.mobile}
                  readOnly
                  className="bg-gray-50 dark:bg-gray-800"
                />
              </FormItem>
              <FormItem
                label="ایمیل"
                invalid={Boolean(state.fieldErrors?.email)}
                errorMessage={state.fieldErrors?.email?.[0]}
              >
                <Input
                  name="email"
                  type="email"
                  defaultValue={profile.user.email ?? ""}
                  placeholder="name@example.com"
                />
              </FormItem>
              <FormItem
                label="کد ملی"
                invalid={Boolean(state.fieldErrors?.nationalId)}
                errorMessage={state.fieldErrors?.nationalId?.[0]}
              >
                <Input
                  name="nationalId"
                  inputMode="numeric"
                  maxLength={10}
                  defaultValue={profile.profile.nationalId ?? ""}
                  placeholder="۰۰۱۲۳۴۵۶۷۸"
                  readOnly={identityLocked}
                  className={
                    identityLocked ? "bg-gray-50 dark:bg-gray-800" : ""
                  }
                />
              </FormItem>
              <FormItem
                label="تاریخ تولد"
                invalid={Boolean(state.fieldErrors?.birthDate)}
                errorMessage={state.fieldErrors?.birthDate?.[0]}
              >
                <JalaliBirthDateSelect
                  disabled={identityLocked}
                  value={birthDateParts}
                  onChange={setBirthDateParts}
                />
              </FormItem>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormItem label="استان">
                <select
                  value={selectedProvinceId}
                  onChange={(event) => {
                    setSelectedProvinceId(event.target.value)
                    setSelectedCityId("")
                  }}
                  className="h-11 w-full rounded-xl border border-gray-300 bg-gray-100 px-4 text-sm text-gray-700 outline-none transition focus:border-primary focus:bg-transparent focus:ring-1 focus:ring-primary dark:border-gray-700 dark:bg-gray-700 dark:text-gray-100"
                >
                  <option value="">انتخاب استان</option>
                  {provinces.map((province) => (
                    <option key={province.id} value={province.id}>
                      {province.name}
                    </option>
                  ))}
                </select>
              </FormItem>
              <FormItem
                label="شهر"
                invalid={Boolean(state.fieldErrors?.cityId)}
                errorMessage={state.fieldErrors?.cityId?.[0]}
              >
                <select
                  name="cityId"
                  value={selectedCityId}
                  disabled={!selectedProvinceId}
                  className="h-11 w-full rounded-xl border border-gray-300 bg-gray-100 px-4 text-sm text-gray-700 outline-none transition focus:border-primary focus:bg-transparent focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 dark:border-gray-700 dark:bg-gray-700 dark:text-gray-100 dark:disabled:bg-gray-800"
                  onChange={(event) => setSelectedCityId(event.target.value)}
                >
                  <option value="">
                    {selectedProvinceId
                      ? "انتخاب شهر"
                      : "ابتدا استان را انتخاب کنید"}
                  </option>
                  {provinceCities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </FormItem>
            </div>

            {(state.message || state.status !== "idle") && (
              <div
                className={
                  state.status === "success"
                    ? "rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-100"
                    : "rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-100"
                }
              >
                {state.message}
              </div>
            )}

            <div className="flex justify-end">
              <Button type="submit" variant="solid" loading={pending}>
                ذخیره تغییرات
              </Button>
            </div>
          </Form>
        </div>

        <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <SectionTitle icon={<TbBell />} title="تنظیمات اطلاع‌رسانی" />
            <Link href="/pishkhan/settings/notifications">
              <Button type="button" icon={<TbBell />}>
                تنظیمات اطلاع‌رسانی
              </Button>
            </Link>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["پیامک", profile.notificationPreferences.smsEnabled],
              ["دادبات", profile.notificationPreferences.botEnabled],
              ["Push", profile.notificationPreferences.pushEnabled],
              ["ایتا", profile.notificationPreferences.eitaaEnabled],
              ["بله", profile.notificationPreferences.baleEnabled],
            ].map(([label, enabled]) => (
              <div
                key={String(label)}
                className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-800"
              >
                <span className="text-sm">{label}</span>
                <Switcher checked={Boolean(enabled)} disabled />
              </div>
            ))}
            <div className="rounded-lg bg-gray-50 px-3 py-2 text-sm dark:bg-gray-800">
              <span className="block text-gray-500">موجودی پیامک</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {profile.notificationPreferences.smsBalance.toLocaleString(
                  "fa-IR",
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      <aside className="grid gap-4 self-start 2xl:grid-cols-2">
        <UploadAvatar profile={profile} />

        <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
          <div className="flex items-center justify-between gap-3">
            <SectionTitle icon={<TbShieldCheck />} title="تکمیل پروفایل" />
            <div className="text-2xl font-bold text-primary">
              {completionPercent.toLocaleString("fa-IR")}٪
            </div>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
          <div className="mt-4 grid gap-2 text-sm text-gray-600 dark:text-gray-300">
            <div className="flex items-center justify-between">
              <span>نقش حساب</span>
              <span className="font-semibold">{profile.user.roleLabel}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>عضویت</span>
              <span className="font-semibold">
                {formatDate(profile.user.registeredAt)}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
          <SectionTitle icon={<TbId />} title="احراز هویت" />
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-sm">
                <TbDeviceMobileCheck />
                تایید موبایل
              </span>
              <StatusPill active={activeVerifiedLevel >= 1}>
                {activeVerifiedLevel >= 1
                  ? "تایید شده"
                  : profile.verification.mobileVerified
                    ? "نیازمند تمدید"
                    : "در انتظار"}
              </StatusPill>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-sm">
                <TbFileCheck />
                هویت ملی
              </span>
              <StatusPill active={activeVerifiedLevel >= 2}>
                {activeVerifiedLevel >= 2
                  ? "تایید شده"
                  : profile.verification.nationalVerified
                    ? "نیازمند تمدید"
                    : "نیازمند بررسی"}
              </StatusPill>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-sm">
                <TbBuildingBank />
                مالکیت کارت بانکی
              </span>
              <StatusPill active={activeVerifiedLevel >= 3}>
                {activeVerifiedLevel >= 3
                  ? "تایید شده"
                  : activeVerifiedLevel >= 2
                    ? "نیازمند پرداخت بانکی"
                    : "نیازمند سطح ۲"}
              </StatusPill>
            </div>
            <Link href="/pishkhan/profile/verification">
              <Button type="button" variant="solid" block>
                {activeVerifiedLevel >= 3
                  ? "مدیریت احراز هویت"
                  : activeVerifiedLevel >= 2
                    ? "تکمیل احراز هویت سطح ۳"
                    : profile.verification.needsRenewal
                      ? "تمدید احراز هویت"
                      : "شروع احراز هویت"}
              </Button>
            </Link>
          </div>
        </div>

        <BankAccountBox
          iban={profile.profile.iban}
          verified={profile.verification.ibanVerified}
          verificationCost={profile.pricing.ibanVerificationCost}
          paymentMessage={bankPaymentMessage}
          paymentMessageStatus={
            inquiryStatus === "matched" ? "success" : "error"
          }
        />

        <UploadSignature profile={profile} className="2xl:col-span-2" />
      </aside>
    </div>
  )
}
