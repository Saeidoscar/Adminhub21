"use client"

import type {
  Contract,
  ContractAiPricing,
  ContractBasePricing,
  ContractFormValues,
  ContractPricingQuote,
  ContractSignature,
} from "@/@types/contracts"
import AdaptiveCard from "@/components/shared/AdaptiveCard"
import AttachmentList from "@/components/shared/AttachmentList"
import Container from "@/components/shared/Container"
import RichTextEditor from "@/components/shared/RichTextEditor"
import Button from "@/components/ui/Button"
import Dialog from "@/components/ui/Dialog"
import FormItem from "@/components/ui/Form/FormItem"
import Input from "@/components/ui/Input"
import Steps from "@/components/ui/Steps"
import StepItem from "@/components/ui/Steps/StepItem"
import Tag from "@/components/ui/Tag"
import Upload from "@/components/ui/Upload"
import { useRouter } from "next/navigation"
import {
  type ChangeEvent,
  useContext,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react"
import {
  TbArrowsMaximize,
  TbArrowsMinimize,
  TbAlertTriangle,
  TbBan,
  TbBrain,
  TbCheck,
  TbCopy,
  TbFileCertificate,
  TbFilePlus,
  TbLock,
  TbMailForward,
  TbPlus,
  TbPrinter,
  TbRefresh,
  TbReceipt,
  TbShare3,
  TbShieldCheck,
  TbTrash,
  TbUpload,
} from "react-icons/tb"
import {
  activateContract,
  analyzeContract,
  cancelContract,
  createContract,
  deleteContract,
  refreshContractPin,
  resendSignatureInvitation,
  sendSignatureOtp,
  signContract,
  updateContract,
  verifySignatureOtp,
} from "@/server/actions/contracts/mutateContracts"
import {
  ContractStatusTag,
  currentStepForStatus,
  formatPersianDate,
  formatPersianDateTime,
} from "./contract-ui"
import CompletedSignaturesCard from "./CompletedSignaturesCard"
import ContractEvidenceSummaryBar from "./ContractEvidenceSummaryBar"
import SignatureCanvas from "./SignatureCanvas"
import { getContractAiPricing } from "@/server/actions/contracts/getContracts"
import SessionContext from "@/components/auth/AuthProvider/SessionContext"
import { useDashboardHeader } from "@/components/template/DashboardHeaderProvider"

type Props = {
  contract?: Contract | null
  quote?: ContractPricingQuote | null
  basePricing?: ContractBasePricing | null
  paymentStatus?: "success" | "failed" | null
  purchaseType?: string | null
  returnContext?: string | null
}

const emptySignature = (): ContractFormValues["signatures"][number] => ({
  fullName: "",
  mobile: "",
  userId: null,
})

const failureForClient = (error: string) => ({
  ok: false,
  data: null,
  error,
  requiresAuth: false,
})

const toEnglishDigits = (value: string) =>
  value
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)))

const normalizeMobile = (value: string) =>
  toEnglishDigits(value).replace(/\s|-/g, "").trim()

const wait = (duration: number) =>
  new Promise((resolve) => window.setTimeout(resolve, duration))

const mobilePattern = /^09\d{9}$/
const maxAttachmentSize = 20 * 1024 * 1024
const maxSignatureImageSize = 5 * 1024 * 1024
const allowedAttachmentTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/jpeg",
  "image/png",
]
const allowedAttachmentExtensions = [
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "jpg",
  "jpeg",
  "png",
]
const allowedSignatureImageTypes = ["image/jpeg", "image/png", "image/webp"]
const allowedSignatureImageExtensions = ["jpg", "jpeg", "png", "webp"]

const contractStepLabels = [
  "تنظیم پیش‌نویس",
  "پرداخت و ثبت نهایی",
  "ارسال دعوت‌نامه",
  "امضای قرارداد / سند",
  "دریافت سند",
]

type UploadProgressItem = {
  id: string
  name: string
  progress: number
  status: "uploading" | "done" | "error"
  error?: string
}

type AttachmentDisplayDetails = {
  originalName?: string | null
  mimeType?: string | null
  sizeBytes?: number | null
  url?: string | null
}

type PaidContractAction = "activation" | "ai_analysis" | "ai_rewrite"

type PaymentConfirmation = {
  action: PaidContractAction
  title: string
  amount: number
  description: string
  confirmLabel: string
}

type ProfileSignatureImage = {
  id: number
  url: string
  originalName?: string | null
  mimeType?: string | null
  sizeBytes?: number | null
}

const parseUploadResponse = (value: string) => {
  try {
    return JSON.parse(value || "{}")
  } catch {
    return {}
  }
}

const formatCountdown = (milliseconds: number) => {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${minutes.toLocaleString("fa-IR")}:${seconds
    .toString()
    .padStart(2, "0")
    .replace(/\d/g, (digit) => Number(digit).toLocaleString("fa-IR"))}`
}

const dataUrlToFile = async (dataUrl: string, fileName: string) => {
  const response = await fetch(dataUrl)
  const blob = await response.blob()

  return new File([blob], fileName, {
    type: blob.type || "image/png",
  })
}

const ContractWorkspace = ({
  contract,
  quote,
  basePricing,
  paymentStatus,
  returnContext,
}: Props) => {
  const router = useRouter()
  const session = useContext(SessionContext)
  const { data: dashboardHeader, refresh: refreshDashboardHeader } =
    useDashboardHeader()
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [aiOpen, setAiOpen] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [deleteDraftOpen, setDeleteDraftOpen] = useState(false)
  const [isContractEditorFullscreen, setIsContractEditorFullscreen] =
    useState(false)
  const [aiText, setAiText] = useState<string | null>(
    contract?.aiAnalysis?.aiContent ?? null,
  )
  const [aiPricing, setAiPricing] = useState<ContractAiPricing | null>(null)
  const [paymentConfirmation, setPaymentConfirmation] =
    useState<PaymentConfirmation | null>(null)
  const [otpCodes, setOtpCodes] = useState<Record<number, string>>({})
  const [signatureDrawings, setSignatureDrawings] =
    useState<Record<number, string | null>>({})
  const [confirmedProfileSignatureIds, setConfirmedProfileSignatureIds] =
    useState<Record<number, number | null>>({})
  const [profileSignatureImage, setProfileSignatureImage] =
    useState<ProfileSignatureImage | null>(() => {
      const profile = contract?.currentUser?.profile

      if (!profile?.signatureId || !profile.signatureUrl) {
        return null
      }

      return {
        id: profile.signatureId,
        url: profile.signatureUrl,
      }
    })
  const [activeSignature, setActiveSignature] =
    useState<ContractSignature | null>(null)
  const [signatureDialogStep, setSignatureDialogStep] =
    useState<"signature" | "otp">("signature")
  const [signatureInputMode, setSignatureInputMode] =
    useState<"overview" | "choose" | "draw" | "upload">(() =>
      contract?.currentUser?.profile?.signatureId ? "overview" : "choose",
    )
  const [signatureDialogError, setSignatureDialogError] =
    useState<string | null>(null)
  const [signatureDialogMessage, setSignatureDialogMessage] =
    useState<string | null>(null)
  const [sendingOtpSignatureId, setSendingOtpSignatureId] =
    useState<number | null>(null)
  const [otpCooldownUntil, setOtpCooldownUntil] =
    useState<Record<number, number>>({})
  const [nowTick, setNowTick] = useState(() => Date.now())
  const [submittingSignatureId, setSubmittingSignatureId] =
    useState<number | null>(null)
  const [signatureImageUploadProgress, setSignatureImageUploadProgress] =
    useState<number | null>(null)
  const [signatureImageUploading, setSignatureImageUploading] = useState(false)
  const [activationStepOverride, setActivationStepOverride] =
    useState<number | null>(null)
  const [uploadResetKey, setUploadResetKey] = useState(0)
  const [uploadProgress, setUploadProgress] = useState<UploadProgressItem[]>([])
  const [uploadedAttachmentDetails, setUploadedAttachmentDetails] =
    useState<Record<number, AttachmentDisplayDetails>>({})

  const isDraft = !contract || contract.status === "draft"
  const isActive = contract?.status === "active"
  const isCompleted = contract?.status === "completed"
  const isCancelled = contract?.status === "cancelled"
  const stepsVisible = !contract || isDraft || isActive
  const isCreator =
    !!contract &&
    !!session?.user?.id &&
    Number(session.user.id) === Number(contract.creatorId)
  const currentUser = contract?.currentUser ?? null
  const currentUserMobile = currentUser?.mobile ?? session?.user?.mobile
  const currentUserSignature = (contract?.signatures ?? []).find(
    (signature) =>
      signature.signatureStatus !== "signed" &&
      (signature.userId === currentUser?.id ||
        (!!currentUserMobile && signature.mobile === currentUserMobile)),
  )
  const currentUserCanStartSigning =
    isActive &&
    !!currentUserSignature &&
    (isCreator || !!currentUserSignature.userId)
  const needsLevelTwoVerification =
    currentUserCanStartSigning &&
    currentUser?.verification?.isLevelTwoVerified === false
  const creatorNeedsLevelTwoVerification =
    isDraft &&
    isCreator &&
    currentUser?.verification?.isLevelTwoVerified !== true
  const activeOtpCooldownMs = activeSignature
    ? Math.max(0, (otpCooldownUntil[activeSignature.id] ?? 0) - nowTick)
    : 0
  const currentUserFullName =
    currentUser?.name || session?.user?.name?.trim() || ""
  const currentUserId = currentUser?.id ?? (Number(session?.user?.id) || null)
  const walletBalance = dashboardHeader?.header.balance ?? null
  const currentUserPrimarySignature = {
    fullName: currentUserFullName,
    mobile: normalizeMobile(currentUserMobile ?? ""),
    userId: currentUserId,
  }

  useEffect(() => {
    const profile = currentUser?.profile

    if (!profile?.signatureId || !profile.signatureUrl) {
      setProfileSignatureImage(null)
      return
    }

    setProfileSignatureImage({
      id: profile.signatureId,
      url: profile.signatureUrl,
    })
  }, [currentUser?.profile?.signatureId, currentUser?.profile?.signatureUrl])

  const enforcePrimarySigner = (
    formValues: ContractFormValues,
  ): ContractFormValues => {
    const signatures =
      formValues.signatures.length > 0
        ? [...formValues.signatures]
        : [emptySignature(), emptySignature()]

    signatures[0] = {
      ...signatures[0],
      fullName: currentUserPrimarySignature.fullName || signatures[0].fullName,
      mobile: currentUserPrimarySignature.mobile || signatures[0].mobile,
      userId: currentUserPrimarySignature.userId ?? signatures[0].userId,
    }

    if (signatures.length < 2) {
      signatures.push(emptySignature())
    }

    return {
      ...formValues,
      signatures,
    }
  }

  const formValuesFromContract = (
    source?: Contract | null,
  ): ContractFormValues =>
    enforcePrimarySigner({
      title: source?.title ?? "",
      body: source?.body ?? "",
      attachments: (source?.attachments ?? []).map((item) => ({
        id: item.id,
        attachmentId: item.attachmentId,
      })),
      removedContractAttachmentIds: [],
      removedSignatureIds: [],
      signatures:
        (source?.signatures ?? []).length > 0
          ? (source?.signatures ?? []).map((signature) => ({
              id: signature.id,
              fullName: signature.fullName ?? "",
              mobile: signature.mobile ?? "",
              userId: signature.userId ?? null,
            }))
          : [emptySignature(), emptySignature()],
    })

  const [values, setValues] = useState<ContractFormValues>(() =>
    formValuesFromContract(contract),
  )

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNowTick(Date.now())
    }, 1000)

    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!isContractEditorFullscreen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsContractEditorFullscreen(false)
    }

    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", handleKeyDown)

    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isContractEditorFullscreen])

  useEffect(() => {
    if (
      !currentUserPrimarySignature.fullName &&
      !currentUserPrimarySignature.mobile
    ) {
      return
    }

    setValues((current) => enforcePrimarySigner(current))
  }, [
    currentUserPrimarySignature.fullName,
    currentUserPrimarySignature.mobile,
    currentUserPrimarySignature.userId,
  ])

  const step =
    activationStepOverride ?? currentStepForStatus(contract?.status ?? "draft")

  const canSave =
    values.title.trim().length > 2 && values.body.trim().length > 10

  const validateContractValues = () => {
    if (!canSave) {
      return {
        ok: false,
        error: "عنوان و متن قرارداد را کامل وارد کنید.",
        values,
      }
    }

    const lockedValues = enforcePrimarySigner(values)
    const normalizedValues = {
      ...lockedValues,
      signatures: lockedValues.signatures.map((signature) => ({
        ...signature,
        fullName: signature.fullName.trim(),
        mobile: normalizeMobile(signature.mobile),
      })),
    }

    const filledSignatures = normalizedValues.signatures.filter(
      (signature) => signature.fullName || signature.mobile,
    )

    if (filledSignatures.length < 2) {
      return {
        ok: false,
        error: "برای قرارداد حداقل دو طرف امضا کننده لازم است.",
        values: normalizedValues,
      }
    }

    const invalidSignatureIndex = normalizedValues.signatures.findIndex(
      (signature) =>
        !signature.fullName || !mobilePattern.test(signature.mobile),
    )

    if (invalidSignatureIndex !== -1) {
      return {
        ok: false,
        error: `نام و شماره موبایل معتبر طرف ${(
          invalidSignatureIndex + 1
        ).toLocaleString(
          "fa-IR",
        )} را وارد کنید. موبایل باید با 09 شروع شود و 11 رقم باشد.`,
        values: normalizedValues,
      }
    }

    const duplicateMobile = normalizedValues.signatures.find(
      (signature, index, signatures) =>
        signatures.findIndex((item) => item.mobile === signature.mobile) !==
        index,
    )?.mobile

    if (duplicateMobile) {
      return {
        ok: false,
        error: `شماره موبایل ${duplicateMobile} برای بیش از یک طرف وارد شده است. موبایل طرفین امضا نباید تکراری باشد.`,
        values: normalizedValues,
      }
    }

    return { ok: true, error: null, values: normalizedValues }
  }

  const signedCount = useMemo(
    () =>
      (contract?.signatures ?? []).filter(
        (signature) => signature.signatureStatus === "signed",
      ).length,
    [contract?.signatures],
  )
  const signingProcessSignatures = useMemo(() => {
    const signatures = [...(contract?.signatures ?? [])]

    return signatures.sort((first, second) => {
      const firstIsCurrentUser =
        first.userId === currentUser?.id ||
        (!!currentUserMobile && first.mobile === currentUserMobile)
      const secondIsCurrentUser =
        second.userId === currentUser?.id ||
        (!!currentUserMobile && second.mobile === currentUserMobile)

      if (firstIsCurrentUser === secondIsCurrentUser) {
        return first.id - second.id
      }

      return firstIsCurrentUser ? -1 : 1
    })
  }, [contract?.signatures, currentUser?.id, currentUserMobile])
  const hasPendingSignatures = signingProcessSignatures.some(
    (signature) => signature.signatureStatus !== "signed",
  )
  const canCancelActiveContract = isActive && isCreator
  const attachmentsPanelVisible =
    isDraft || uploadProgress.length > 0 || values.attachments.length > 0
  const attachmentsDownloadable = isActive || isCompleted
  const pricing = useMemo(() => {
    const baseAmount = quote?.baseAmount ?? basePricing?.baseAmount ?? 0
    const includedParties =
      quote?.includedParties ?? basePricing?.includedParties ?? 2
    const extraPartyRate =
      quote?.extraPartyRate ?? basePricing?.extraPartyRate ?? 0.25
    const partiesCount = Math.max(includedParties, values.signatures.length)
    const extraParties = Math.max(0, partiesCount - includedParties)
    const extraAmount = Math.round(baseAmount * extraPartyRate * extraParties)

    return {
      baseAmount,
      includedParties,
      partiesCount,
      extraParties,
      extraPartyRate,
      extraAmount,
      totalAmount: baseAmount + extraAmount,
      currencyLabel:
        quote?.currencyLabel ?? basePricing?.currencyLabel ?? "تومان",
    }
  }, [basePricing, quote, values.signatures.length])

  const shareUrl = contract
    ? `https://dadline.net/contract/preview/${contract.uuid}`
    : ""

  const formatMoney = (amount: number) =>
    `${amount.toLocaleString("fa-IR")} ${pricing.currencyLabel}`

  const paymentReturnMessage = useMemo(() => {
    if (!paymentStatus) return null

    if (paymentStatus === "failed") {
      return "پرداخت تایید نشد. اگر مبلغی از حساب شما کسر شده باشد، طبق روال بانکی برگشت داده می‌شود."
    }

    switch (returnContext) {
      case "contract_activation":
        return "پرداخت ثبت قرارداد با موفقیت انجام شد و قرارداد فعال شد."
      case "contract_ai_rewrite":
        return "پرداخت بازنویسی هوشمند قرارداد با موفقیت انجام شد."
      case "contract_ai_analysis":
        return "پرداخت بررسی هوش مصنوعی قرارداد با موفقیت انجام شد."
      default:
        return "پرداخت با موفقیت انجام شد و نتیجه سرویس به‌روزرسانی شد."
    }
  }, [paymentStatus, returnContext])

  const paymentDescription = (amount: number, freeDescription: string) =>
    amount <= 0
      ? freeDescription
      : walletBalance === null
        ? `مبلغ ${formatMoney(amount)} برای این عملیات پرداخت می‌شود. موجودی کیف پول در حال دریافت است؛ اگر کافی نباشد به درگاه پرداخت هدایت می‌شوید.`
        : walletBalance >= amount
          ? `مبلغ ${formatMoney(amount)} از موجودی کیف پول شما کسر می‌شود.`
          : `مبلغ ${formatMoney(amount)} برای این عملیات لازم است. موجودی کیف پول کافی نیست و پس از تایید به درگاه پرداخت هدایت می‌شوید.`

  const openPaymentConfirmation = async (action: PaidContractAction) => {
    setError(null)

    if (action === "activation") {
      if (creatorNeedsLevelTwoVerification) {
        setPaymentConfirmation({
          action,
          title: "تایید ثبت نهایی و ارسال دعوت‌نامه",
          amount: 0,
          description: "",
          confirmLabel: "",
        })
        return
      }

      const validation = validateContractValues()
      setValues(validation.values)

      if (!validation.ok) {
        setError(validation.error)
        return
      }

      setPaymentConfirmation({
        action,
        title: "تایید ثبت نهایی و ارسال دعوت‌نامه",
        amount: pricing.totalAmount,
        description: paymentDescription(
          pricing.totalAmount,
          "ثبت نهایی این قرارداد رایگان است. با تایید شما، آخرین تغییرات ذخیره، قرارداد فعال و دعوت‌نامه‌ها ارسال می‌شوند.",
        ),
        confirmLabel:
          pricing.totalAmount > 0
            ? "تایید، پرداخت و ارسال دعوت‌نامه"
            : "تایید و ارسال دعوت‌نامه",
      })
      return
    }

    if (!contract) return

    if (action === "ai_rewrite" && !contract.aiAnalysis && !aiText) {
      setError(
        "برای بازنویسی، ابتدا باید پیشنهادات و اصلاحات اولیه دریافت شود.",
      )
      return
    }

    let pricingData = aiPricing
    if (!pricingData) {
      const pricingResult = await getContractAiPricing(contract.uuid)
      if (pricingResult.error || !pricingResult.pricing) {
        setError(
          pricingResult.error ?? "قیمت سرویس هوش مصنوعی قابل دریافت نیست.",
        )
        return
      }
      pricingData = pricingResult.pricing
      setAiPricing(pricingData)
    }

    const isRewrite = action === "ai_rewrite"
    const amount = isRewrite
      ? pricingData.rewriteAmount
      : pricingData.analysisAmount

    setPaymentConfirmation({
      action,
      title: isRewrite
        ? "تایید بازنویسی هوشمند قرارداد"
        : "تایید بررسی هوش مصنوعی قرارداد",
      amount,
      description: paymentDescription(
        amount,
        isRewrite
          ? "بازنویسی هوشمند این قرارداد رایگان است. با تایید شما، عملیات بازنویسی انجام می‌شود."
          : "بررسی هوش مصنوعی این قرارداد رایگان است. با تایید شما، پیشنهادات اصلاحی تولید می‌شود.",
      ),
      confirmLabel: amount > 0 ? "تایید و پرداخت" : "تایید و ادامه",
    })
  }

  const confirmPaymentAction = () => {
    const action = paymentConfirmation?.action
    setPaymentConfirmation(null)

    if (action === "activation") {
      handleActivate()
      return
    }

    if (action === "ai_analysis") {
      handleAiOperation("analysis")
      return
    }

    if (action === "ai_rewrite") {
      handleAiOperation("rewrite")
    }
  }

  const runAction = <T,>(
    callback: () => Promise<{
      ok: boolean
      data: T | null
      error: string | null
    }>,
    onSuccess?: (data: T | null) => void,
  ) => {
    setError(null)
    setMessage(null)
    startTransition(async () => {
      const result = await callback()
      if (!result.ok) {
        setError(result.error ?? "عملیات انجام نشد.")
        return
      }
      setMessage("عملیات با موفقیت انجام شد.")
      onSuccess?.(result.data)
    })
  }

  const handleSave = () => {
    const validation = validateContractValues()
    setValues(validation.values)

    if (!validation.ok) {
      setError(validation.error)
      return
    }

    runAction(
      () =>
        contract
          ? updateContract(contract.uuid, validation.values)
          : createContract(validation.values),
      (saved) => {
        if (saved) {
          setValues(formValuesFromContract(saved))
        }

        setMessage("پیش‌نویس قرارداد با موفقیت ذخیره شد.")

        if (saved && !contract)
          router.replace(`/pishkhan/contracts/${saved.uuid}`)
        else router.refresh()
      },
    )
  }

  const removeAttachment = (index: number) => {
    setValues((current) => ({
      ...current,
      removedContractAttachmentIds: [
        ...(current.removedContractAttachmentIds ?? []),
        ...(current.attachments[index]?.id
          ? [current.attachments[index].id]
          : []),
      ],
      attachments: current.attachments.filter(
        (_, itemIndex) => itemIndex !== index,
      ),
    }))
  }

  const validateAttachmentFile = (file: File) => {
    const extension = file.name.split(".").pop()?.toLowerCase() ?? ""

    if (file.size > maxAttachmentSize) {
      return "حجم هر فایل پیوست نباید بیشتر از ۲۰ مگابایت باشد."
    }

    if (
      !allowedAttachmentTypes.includes(file.type) &&
      !allowedAttachmentExtensions.includes(extension)
    ) {
      return "فرمت فایل مجاز نیست. فرمت‌های مجاز: PDF, Word, Excel, JPG, PNG"
    }

    return null
  }

  const validateSignatureImageFile = (file: File) => {
    const extension = file.name.split(".").pop()?.toLowerCase() ?? ""

    if (file.size > maxSignatureImageSize) {
      return "حجم تصویر امضا یا مهر نباید بیشتر از ۵ مگابایت باشد."
    }

    if (
      !allowedSignatureImageTypes.includes(file.type) &&
      !allowedSignatureImageExtensions.includes(extension)
    ) {
      return "فرمت تصویر امضا یا مهر مجاز نیست. فرمت‌های مجاز: JPG, PNG, WEBP"
    }

    return null
  }

  const uploadProfileSignatureImage = (file: File) =>
    new Promise<void>((resolve) => {
      const validationError = validateSignatureImageFile(file)

      if (validationError) {
        setSignatureDialogError(validationError)
        setSignatureDialogMessage(null)
        resolve()
        return
      }

      const formData = new FormData()
      formData.append("file", file)

      const request = new XMLHttpRequest()
      request.open("POST", "/api/profile/signature")
      request.setRequestHeader("Accept", "application/json")

      setSignatureDialogError(null)
      setSignatureDialogMessage(null)
      setSignatureImageUploading(true)
      setSignatureImageUploadProgress(0)

      request.upload.onprogress = (event) => {
        if (!event.lengthComputable) return
        setSignatureImageUploadProgress(
          Math.round((event.loaded / event.total) * 100),
        )
      }

      request.onload = () => {
        const json = parseUploadResponse(request.responseText)
        const uploadError =
          json?.message ||
          Object.values(json?.errors ?? {})?.flat()?.[0] ||
          "بارگذاری تصویر امضا یا مهر انجام نشد."

        if (request.status < 200 || request.status >= 300) {
          setSignatureDialogError(String(uploadError))
          setSignatureDialogMessage(null)
          setSignatureImageUploading(false)
          setSignatureImageUploadProgress(null)
          resolve()
          return
        }

        const uploaded = json?.data
        if (uploaded?.signatureId && uploaded?.signatureUrl) {
          const nextImage = {
            id: Number(uploaded.signatureId),
            url: String(uploaded.signatureUrl),
            originalName: uploaded.originalName ?? file.name,
            mimeType: uploaded.mimeType ?? file.type,
            sizeBytes: uploaded.sizeBytes ?? file.size,
          }

          setProfileSignatureImage(nextImage)
          setSignatureInputMode("overview")
          setSignatureDialogMessage(
            "تصویر امضا یا مهر بارگذاری شد. برای ادامه، تصویر جدید را تایید کنید.",
          )
          router.refresh()
        }

        setSignatureImageUploading(false)
        setSignatureImageUploadProgress(100)
        window.setTimeout(() => setSignatureImageUploadProgress(null), 800)
        resolve()
      }

      request.onerror = () => {
        setSignatureDialogError("ارتباط هنگام بارگذاری تصویر برقرار نشد.")
        setSignatureDialogMessage(null)
        setSignatureImageUploading(false)
        setSignatureImageUploadProgress(null)
        resolve()
      }

      request.send(formData)
    })

  const uploadAttachmentFile = (file: File, progressId: string) =>
    new Promise<void>((resolve) => {
      if (!contract) {
        resolve()
        return
      }

      const formData = new FormData()
      formData.append("file", file)

      const request = new XMLHttpRequest()
      request.open(
        "POST",
        `/api/contracts/${encodeURIComponent(contract.uuid)}/attachments/upload`,
      )
      request.setRequestHeader("Accept", "application/json")

      request.upload.onprogress = (event) => {
        if (!event.lengthComputable) return
        const progress = Math.round((event.loaded / event.total) * 100)
        setUploadProgress((current) =>
          current.map((item) =>
            item.id === progressId ? { ...item, progress } : item,
          ),
        )
      }

      request.onload = () => {
        const json = parseUploadResponse(request.responseText)
        const uploadError =
          json?.message ||
          Object.values(json?.errors ?? {})?.flat()?.[0] ||
          "آپلود فایل انجام نشد."

        if (request.status < 200 || request.status >= 300) {
          setUploadProgress((current) =>
            current.map((item) =>
              item.id === progressId
                ? {
                    ...item,
                    status: "error",
                    error: String(uploadError),
                  }
                : item,
            ),
          )
          resolve()
          return
        }

        const attachment = json?.data
        if (attachment?.id && attachment?.attachmentId) {
          const attachmentId = Number(attachment.attachmentId)
          setValues((current) => ({
            ...current,
            attachments: [
              ...current.attachments,
              {
                id: Number(attachment.id),
                attachmentId,
              },
            ],
          }))
          setUploadedAttachmentDetails((current) => ({
            ...current,
            [attachmentId]: {
              originalName: attachment.originalName,
              mimeType: attachment.mimeType,
              sizeBytes: attachment.sizeBytes,
            },
          }))
        }

        setUploadProgress((current) =>
          current.filter((item) => item.id !== progressId),
        )
        setMessage("فایل بارگذاری شد. برای ثبت پیوست‌ها، تغییرات را ذخیره کنید.")
        resolve()
      }

      request.onerror = () => {
        setUploadProgress((current) =>
          current.map((item) =>
            item.id === progressId
              ? {
                  ...item,
                  status: "error",
                  error: "اتصال هنگام آپلود قطع شد.",
                }
              : item,
          ),
        )
        resolve()
      }

      request.send(formData)
    })

  const handleAttachmentUpload = async (files: File[]) => {
    if (!contract) {
      setError("ابتدا قرارداد را ذخیره کنید، سپس پیوست اضافه کنید.")
      return
    }

    const selectedFiles = files.slice(0, 10)
    if (selectedFiles.length === 0) return

    const invalid = selectedFiles
      .map((file) => validateAttachmentFile(file))
      .find(Boolean)

    if (invalid) {
      setError(invalid)
      setUploadResetKey((current) => current + 1)
      return
    }

    const progressItems = selectedFiles.map((file) => ({
      id: `${file.name}-${file.size}-${crypto.randomUUID()}`,
      name: file.name,
      progress: 0,
      status: "uploading" as const,
    }))

    setError(null)
    setUploadProgress((current) => [...progressItems, ...current])

    for (const [index, file] of selectedFiles.entries()) {
      await uploadAttachmentFile(file, progressItems[index].id)
    }

    setUploadResetKey((current) => current + 1)
    router.refresh()
  }

  const addSignature = () => {
    setValues((current) => {
      if (current.signatures.length >= 10) return current
      return {
        ...current,
        signatures: [...current.signatures, emptySignature()],
      }
    })
  }

  const updateSignature = (
    index: number,
    key: keyof ContractFormValues["signatures"][number],
    value: string,
  ) => {
    setValues((current) => ({
      ...current,
      signatures: current.signatures.map((signature, signatureIndex) =>
        signatureIndex === index ? { ...signature, [key]: value } : signature,
      ),
    }))
  }

  const removeSignature = (index: number) => {
    if (index === 0) return

    setValues((current) => {
      if (current.signatures.length <= 2) return current
      return {
        ...current,
        removedSignatureIds: [
          ...(current.removedSignatureIds ?? []),
          ...(current.signatures[index]?.id
            ? [current.signatures[index].id]
            : []),
        ],
        signatures: current.signatures.filter(
          (_, signatureIndex) => signatureIndex !== index,
        ),
      }
    })
  }

  const handleAnalyze = () => {
    if (!contract || !isDraft) {
      setError("بررسی هوش مصنوعی فقط در مرحله پیش‌نویس قابل انجام است.")
      return
    }
    setAiOpen(true)
    runAction(async () => {
      const pricing = await getContractAiPricing(contract.uuid)
      if (pricing.error) return failureForClient(pricing.error)
      setAiPricing(pricing.pricing)

      return { ok: true, data: null, error: null, requiresAuth: false }
    })
  }

  const handleDeleteDraft = () => {
    if (!contract || !isDraft || !isCreator) return

    runAction(
      () => deleteContract(contract.uuid),
      () => {
        setDeleteDraftOpen(false)
        router.replace("/pishkhan/contracts")
      },
    )
  }

  const handleCancelActiveContract = () => {
    if (!contract || !canCancelActiveContract) return

    setError(null)
    setMessage(null)
    startTransition(async () => {
      const result = await cancelContract(contract.uuid)

      if (!result.ok) {
        setError(result.error ?? "ابطال قرارداد انجام نشد.")
        return
      }

      setCancelOpen(false)
      setMessage("قرارداد ابطال شد. هزینه ثبت قرارداد قابل بازگشت نیست.")
      router.refresh()
    })
  }

  const handleCreateCopyFromCancelledContract = () => {
    if (!contract || !isCancelled || !isCreator) return

    const copyValues = enforcePrimarySigner({
      title: values.title ? `${values.title} - کپی` : "کپی قرارداد",
      body: values.body,
      attachments: [],
      removedContractAttachmentIds: [],
      removedSignatureIds: [],
      signatures: [currentUserPrimarySignature, emptySignature()],
    })

    setError(null)
    setMessage(null)
    startTransition(async () => {
      const created = await createContract(copyValues)

      if (!created.ok || !created.data) {
        setError(created.error ?? "ایجاد کپی قرارداد انجام نشد.")
        return
      }

      router.replace(`/pishkhan/contracts/${created.data.uuid}`)
    })
  }

  const handleAiOperation = (operation: "analysis" | "rewrite") => {
    if (!contract) return

    if (operation === "rewrite" && !contract.aiAnalysis && !aiText) {
      setError(
        "برای بازنویسی، ابتدا باید پیشنهادات و اصلاحات اولیه دریافت شود.",
      )
      return
    }

    runAction(
      () =>
        analyzeContract(
          contract.uuid,
          values.body,
          operation,
          `${window.location.origin}/pishkhan/contracts/${contract.uuid}`,
        ),
      (data) => {
        if (data?.requiresGateway && data.paymentUrl) {
          window.location.href = data.paymentUrl
          return
        }

        refreshDashboardHeader()
        setAiText(data?.summary ?? null)
      },
    )
  }

  const handleActivate = () => {
    if (!contract) return

    if (creatorNeedsLevelTwoVerification) {
      setError(
        "برای ثبت نهایی و ارسال دعوت‌نامه قرارداد، ابتدا احراز هویت سطح ۲ را تکمیل کنید.",
      )
      return
    }

    const validation = validateContractValues()
    setValues(validation.values)

    if (!validation.ok) {
      setError(validation.error)
      return
    }

    setError(null)
    setMessage(null)
    startTransition(async () => {
      const activated = await activateContract(
        contract.uuid,
        `${window.location.origin}/pishkhan/contracts/${contract.uuid}`,
        validation.values,
      )
      if (!activated.ok) {
        setError(activated.error ?? "ثبت نهایی قرارداد انجام نشد.")
        return
      }

      if (activated.data?.contract) {
        setValues(formValuesFromContract(activated.data.contract))
      }

      if (activated.data?.requiresGateway && activated.data.paymentUrl) {
        window.location.href = activated.data.paymentUrl
        return
      }

      refreshDashboardHeader()
      setActivationStepOverride(2)
      setMessage("پرداخت ثبت شد؛ ارسال دعوت‌نامه‌ها شروع شد.")

      const activatedContract = activated.data?.contract
      const senderMobile = normalizeMobile(
        activatedContract?.creator?.mobile ??
          currentUserPrimarySignature.mobile,
      )
      const inviteRecipients = (
        activatedContract?.signatures ?? validation.values.signatures
      )
        .map((signature) => ({
          name:
            signature.fullName?.trim() ||
            signature.mobile?.trim() ||
            "طرف قرارداد",
          mobile: normalizeMobile(signature.mobile ?? ""),
          userId: signature.userId ?? null,
        }))
        .filter(
          (signature) =>
            signature.mobile &&
            signature.mobile !== senderMobile &&
            Number(signature.userId) !== Number(contract.creatorId),
        )

      if (inviteRecipients.length === 0) {
        await wait(7000)
      }

      for (const [index, recipient] of inviteRecipients.entries()) {
        setMessage(
          `دعوت‌نامه قرارداد برای ${recipient.name} ارسال شد. ${(
            index + 1
          ).toLocaleString(
            "fa-IR",
          )} از ${inviteRecipients.length.toLocaleString("fa-IR")}`,
        )
        await wait(7000)
      }

      setActivationStepOverride(3)
      setMessage("دعوت‌نامه‌ها ارسال شدند؛ قرارداد آماده امضا است.")
      router.refresh()
    })
  }

  const renderPartiesCard = (className?: string) => (
    <AdaptiveCard className={className}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">طرفین قرارداد</h3>
          {isDraft && (
            <Button size="sm" icon={<TbPlus />} onClick={addSignature}>
              افزودن طرف
            </Button>
          )}
        </div>
        <div className="space-y-3">
          {values.signatures.map((signature, index) => {
            const storedSignature = contract?.signatures?.find(
              (item) =>
                item.id === signature.id || item.mobile === signature.mobile,
            )
            const partyStatusLabel =
              storedSignature?.signatureStatus === "signed"
                ? "امضا شده"
                : storedSignature?.userId
                  ? "در انتظار امضا"
                  : storedSignature?.viewedAt
                    ? "مشاهده شده"
                    : storedSignature
                      ? "دعوت‌نامه ارسال شده"
                      : "در انتظار ثبت"

            return (
              <div
                key={signature.id ?? index}
                className="space-y-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700"
              >
                <div className="grid grid-cols-[minmax(0,1fr)_40px] gap-2">
                  <Input
                    value={signature.fullName}
                    disabled={!isDraft || index === 0}
                    placeholder={`نام و نام خانوادگی طرف ${index + 1}`}
                    onChange={(event) =>
                      updateSignature(index, "fullName", event.target.value)
                    }
                  />
                  {isDraft && index === 0 ? (
                    <Button
                      size="sm"
                      shape="circle"
                      icon={<TbLock />}
                      disabled
                      title="ایجادکننده"
                      aria-label="ایجادکننده قرارداد"
                    />
                  ) : isDraft ? (
                    <Button
                      size="sm"
                      shape="circle"
                      icon={<TbTrash />}
                      disabled={values.signatures.length <= 2}
                      onClick={() => removeSignature(index)}
                      title="حذف طرف"
                      aria-label="حذف طرف"
                    />
                  ) : (
                    <Tag
                      className={
                        storedSignature?.signatureStatus === "signed"
                          ? "justify-center bg-emerald-100 text-emerald-700"
                          : storedSignature?.viewedAt
                            ? "justify-center bg-sky-100 text-sky-700"
                            : "justify-center bg-gray-100 text-gray-700"
                      }
                    >
                      {partyStatusLabel}
                    </Tag>
                  )}
                </div>
                <Input
                  value={signature.mobile}
                  disabled={!isDraft || index === 0}
                  placeholder="09xxxxxxxxx"
                  onChange={(event) =>
                    updateSignature(index, "mobile", event.target.value)
                  }
                  onBlur={(event) =>
                    updateSignature(
                      index,
                      "mobile",
                      normalizeMobile(event.target.value),
                    )
                  }
                />
              </div>
            )
          })}
        </div>
        <div className="space-y-2">
          <div className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-6 text-amber-800 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-100">
            <TbShieldCheck className="mt-1 shrink-0 text-base" />
            <span>
              شماره موبایل هر طرف باید یکتا، معتبر و حتماً به نام شخص امضا کننده
              باشد؛ احراز هویت و امضا با همین شماره انجام می‌شود.
            </span>
          </div>
          <div className="flex gap-2 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-xs leading-6 text-sky-800 dark:border-sky-700 dark:bg-sky-900/20 dark:text-sky-100">
            <TbFileCertificate className="mt-1 shrink-0 text-base" />
            <span>
              برای امضای حقوقی، نام و نام خانوادگی و شماره موبایل امضاکننده یا
              امضاکنندگان مجاز طبق اساسنامه را وارد کنید.
            </span>
          </div>
        </div>
      </div>
    </AdaptiveCard>
  )

  const renderFinalizationCard = () => (
    <AdaptiveCard>
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              ثبت نهایی
            </h3>
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs leading-6 text-amber-800 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-100">
            پس از ثبت نهایی، قرارداد رمزنگاری می‌شود و امکان هیچ تغییری در متن،
            طرفین یا پیوست‌ها وجود ندارد.
          </div>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
          <Button icon={<TbShare3 />} onClick={() => setShareOpen(true)}>
            اشتراک‌گذاری پیش‌نویس
          </Button>
          <Button
            variant="solid"
            icon={<TbReceipt />}
            loading={pending}
            onClick={() => openPaymentConfirmation("activation")}
          >
            ثبت نهایی و ارسال دعوت‌نامه
          </Button>
        </div>
      </div>
    </AdaptiveCard>
  )

  const renderCancelledCopyCard = () => (
    <AdaptiveCard className="order-1">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <TbCopy className="text-xl text-primary" />
          <h3 className="text-lg font-semibold">ایجاد قرارداد جدید</h3>
        </div>
        <p className="text-sm leading-7 text-gray-500">
          این قرارداد لغو شده و هیچ عملیاتی روی آن قابل انجام نیست. می‌توانید فقط
          عنوان و متن آن را در یک پیش‌نویس جدید کپی کنید.
        </p>
        <Button
          block
          variant="solid"
          icon={<TbCopy />}
          loading={pending}
          onClick={handleCreateCopyFromCancelledContract}
        >
          ساخت کپی برای قرارداد جدید
        </Button>
      </div>
    </AdaptiveCard>
  )

  const handleRefreshPin = () => {
    if (!contract) return
    runAction(
      () => refreshContractPin(contract.uuid),
      () => router.refresh(),
    )
  }

  const copyShareText = async () => {
    if (!contract) return
    const text = `پیش‌نمایش قرارداد: ${shareUrl}\nکد PIN: ${contract.pinCode ?? ""}`
    await navigator.clipboard?.writeText(text)
    setMessage("لینک و PIN کپی شد.")
  }

  const handleResendInvite = (signature: ContractSignature) => {
    if (!contract) return
    runAction(
      () => resendSignatureInvitation(contract.uuid, signature.id),
      () => router.refresh(),
    )
  }

  const handleSendOtp = (signature: ContractSignature) => {
    if (!contract) return
    const cooldownMs = Math.max(
      0,
      (otpCooldownUntil[signature.id] ?? 0) - Date.now(),
    )

    if (cooldownMs > 0) {
      setSignatureDialogError(
        `کد تایید قبلاً ارسال شده است. ${formatCountdown(cooldownMs)} دیگر دوباره تلاش کنید.`,
      )
      setSignatureDialogMessage(null)
      return
    }

    setSignatureDialogError(null)
    setSignatureDialogMessage(null)
    setSendingOtpSignatureId(signature.id)
    startTransition(async () => {
      const result = await sendSignatureOtp(contract.uuid, signature.id)

      if (!result.ok) {
        setSignatureDialogError(result.error ?? "ارسال کد تایید انجام نشد.")
        setSendingOtpSignatureId(null)
        return
      }

      setSignatureDialogMessage("کد تایید برای شما ارسال شد.")
      setOtpCooldownUntil((current) => ({
        ...current,
        [signature.id]: Date.now() + 10 * 60 * 1000,
      }))
      setSendingOtpSignatureId(null)
      router.refresh()
    })
  }

  const openSignatureDialog = (signature: ContractSignature) => {
    setActiveSignature(signature)
    setSignatureDialogStep("signature")
    setSignatureInputMode(profileSignatureImage ? "overview" : "choose")
    setSignatureDialogError(null)
    setSignatureDialogMessage(null)
  }

  const closeSignatureDialog = () => {
    setActiveSignature(null)
    setSignatureDialogError(null)
    setSignatureDialogMessage(null)
    setSendingOtpSignatureId(null)
    setSubmittingSignatureId(null)
    setSignatureImageUploading(false)
    setSignatureImageUploadProgress(null)
    setSignatureInputMode(profileSignatureImage ? "overview" : "choose")
  }

  const handleSaveDrawnSignature = async () => {
    if (!activeSignature) return
    const drawing = signatureDrawings[activeSignature.id]

    if (!drawing) {
      setSignatureDialogError("ابتدا امضای خود را در کادر ترسیم کنید.")
      return
    }

    const file = await dataUrlToFile(
      drawing,
      `signature-${activeSignature.id}.png`,
    )
    await uploadProfileSignatureImage(file)
    setSignatureDialogError(null)
  }

  const handleConfirmProfileSignature = () => {
    if (!activeSignature || !profileSignatureImage?.id) return

    setConfirmedProfileSignatureIds((current) => ({
      ...current,
      [activeSignature.id]: profileSignatureImage.id,
    }))
    setSignatureDrawings((current) => ({
      ...current,
      [activeSignature.id]: null,
    }))
    setSignatureDialogError(null)
    setSignatureDialogMessage("تصویر امضا یا مهر تایید شد.")
    setSignatureDialogStep("otp")
  }

  const handleProfileSignatureFileChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0]
    event.target.value = ""

    if (!file) return

    void uploadProfileSignatureImage(file)
  }

  const handleCompleteSignature = () => {
    if (!contract || !activeSignature) return
    const signature = activeSignature
    const profileSignatureId = confirmedProfileSignatureIds[signature.id]
    const canvasDataUrl = signatureDrawings[signature.id] ?? undefined
    const verificationCode = toEnglishDigits(
      otpCodes[signature.id] ?? "",
    ).trim()

    if (!/^\d{6}$/.test(verificationCode)) {
      setSignatureDialogError("کد تایید باید دقیقاً ۶ رقم باشد.")
      setSignatureDialogMessage(null)
      return
    }

    setSignatureDialogError(null)
    setSignatureDialogMessage(null)
    setSubmittingSignatureId(signature.id)
    startTransition(async () => {
      const otp = await verifySignatureOtp(
        contract.uuid,
        signature.id,
        verificationCode,
      )

      if (!otp.ok) {
        setSignatureDialogError(otp.error ?? "کد تایید واردشده معتبر نیست.")
        setSubmittingSignatureId(null)
        return
      }

      const signed = await signContract(
        contract.uuid,
        signature.id,
        profileSignatureId ?? undefined,
        {
          method: profileSignatureId ? "profile_signature" : "canvas",
          profileSignatureId: profileSignatureId ?? undefined,
          canvasDataUrl,
        },
      )

      if (!signed.ok) {
        setSignatureDialogError(signed.error ?? "ثبت امضای قرارداد انجام نشد.")
        setSubmittingSignatureId(null)
        return
      }

      setActiveSignature(null)
      setSubmittingSignatureId(null)
      setMessage("امضای قرارداد با موفقیت ثبت شد.")
      router.refresh()
    })
  }

  const handlePrintCompletedContract = () => {
    const previousTitle = document.title
    const printTitle = contract?.trackingCode ?? contract?.uuid ?? "contract"
    const printArea = document.getElementById("contract-print-area")
    const printClone = printArea?.cloneNode(true) as HTMLElement | null

    document.title = printTitle
    if (printClone) {
      printClone.id = "contract-print-area-print-root"
      document.body.appendChild(printClone)
      document.body.classList.add("contract-printing")
    }

    const cleanupPrint = () => {
      document.title = previousTitle
      document.body.classList.remove("contract-printing")
      printClone?.remove()
    }

    window.addEventListener("afterprint", cleanupPrint, { once: true })
    window.print()
  }

  return (
    <Container className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {contract ? contract.title : "قرارداد جدید"}
          </h2>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-500">
            {contract && (
              <>
                <ContractStatusTag
                  status={contract.status}
                  label={contract.statusLabel}
                />
                <span>
                  کد رهگیری:{" "}
                  {contract.trackingCode ?? "بعد از پرداخت صادر می‌شود"}
                </span>
                <span>ایجاد: {formatPersianDate(contract.createdAt)}</span>
              </>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {contract && isDraft && isCreator && (
            <Button
              icon={<TbTrash />}
              loading={pending}
              onClick={() => setDeleteDraftOpen(true)}
            >
              حذف پیش‌نویس
            </Button>
          )}
          {isDraft && (
            <Button variant="solid" loading={pending} onClick={handleSave}>
              ذخیره پیش‌نویس
            </Button>
          )}
          {contract && canCancelActiveContract && (
            <Button
              variant="solid"
              icon={<TbBan />}
              loading={pending}
              className="bg-red-600 hover:bg-red-700 active:bg-red-700"
              onClick={() => setCancelOpen(true)}
            >
              ابطال قرارداد
            </Button>
          )}
          {contract?.status === "completed" && (
            <>
              <Button
                variant="solid"
                icon={<TbPrinter />}
                onClick={handlePrintCompletedContract}
              >
                دریافت سند قرارداد
              </Button>
            </>
          )}
        </div>
      </div>

      {contract && isCompleted && (
        <div id="contract-print-area" dir="rtl">
          <div className="print-watermark">
            {contract.trackingCode ?? contract.uuid}
          </div>
          <section className="print-page">
            <section className="print-certificate">
              <p>
                گواهی می‌شود قرارداد حاضر با شماره رهگیری{" "}
                <b dir="ltr">{contract.trackingCode ?? "-"}</b> در تاریخ{" "}
                <b>
                  {formatPersianDateTime(
                    contract.updatedAt ?? contract.createdAt,
                  )}
                </b>{" "}
                نزد سامانه دادلاین منعقد و نسخه الکترونیکی آن ثبت شده است. این
                سند با اتکا به داده‌های هویتی امضاکنندگان، سوابق امضا و کد رهگیری
                درج‌شده، دارای اعتبار قانونی و قابل استناد بوده و اصالت آن از
                طریق QR Code و صفحه استعلام دادلاین قابل بررسی است.
              </p>
              <div className="print-qr-box">
                {contract.qrUrl ? (
                  <img src={contract.qrUrl} alt="QR Code اصالت قرارداد" />
                ) : (
                  <span>QR</span>
                )}
              </div>
            </section>

            <section className="print-meta">
              <div>
                <span>شماره رهگیری</span>
                <strong dir="ltr">{contract.trackingCode ?? "-"}</strong>
              </div>
              <div>
                <span>شناسه سند</span>
                <strong dir="ltr">{contract.uuid}</strong>
              </div>
              <div>
                <span>تاریخ ایجاد</span>
                <strong>{formatPersianDateTime(contract.createdAt)}</strong>
              </div>
              <div>
                <span>تاریخ انعقاد</span>
                <strong>
                  {formatPersianDateTime(
                    contract.updatedAt ?? contract.createdAt,
                  )}
                </strong>
              </div>
            </section>

            <h1 className="print-title">{contract.title}</h1>
            <section className="print-contract-text">
              <article
                className="print-body"
                dangerouslySetInnerHTML={{
                  __html: values.body || contract.body || "",
                }}
              />
            </section>

            {(contract.attachments ?? []).length > 0 && (
              <section className="print-attachments">
                <table>
                  <thead>
                    <tr>
                      <th>نام پیوست</th>
                      <th>شناسه فایل</th>
                      <th>حجم</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(contract.attachments ?? []).map((attachment, index) => (
                      <tr key={attachment.id}>
                        <td>
                          {attachment.originalName ??
                            `پیوست ${(index + 1).toLocaleString("fa-IR")}`}
                        </td>
                        <td dir="ltr">{attachment.attachmentId}</td>
                        <td>
                          {attachment.sizeBytes
                            ? `${Math.ceil(
                                attachment.sizeBytes / 1024,
                              ).toLocaleString("fa-IR")} KB`
                            : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            )}

            <section className="print-signatures">
              <div className="print-signature-grid">
                {(contract.signatures ?? []).map((signature, index) => (
                  <div key={signature.id} className="print-signature-card">
                    <div className="print-signature-image">
                      {signature.signatureUrl ? (
                        <img
                          src={signature.signatureUrl}
                          alt={`تصویر امضای ${signature.fullName ?? signature.mobile ?? ""}`}
                        />
                      ) : (
                        <span>تصویر امضا موجود نیست</span>
                      )}
                    </div>
                    <p className="print-signature-statement">
                      سند حاضر با کد رهگیری{" "}
                      <b dir="ltr">{contract.trackingCode ?? "-"}</b> توسط{" "}
                      <b>
                        {signature.fullName ||
                          `امضاکننده ${(index + 1).toLocaleString("fa-IR")}`}
                      </b>
                      {signature.nationalId ? (
                        <>
                          {" "}
                          با کدملی <b dir="ltr">{signature.nationalId}</b>
                        </>
                      ) : null}{" "}
                      با شناسه پذیرش <b dir="ltr">{signature.id}</b>
                      {signature.signatureCode ? (
                        <>
                          ، شناسه تایید{" "}
                          <b dir="ltr">{signature.signatureCode}</b>
                        </>
                      ) : null}
                      {signature.signatureId ? (
                        <>
                          {" "}
                          و شناسه امضا <b dir="ltr">{signature.signatureId}</b>
                        </>
                      ) : null}
                      {signature.ipAddress ? (
                        <>
                          {" "}
                          از آی‌پی <b dir="ltr">{signature.ipAddress}</b>
                        </>
                      ) : null}
                      {signature.signedAt ? (
                        <>
                          {" "}
                          در تاریخ{" "}
                          <b>{formatPersianDateTime(signature.signedAt)}</b>
                        </>
                      ) : null}{" "}
                      به صورت الکترونیکی در سامانه دادلاین امضاء شد.
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </section>
        </div>
      )}

      <style jsx global>{`
                #contract-print-area,
                #contract-print-area-print-root {
                    display: none;
                }

                @media print {
                    @page {
                        size: A4;
                        margin: 8mm 8mm 9mm;

                        @bottom-center {
                            content: 'کد رهگیری: ${contract?.trackingCode ?? "-"} | صفحه ' counter(page) ' از ' counter(pages);
                            font-family: var(--font-vazirmatn), Tahoma, sans-serif;
                            font-size: 8pt;
                            color: #4b5563;
                        }
                    }

                    body.contract-printing > :not(#contract-print-area-print-root) {
                        display: none !important;
                    }

                    #contract-print-area-print-root,
                    #contract-print-area-print-root * {
                        visibility: visible !important;
                    }

                    #contract-print-area-print-root {
                        display: block !important;
                        position: static;
                        width: 100%;
                        background: #fff;
                        color: #111827;
                        font-family: var(--font-vazirmatn), Tahoma, sans-serif;
                    }

                    .print-page {
                        position: relative;
                        z-index: 1;
                        background: transparent;
                    }

                    .print-watermark {
                        position: fixed;
                        top: 50%;
                        left: 50%;
                        z-index: 0;
                        transform: translate(-50%, -50%) rotate(-28deg);
                        color: rgba(17, 24, 39, 0.09);
                        font-size: 34pt;
                        font-weight: 900;
                        text-align: center;
                        white-space: nowrap;
                        letter-spacing: 0;
                        pointer-events: none;
                    }

                    .print-certificate {
                        display: flex;
                        flex-direction: row;
                        gap: 3mm;
                        align-items: center;
                        direction: ltr;
                        border: 1px solid #9ca3af;
                        border-radius: 2mm;
                        min-height: 0;
                        padding: 2mm 2.5mm;
                        background: rgba(249, 250, 251, 0.72);
                        break-inside: avoid;
                    }

                    .print-certificate p {
                        direction: rtl;
                        flex: 1 1 auto;
                        margin: 0;
                        font-size: 8.5pt;
                        line-height: 1.45;
                        text-align: justify;
                    }

                    .print-meta {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        margin-top: 3.5mm;
                        border: 1px solid #d1d5db;
                        border-bottom: 0;
                        border-left: 0;
                        break-inside: avoid;
                    }

                    .print-meta div {
                        display: flex;
                        justify-content: space-between;
                        gap: 4mm;
                        border-bottom: 1px solid #d1d5db;
                        border-left: 1px solid #d1d5db;
                        padding: 2mm 2.5mm;
                        font-size: 8.8pt;
                    }

                    .print-meta span {
                        color: #6b7280;
                    }

                    .print-meta strong {
                        font-weight: 800;
                    }

                    .print-qr-box {
                        flex: 0 0 18mm;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        width: 18mm;
                        height: 18mm;
                        border: 1px solid #111827;
                        border-radius: 2mm;
                        background: rgba(255, 255, 255, 0.72);
                    }

                    .print-qr-box img {
                        width: 16mm;
                        height: 16mm;
                        object-fit: contain;
                    }

                    .print-title {
                        margin: 5mm 0 4mm;
                        font-size: 11.5pt;
                        line-height: 1.45;
                        text-align: center;
                        border: 1px solid rgba(17, 24, 39, 0.45);
                        border-right-width: 4px;
                        border-left-width: 4px;
                        border-radius: 1.5mm;
                        padding: 2mm 4mm;
                        background: transparent;
                        box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.45);
                    }

                    .print-section-title {
                        margin-bottom: 4mm;
                        border-right: 4px solid #111827;
                        padding-right: 3mm;
                        font-size: 12pt;
                        font-weight: 900;
                        color: #111827;
                    }

                    .print-contract-text {
                        border: 0;
                        border-radius: 0;
                        padding: 0;
                        background: transparent;
                    }

                    .print-body {
                        font-size: 8.7pt;
                        line-height: 1.55;
                        text-align: justify;
                    }

                    .print-body p {
                        margin: 0 0 1.5mm;
                    }

                    .print-body h1,
                    .print-body h2,
                    .print-body h3,
                    .print-body h4,
                    .print-body h5,
                    .print-body h6 {
                        margin: 2.5mm 0 1.5mm;
                        color: #111827;
                        font-weight: 900;
                        line-height: 1.35;
                        text-align: right;
                    }

                    .print-body h1 {
                        font-size: 11pt;
                    }

                    .print-body h2 {
                        font-size: 10.5pt;
                    }

                    .print-body h3,
                    .print-body h4,
                    .print-body h5,
                    .print-body h6 {
                        font-size: 10pt;
                    }

                    .print-body table {
                        width: 100%;
                        border-collapse: collapse;
                    }

                    .print-body th,
                    .print-body td {
                        border: 1px solid #d1d5db;
                        padding: 2mm;
                    }

                    .print-attachments {
                        margin-top: 5mm;
                        break-inside: avoid;
                    }

                    .print-attachments table {
                        width: 100%;
                        border-collapse: collapse;
                        font-size: 8.5pt;
                        background: transparent;
                    }

                    .print-attachments th,
                    .print-attachments td {
                        border: 1px solid #d1d5db;
                        padding: 1.8mm 2mm;
                        text-align: right;
                        background: transparent;
                    }

                    .print-attachments th {
                        font-weight: 800;
                    }

                    .print-signatures {
                        margin-top: 7mm;
                        break-before: auto;
                    }

                    .print-signature-grid {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 5mm;
                    }

                    .print-signature-card {
                        border: 1px solid #d1d5db;
                        border-radius: 2mm;
                        padding: 3.5mm;
                        break-inside: avoid;
                        background: transparent;
                    }

                    .print-signature-head {
                        display: none;
                    }

                    .print-signature-image {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        min-height: 28mm;
                        border: 1px dashed #d1d5db;
                        border-radius: 2mm;
                        color: #6b7280;
                        font-size: 9pt;
                        background: transparent;
                    }

                    .print-signature-image img {
                        max-width: 100%;
                        max-height: 28mm;
                        object-fit: contain;
                    }

                    .print-signature-statement {
                        margin: 3mm 0 0;
                        direction: rtl;
                        font-size: 8pt;
                        line-height: 1.75;
                        text-align: justify;
                        text-align-last: right;
                    }

                    .print-signature-statement b {
                        font-weight: 900;
                    }
                }
            `}</style>

      {stepsVisible && (
        <AdaptiveCard className="overflow-hidden">
          <div className="md:hidden">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs text-gray-500">
                  مرحله {(step + 1).toLocaleString("fa-IR")} از{" "}
                  {contractStepLabels.length.toLocaleString("fa-IR")}
                </div>
                <div className="mt-1 truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {contractStepLabels[step]}
                </div>
              </div>
              <ContractStatusTag
                status={contract?.status ?? "draft"}
                label={contract?.statusLabel ?? contractStepLabels[step]}
              />
            </div>
            <div className="flex items-center gap-1.5">
              {contractStepLabels.map((label, index) => (
                <div
                  key={label}
                  className={`h-2 flex-1 rounded-full ${
                    index <= step
                      ? "bg-primary dark:bg-primary"
                      : "bg-gray-200 dark:bg-gray-700"
                  }`}
                />
              ))}
            </div>
          </div>
          <div className="hidden overflow-x-auto pb-1 md:block">
            <div className="min-w-180">
              <Steps current={step}>
                {contractStepLabels.map((label) => (
                  <StepItem key={label} title={label} />
                ))}
              </Steps>
            </div>
          </div>
        </AdaptiveCard>
      )}

      {(paymentReturnMessage || message || error) && (
        <div
          className={`rounded-lg px-4 py-3 text-sm ${
            error || paymentStatus === "failed"
              ? "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-100"
              : "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-100"
          }`}
        >
          {error ?? paymentReturnMessage ?? message}
        </div>
      )}

      {needsLevelTwoVerification && (
        <div className="flex flex-col gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-7 text-amber-800 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-100 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <TbShieldCheck className="mt-1 shrink-0 text-xl" />
            <div>
              برای امضای قرارداد، تکمیل احراز هویت سطح ۲ الزامی است. ابتدا
              اطلاعات هویتی خود را در پروفایل تکمیل کنید، سپس به همین قرارداد
              بازگردید و فرایند امضا را ادامه دهید.
            </div>
          </div>
          <a
            href="/pishkhan/profile/verification"
            className="inline-flex h-9 shrink-0 items-center justify-center rounded-xl border border-amber-300 bg-white px-3 text-sm font-semibold text-amber-800 transition-colors hover:bg-amber-100 dark:border-amber-600 dark:bg-amber-950/40 dark:text-amber-100 dark:hover:bg-amber-900/40"
          >
            تکمیل احراز هویت
          </a>
        </div>
      )}

      {contract && isDraft && renderFinalizationCard()}

      {contract && isCompleted && (
        <ContractEvidenceSummaryBar contract={contract} />
      )}

      <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-5">
          <AdaptiveCard
            className={
              isContractEditorFullscreen
                ? "fixed inset-3 z-50 overflow-y-auto bg-white shadow-2xl dark:bg-gray-900 md:inset-6"
                : ""
            }
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold">متن قرارداد</h3>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    shape="circle"
                    icon={
                      isContractEditorFullscreen ? (
                        <TbArrowsMinimize />
                      ) : (
                        <TbArrowsMaximize />
                      )
                    }
                    onClick={() =>
                      setIsContractEditorFullscreen((current) => !current)
                    }
                    title={
                      isContractEditorFullscreen
                        ? "خروج از تمام صفحه"
                        : "تمام صفحه"
                    }
                    aria-label={
                      isContractEditorFullscreen
                        ? "خروج از حالت تمام صفحه متن قرارداد"
                        : "نمایش متن قرارداد در حالت تمام صفحه"
                    }
                  />
                  {isDraft && (
                    <Button
                      icon={<TbBrain />}
                      onClick={handleAnalyze}
                      disabled={!contract}
                    >
                      بررسی با هوش مصنوعی
                    </Button>
                  )}
                </div>
              </div>
              <FormItem label="عنوان قرارداد">
                <Input
                  value={values.title}
                  disabled={!isDraft}
                  placeholder="مثلاً قرارداد همکاری طراحی سایت"
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                />
              </FormItem>
              <FormItem label="متن کامل قرارداد">
                <RichTextEditor
                  key={contract?.uuid ?? "new-contract-editor"}
                  content={values.body}
                  editable={isDraft}
                  customToolBar={(
                    editor,
                    {
                      ToolButtonBold,
                      ToolButtonItalic,
                      ToolButtonHeading,
                      ToolButtonBulletList,
                      ToolButtonOrderedList,
                      ToolButtonUndo,
                      ToolButtonRedo,
                    },
                  ) => (
                    <>
                      <ToolButtonUndo editor={editor} />
                      <ToolButtonRedo editor={editor} />
                      <ToolButtonHeading
                        editor={editor}
                        headingLevel={[2, 3, 4]}
                      />
                      <ToolButtonBold editor={editor} />
                      <ToolButtonItalic editor={editor} />
                      <ToolButtonOrderedList editor={editor} />
                      <ToolButtonBulletList editor={editor} />
                    </>
                  )}
                  editorContentClass={`overflow-y-auto rounded-b-xl bg-white dark:bg-gray-950 [&_.ProseMirror]:max-w-full [&_.ProseMirror]:overflow-x-auto [&_.ProseMirror]:break-words [&_.ProseMirror]:rounded-lg [&_.ProseMirror]:bg-white [&_.ProseMirror]:px-4 [&_.ProseMirror]:pb-8 [&_.ProseMirror]:pt-3 [&_.ProseMirror_img]:max-w-full [&_.ProseMirror_table]:max-w-full dark:[&_.ProseMirror]:bg-gray-950 ${
                    isContractEditorFullscreen
                      ? "min-h-[calc(100vh-260px)] max-h-[calc(100vh-210px)] [&_.ProseMirror]:min-h-[calc(100vh-280px)]"
                      : "min-h-[520px] max-h-[70vh] [&_.ProseMirror]:min-h-[520px]"
                  } ${!isDraft ? "opacity-90" : ""}`}
                  onChange={(content) =>
                    setValues((current) => ({
                      ...current,
                      body: content.html,
                    }))
                  }
                />
              </FormItem>
            </div>
          </AdaptiveCard>
        </div>

        <div className="order-first flex min-w-0 flex-col gap-5 xl:sticky xl:top-24 xl:order-0 xl:self-start">
          {isDraft && renderPartiesCard("order-2")}

          {contract && isCancelled && isCreator && renderCancelledCopyCard()}

          {contract && isCompleted && (
            <CompletedSignaturesCard signatures={contract.signatures ?? []} />
          )}

          {attachmentsPanelVisible && (
            <AdaptiveCard className={isActive ? "order-3" : "order-4"}>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">پیوست‌ها</h3>
                {isDraft && (
                  <Upload
                    key={uploadResetKey}
                    draggable
                    multiple
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                    disabled={!contract}
                    showList={false}
                    beforeUpload={(fileList) => {
                      const files = Array.from(fileList ?? [])
                      const invalid = files
                        .map((file) => validateAttachmentFile(file))
                        .find(Boolean)

                      return invalid ?? true
                    }}
                    onChange={(files, previousFiles) =>
                      void handleAttachmentUpload(
                        files.slice(previousFiles.length),
                      )
                    }
                  >
                    <div className="flex flex-col items-center gap-2 py-6 text-center text-sm text-gray-500">
                      <TbFilePlus className="text-3xl" />
                      <span>فایل‌های قرارداد را اینجا بکشید یا انتخاب کنید</span>
                      <span className="text-xs">
                        PDF، Word، Excel، JPG و PNG تا ۲۰ مگابایت
                      </span>
                    </div>
                  </Upload>
                )}
                {uploadProgress.length > 0 && (
                  <div className="space-y-2">
                    {uploadProgress.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-lg border border-gray-200 p-3 text-sm dark:border-gray-700"
                      >
                        <div className="flex justify-between gap-3">
                          <span className="truncate">{item.name}</span>
                          <span>
                            {item.status === "done"
                              ? "تکمیل شد"
                              : item.status === "error"
                                ? "ناموفق"
                                : `${item.progress.toLocaleString("fa-IR")}٪`}
                          </span>
                        </div>
                        <div className="mt-2 h-2 overflow-hidden rounded bg-gray-100 dark:bg-gray-800">
                          <div
                            className={`h-full rounded ${
                              item.status === "error"
                                ? "bg-red-500"
                                : "bg-primary"
                            }`}
                            style={{
                              width: `${item.progress}%`,
                            }}
                          />
                        </div>
                        {item.error && (
                          <div className="mt-2 text-xs text-red-600">
                            {item.error}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {values.attachments.length > 0 && (
                  <AttachmentList
                    items={values.attachments.map((attachment, index) => {
                      const source = contract?.attachments?.find(
                        (item) =>
                          item.id === attachment.id ||
                          item.attachmentId === attachment.attachmentId,
                      )
                      const details =
                        source ??
                        uploadedAttachmentDetails[attachment.attachmentId]

                      return {
                        id: `${attachment.attachmentId}-${index}`,
                        name: details?.originalName,
                        mimeType: details?.mimeType,
                        sizeBytes: details?.sizeBytes,
                        url: attachmentsDownloadable ? details?.url : null,
                      }
                    })}
                    onRemove={
                      isDraft
                        ? (_, index) => removeAttachment(index)
                        : undefined
                    }
                  />
                )}
              </div>
            </AdaptiveCard>
          )}

          {isActive && contract && (
            <AdaptiveCard className="order-2">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">فرایند امضا</h3>
                  <span className="text-sm text-gray-500">
                    {signedCount} از {contract.signatures?.length ?? 0}
                  </span>
                </div>
                <div className="space-y-4">
                  {!hasPendingSignatures && (
                    <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm leading-7 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-100">
                      همه طرفین قرارداد امضا کرده‌اند.
                    </div>
                  )}
                  {signingProcessSignatures.map((signature) => {
                    const isCurrentSigner =
                      session?.user?.mobile === signature.mobile
                    const canSign =
                      isCurrentSigner &&
                      (!!signature.userId || isCreator) &&
                      signature.signatureStatus !== "signed"
                    const statusLabel =
                      signature.signatureStatus === "signed"
                        ? "امضا شده"
                        : signature.userId
                          ? "در انتظار امضا"
                          : signature.viewedAt
                            ? "مشاهده شده"
                            : "دعوت‌نامه ارسال شده"
                    const showResendInvite =
                      isCreator && statusLabel === "دعوت‌نامه ارسال شده"
                    const resendInviteTitle =
                      signature.canResendInvitation === false
                        ? `ارسال مجدد از ${formatPersianDate(signature.canResendInvitationAt)} امکان‌پذیر است.`
                        : "ارسال مجدد دعوت‌نامه"

                    return (
                      <div
                        key={signature.id}
                        className="space-y-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="font-semibold">
                              {signature.fullName || signature.mobile}
                            </div>
                            <div className="text-xs text-gray-500">
                              {signature.mobile}
                            </div>
                            {signature.signatureStatus === "signed" && (
                              <div className="mt-1 text-xs text-emerald-700 dark:text-emerald-100">
                                تاریخ امضا:{" "}
                                {signature.signedAt
                                  ? formatPersianDateTime(signature.signedAt)
                                  : "-"}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {showResendInvite && (
                              <Button
                                size="xs"
                                shape="circle"
                                icon={<TbMailForward />}
                                disabled={
                                  signature.canResendInvitation === false
                                }
                                title={resendInviteTitle}
                                aria-label={resendInviteTitle}
                                onClick={() => handleResendInvite(signature)}
                              />
                            )}
                            <Tag
                              className={
                                signature.signatureStatus === "signed"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : signature.viewedAt
                                    ? "bg-sky-100 text-sky-700"
                                    : "bg-gray-100 text-gray-700"
                              }
                            >
                              {statusLabel}
                            </Tag>
                          </div>
                        </div>

                        {canSign && (
                          <Button
                            block
                            variant="solid"
                            icon={<TbCheck />}
                            onClick={() => openSignatureDialog(signature)}
                          >
                            شروع فرایند امضا
                          </Button>
                        )}
                      </div>
                    )
                  })}
                </div>
                {hasPendingSignatures && (
                  <div className="rounded-lg bg-blue-50 px-3 py-2 text-xs leading-6 text-blue-700 dark:bg-blue-900/30 dark:text-blue-100">
                    پس از ثبت آخرین امضا، سند پردازش و منعقد می‌شود.
                  </div>
                )}
              </div>
            </AdaptiveCard>
          )}
        </div>
      </div>

      <Dialog
        isOpen={deleteDraftOpen}
        width={520}
        onClose={() => setDeleteDraftOpen(false)}
        onRequestClose={() => setDeleteDraftOpen(false)}
      >
        <div className="space-y-5">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-2xl text-red-600 dark:bg-red-900/30 dark:text-red-100">
              <TbAlertTriangle />
            </div>
            <div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                حذف پیش‌نویس قرارداد
              </h4>
              <p className="mt-2 text-sm leading-7 text-gray-600 dark:text-gray-300">
                حذف پیش‌نویس قابل برگشت نیست. پس از تایید، ردیف قرارداد، طرفین
                قرارداد، رویدادهای ثبت‌شده و همه پیوست‌های مربوط به این پیش‌نویس از
                جدول‌ها و فضای ذخیره‌سازی حذف می‌شوند.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" onClick={() => setDeleteDraftOpen(false)}>
              انصراف
            </Button>
            <Button
              type="button"
              variant="solid"
              icon={<TbTrash />}
              loading={pending}
              className="bg-red-600 hover:bg-red-700 active:bg-red-700"
              onClick={handleDeleteDraft}
            >
              تایید حذف پیش‌نویس
            </Button>
          </div>
        </div>
      </Dialog>

      <Dialog
        isOpen={cancelOpen}
        width={520}
        onClose={() => setCancelOpen(false)}
        onRequestClose={() => setCancelOpen(false)}
      >
        <div className="space-y-5">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-2xl text-red-600 dark:bg-red-900/30 dark:text-red-100">
              <TbAlertTriangle />
            </div>
            <div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                ابطال قرارداد
              </h4>
              <p className="mt-2 text-sm leading-7 text-gray-600 dark:text-gray-300">
                ابطال قرارداد قابل برگشت نیست. پس از تایید، دسترسی طرفین قرارداد
                قطع می‌شود و کلیه پیوست‌ها، تصاویر امضای مربوط به همین قرارداد،
                رویدادها و اطلاعات وابسته از سرور و فضای ذخیره‌سازی حذف خواهد شد.
                هزینه ثبت قرارداد قابل بازگشت نیست.
              </p>
            </div>
          </div>
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs leading-6 text-red-700 dark:border-red-700 dark:bg-red-900/20 dark:text-red-100">
            این عملیات فقط زمانی مجاز است که قرارداد در وضعیت فعال برای امضا
            باشد و حداقل یکی از امضاکنندگان هنوز امضا نکرده باشد.
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" onClick={() => setCancelOpen(false)}>
              انصراف
            </Button>
            <Button
              type="button"
              variant="solid"
              icon={<TbBan />}
              loading={pending}
              className="bg-red-600 hover:bg-red-700 active:bg-red-700"
              onClick={handleCancelActiveContract}
            >
              تایید ابطال قرارداد
            </Button>
          </div>
        </div>
      </Dialog>

      <Dialog
        isOpen={!!activeSignature}
        width={620}
        contentClassName="max-h-[92vh] overflow-hidden p-0"
        onClose={closeSignatureDialog}
        onRequestClose={closeSignatureDialog}
      >
        {activeSignature && (
          <div className="flex max-h-[92vh] flex-col overflow-hidden">
            <div className="shrink-0 border-b border-gray-100 px-5 py-4 pe-12 dark:border-gray-800">
              <h4 className="text-base font-semibold">فرایند امضای سند</h4>
              <p className="mt-1 truncate text-xs text-gray-500">
                {activeSignature.fullName || activeSignature.mobile}
              </p>
            </div>

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
              <div className="grid gap-2 sm:grid-cols-2">
                <div
                  className={`rounded-lg border px-3 py-2 text-xs sm:text-sm ${
                    signatureDialogStep === "signature"
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-gray-200 text-gray-500 dark:border-gray-700"
                  }`}
                >
                  ۱. تایید تصویر امضا
                </div>
                <div
                  className={`rounded-lg border px-3 py-2 text-xs sm:text-sm ${
                    signatureDialogStep === "otp"
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-gray-200 text-gray-500 dark:border-gray-700"
                  }`}
                >
                  ۲. تایید کد و ثبت امضا
                </div>
              </div>

              {(signatureDialogError || signatureDialogMessage) && (
                <div
                  className={`rounded-lg px-3 py-2 text-sm leading-7 ${
                    signatureDialogError
                      ? "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-100"
                      : "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-100"
                  }`}
                >
                  {signatureDialogError ?? signatureDialogMessage}
                </div>
              )}

              {signatureDialogStep === "signature" ? (
                <div className="space-y-3">
                  {signatureInputMode === "overview" &&
                    profileSignatureImage && (
                      <div className="space-y-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                        <div>
                          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            تصویر امضا یا مهر ثبت‌شده
                          </div>
                          <div className="mt-1 text-xs leading-6 text-gray-500">
                            برای ادامه می‌توانید همین تصویر را انتخاب کنید یا آن
                            را بروزرسانی کنید.
                          </div>
                        </div>
                        <div className="flex justify-center rounded-lg bg-white p-3 dark:bg-gray-900">
                          <img
                            src={profileSignatureImage.url}
                            alt="تصویر امضا یا مهر"
                            className="max-h-32 max-w-full object-contain"
                          />
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2">
                          <Button
                            block
                            size="sm"
                            variant="solid"
                            disabled={signatureImageUploading}
                            onClick={handleConfirmProfileSignature}
                          >
                            انتخاب امضا
                          </Button>
                          <Button
                            block
                            size="sm"
                            disabled={signatureImageUploading}
                            onClick={() => setSignatureInputMode("choose")}
                          >
                            بروزرسانی امضا
                          </Button>
                        </div>
                      </div>
                    )}

                  {signatureInputMode === "choose" && (
                    <div className="space-y-3">
                      <div className="rounded-lg bg-gray-50 p-3 text-sm leading-7 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                        {profileSignatureImage
                          ? "برای بروزرسانی امضا، می‌توانید امضای جدید را ترسیم کنید یا تصویر امضا و مهر را بارگذاری کنید."
                          : "هنوز تصویر امضا یا مهر ثبت نشده است. می‌توانید امضای خود را ترسیم کنید یا تصویر امضا و مهر را بارگذاری کنید."}
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <button
                          type="button"
                          className="rounded-lg border border-gray-200 p-4 text-start transition hover:border-primary hover:bg-primary/5 dark:border-gray-700"
                          onClick={() => setSignatureInputMode("draw")}
                        >
                          <div className="font-semibold text-gray-900 dark:text-gray-100">
                            ترسیم امضا
                          </div>
                          <div className="mt-2 text-xs leading-6 text-gray-500">
                            امضا را همین‌جا ترسیم و سپس ذخیره کنید.
                          </div>
                        </button>
                        <button
                          type="button"
                          className="rounded-lg border border-gray-200 p-4 text-start transition hover:border-primary hover:bg-primary/5 dark:border-gray-700"
                          onClick={() => setSignatureInputMode("upload")}
                        >
                          <div className="font-semibold text-gray-900 dark:text-gray-100">
                            بارگذاری تصویر
                          </div>
                          <div className="mt-2 text-xs leading-6 text-gray-500">
                            تصویر امضا یا امضا و مهر را بارگذاری کنید.
                          </div>
                        </button>
                      </div>
                      {profileSignatureImage && (
                        <Button
                          size="sm"
                          onClick={() => setSignatureInputMode("overview")}
                        >
                          بازگشت به امضای ثبت‌شده
                        </Button>
                      )}
                    </div>
                  )}

                  {signatureInputMode === "upload" && (
                    <div className="space-y-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                      <div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          بارگذاری تصویر امضا یا مهر
                        </div>
                        <div className="mt-1 text-xs leading-6 text-gray-500">
                          فایل پس از بارگذاری ذخیره می‌شود و سپس می‌توانید همان
                          تصویر را انتخاب کنید.
                        </div>
                      </div>
                      <label className="button bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-gray-700 dark:text-gray-100 sm:w-auto">
                        <TbUpload />
                        انتخاب و بارگذاری تصویر
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                          className="hidden"
                          disabled={signatureImageUploading}
                          onChange={handleProfileSignatureFileChange}
                        />
                      </label>
                    </div>
                  )}

                  {signatureInputMode === "draw" && (
                    <div className="space-y-3">
                      <div className="rounded-lg bg-gray-50 p-3 text-sm leading-7 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                        امضای خود را ترسیم کنید و سپس روی «ذخیره امضا» بزنید.
                        بعد از ذخیره، تصویر امضا قابل انتخاب می‌شود.
                      </div>
                      <SignatureCanvas
                        onChange={(dataUrl) =>
                          setSignatureDrawings((current) => ({
                            ...current,
                            [activeSignature.id]: dataUrl,
                          }))
                        }
                      />
                    </div>
                  )}

                  {signatureImageUploadProgress !== null && (
                    <div className="space-y-1 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                      <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{
                            width: `${signatureImageUploadProgress}%`,
                          }}
                        />
                      </div>
                      <div className="text-xs text-gray-500">
                        {signatureImageUploadProgress.toLocaleString("fa-IR")}٪
                        بارگذاری شده
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="rounded-lg bg-amber-200 p-2 text-sm leading-7 text-gray-600 dark:bg-gray-800 dark:text-gray-300 text-center">
                    کد تایید جهت احراز اراده و انتساب امضای الکترونیکی به شماره
                    موبایل ثبت‌شده امضاکننده ارسال می‌گردد. با امضای این سند، شما
                    تایید می‌کنید که قرارداد را مطالعه و مفاد آن را قبول کرده‌اید
                  </div>
                  <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                    <Input
                      value={otpCodes[activeSignature.id] ?? ""}
                      maxLength={6}
                      placeholder="کد تایید ۶ رقمی"
                      onChange={(event) =>
                        setOtpCodes((current) => ({
                          ...current,
                          [activeSignature.id]: toEnglishDigits(
                            event.target.value,
                          )
                            .replace(/\D/g, "")
                            .slice(0, 6),
                        }))
                      }
                    />
                    <Button
                      loading={sendingOtpSignatureId === activeSignature.id}
                      disabled={
                        sendingOtpSignatureId === activeSignature.id ||
                        activeOtpCooldownMs > 0
                      }
                      onClick={() => handleSendOtp(activeSignature)}
                    >
                      {activeOtpCooldownMs > 0
                        ? formatCountdown(activeOtpCooldownMs)
                        : "تایید و دریافت کد"}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="shrink-0 border-t border-gray-100 bg-white px-5 py-3 dark:border-gray-800 dark:bg-gray-900">
              {signatureDialogStep === "signature" ? (
                <div className="flex justify-end gap-2">
                  {signatureInputMode !== "overview" &&
                    profileSignatureImage && (
                      <Button onClick={() => setSignatureInputMode("overview")}>
                        بازگشت
                      </Button>
                    )}
                  {signatureInputMode !== "overview" &&
                    !profileSignatureImage &&
                    signatureInputMode !== "choose" && (
                      <Button onClick={() => setSignatureInputMode("choose")}>
                        بازگشت
                      </Button>
                    )}
                  <Button onClick={closeSignatureDialog}>انصراف</Button>
                  {signatureInputMode === "draw" && (
                    <Button
                      variant="solid"
                      loading={signatureImageUploading}
                      disabled={signatureImageUploading}
                      onClick={handleSaveDrawnSignature}
                    >
                      ذخیره امضا
                    </Button>
                  )}
                </div>
              ) : (
                <div className="flex justify-end gap-2">
                  <Button onClick={() => setSignatureDialogStep("signature")}>
                    بازگشت
                  </Button>
                  <Button
                    variant="solid"
                    icon={<TbCheck />}
                    loading={submittingSignatureId === activeSignature.id}
                    disabled={submittingSignatureId === activeSignature.id}
                    onClick={handleCompleteSignature}
                  >
                    ثبت نهایی امضا
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </Dialog>

      <Dialog
        isOpen={aiOpen}
        width={680}
        onClose={() => setAiOpen(false)}
        onRequestClose={() => setAiOpen(false)}
      >
        <div className="space-y-4">
          <h4>بررسی هوش مصنوعی قرارداد</h4>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-3 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <div>
                <h5 className="font-semibold">پیشنهادات و اصلاحات</h5>
                <p className="mt-1 text-xs leading-6 text-gray-500">
                  تحلیل اولیه متن قرارداد و اعلام موارد قابل اصلاح.
                </p>
              </div>
              <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {formatMoney(aiPricing?.analysisAmount ?? 0)}
              </div>
              <Button
                block
                variant="solid"
                loading={pending}
                onClick={() => openPaymentConfirmation("ai_analysis")}
              >
                دریافت پیشنهادات
              </Button>
            </div>
            <div className="space-y-3 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <div>
                <h5 className="font-semibold">بازنویسی قرارداد</h5>
                <p className="mt-1 text-xs leading-6 text-gray-500">
                  بازنویسی متن بر اساس دیتای اصلاحات اولیه.
                </p>
              </div>
              <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {formatMoney(aiPricing?.rewriteAmount ?? 0)}
              </div>
              <Button
                block
                loading={pending}
                disabled={!contract?.aiAnalysis && !aiText}
                onClick={() => openPaymentConfirmation("ai_rewrite")}
              >
                بازنویسی
              </Button>
            </div>
          </div>
          <div className="whitespace-pre-line rounded-lg bg-gray-50 p-4 text-sm leading-7 dark:bg-gray-800">
            {aiText ?? "ابتدا یکی از عملیات‌های بالا را انتخاب کنید."}
          </div>
          <div className="flex justify-end">
            <Button variant="solid" onClick={() => setAiOpen(false)}>
              متوجه شدم
            </Button>
          </div>
        </div>
      </Dialog>

      <Dialog
        isOpen={Boolean(paymentConfirmation)}
        width={480}
        onClose={() => setPaymentConfirmation(null)}
        onRequestClose={() => setPaymentConfirmation(null)}
      >
        {paymentConfirmation && (
          <div className="space-y-5">
            <div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {paymentConfirmation.title}
              </h4>
              {!(
                paymentConfirmation.action === "activation" &&
                creatorNeedsLevelTwoVerification
              ) && (
                <p className="mt-2 text-sm leading-7 text-gray-600 dark:text-gray-300">
                  {paymentConfirmation.description}
                </p>
              )}
            </div>
            {paymentConfirmation.action === "activation" &&
            creatorNeedsLevelTwoVerification ? (
              <>
                <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-7 text-amber-800 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-100">
                  <TbShieldCheck className="mt-1 shrink-0 text-xl" />
                  <div>
                    برای ثبت نهایی و ارسال دعوت‌نامه قرارداد، احراز هویت سطح ۲
                    الزامی است. ابتدا احراز هویت را تکمیل کنید و سپس ثبت نهایی
                    را انجام دهید.
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    onClick={() => setPaymentConfirmation(null)}
                  >
                    انصراف
                  </Button>
                  <a
                    href="/pishkhan/profile/verification"
                    className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-deep"
                  >
                    تکمیل احراز هویت
                  </a>
                </div>
              </>
            ) : (
              <>
                <div className="grid gap-2 rounded-lg bg-gray-50 p-3 text-sm dark:bg-gray-800">
                  {paymentConfirmation.action === "activation" && (
                    <>
                      <div className="flex min-h-8 items-center justify-between gap-3">
                        <span className="text-gray-500">پایه</span>
                        <strong className="text-gray-900 dark:text-gray-100">
                          {formatMoney(pricing.baseAmount)}
                        </strong>
                      </div>
                      <div className="flex min-h-8 items-center justify-between gap-3">
                        <span className="text-gray-500">طرفین</span>
                        <strong className="text-gray-900 dark:text-gray-100">
                          {pricing.partiesCount.toLocaleString("fa-IR")} نفر
                        </strong>
                      </div>
                      <div className="flex min-h-8 items-center justify-between gap-3">
                        <span className="text-gray-500">مازاد</span>
                        <strong className="text-gray-900 dark:text-gray-100">
                          {pricing.extraParties.toLocaleString("fa-IR")} نفر ×
                          ۲۵٪
                        </strong>
                      </div>
                    </>
                  )}
                  <div className="flex min-h-9 items-center justify-between gap-3">
                    <span className="text-gray-500">مبلغ قابل پرداخت</span>
                    <strong className="text-gray-900 dark:text-gray-100">
                      {formatMoney(paymentConfirmation.amount)}
                    </strong>
                  </div>
                  <div className="flex min-h-9 items-center justify-between gap-3">
                    <span className="text-gray-500">موجودی کیف پول</span>
                    <strong className="text-gray-900 dark:text-gray-100">
                      {walletBalance === null
                        ? "در حال دریافت"
                        : formatMoney(walletBalance)}
                    </strong>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    onClick={() => setPaymentConfirmation(null)}
                  >
                    انصراف
                  </Button>
                  <Button
                    type="button"
                    variant="solid"
                    loading={pending}
                    onClick={confirmPaymentAction}
                  >
                    {paymentConfirmation.confirmLabel}
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </Dialog>

      <Dialog
        isOpen={shareOpen}
        width={620}
        onClose={() => setShareOpen(false)}
        onRequestClose={() => setShareOpen(false)}
      >
        <div className="space-y-4">
          <h4>اشتراک‌گذاری پیش‌نویس قرارداد</h4>
          <p className="text-sm leading-7 text-gray-500">
            گیرنده ابتدا فقط عنوان قرارداد و نام ایجادکننده را می‌بیند. بعد از
            وارد کردن PIN، متن قرارداد، طرفین و پیوست‌ها نمایش داده می‌شود.
          </p>
          <FormItem label="آدرس پیش‌نمایش">
            <Input readOnly value={shareUrl} />
          </FormItem>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              PIN مشاهده
            </label>
            <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
              <Input
                readOnly
                value={contract?.pinCode ?? ""}
                className="h-11"
              />
              <Button
                className="h-11 whitespace-nowrap"
                icon={<TbRefresh />}
                loading={pending}
                onClick={handleRefreshPin}
              >
                تغییر PIN
              </Button>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button onClick={() => setShareOpen(false)}>بستن</Button>
            <Button variant="solid" icon={<TbCopy />} onClick={copyShareText}>
              کپی لینک و PIN
            </Button>
          </div>
        </div>
      </Dialog>
    </Container>
  )
}

export default ContractWorkspace
