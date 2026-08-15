"use client"

import Button from "@/components/ui/Button"
import DatePicker from "@/components/ui/DatePicker"
import Dialog from "@/components/ui/Dialog"
import Input from "@/components/ui/Input"
import { Form, FormItem } from "@/components/ui/Form"
import dayjs from "dayjs"
import { useActionState, useEffect, useState } from "react"
import type { ReactNode } from "react"
import { useRouter } from "next/navigation"
import {
  chargeWallet,
  createGiftCard,
  redeemGiftCard,
  requestWalletWithdrawal,
} from "@/server/actions/wallet/mutateWallet"
import type {
  PayoutSettlement,
  WalletGiftCard,
  WalletSummary,
} from "@/@types/wallet"
import type { WalletMutationState } from "@/server/actions/wallet/wallet.schemas"
import {
  formatMoney,
  formatMoneyNoneLabel,
  formatPersianDate,
  WalletStatusTag,
} from "./wallet-ui"
import {
  TbBuildingBank,
  TbCalendarStats,
  TbCopy,
  TbEdit,
  TbGift,
  TbLock,
  TbReceipt2,
  TbSend,
  TbSparkles,
  TbWallet,
} from "react-icons/tb"

type Props = {
  summary: WalletSummary
  settlements: PayoutSettlement[]
  giftCards: WalletGiftCard[]
  settlementFee: number
}

const initialState: WalletMutationState = {
  status: "idle",
  message: null,
}

const quickChargeAmounts = [
  50000, 100000, 250000, 500000, 1000000, 2500000, 5000000, 10000000,
]

const makeSuggestedGiftCode = () =>
  `DAD-${Math.random().toString(36).slice(2, 10).toUpperCase()}`

const toEnglishDigits = (value: string) =>
  value.replace(/[۰-۹٠-٩]/g, (digit) => {
    const map: Record<string, string> = {
      "۰": "0",
      "۱": "1",
      "۲": "2",
      "۳": "3",
      "۴": "4",
      "۵": "5",
      "۶": "6",
      "۷": "7",
      "۸": "8",
      "۹": "9",
      "٠": "0",
      "١": "1",
      "٢": "2",
      "٣": "3",
      "٤": "4",
      "٥": "5",
      "٦": "6",
      "٧": "7",
      "٨": "8",
      "٩": "9",
    }

    return map[digit] ?? digit
  })

const amountFromInput = (value: string) =>
  Number(toEnglishDigits(value).replace(/\D/g, ""))

function Alert({ state }: { state: WalletMutationState }) {
  if (!state.message) return null

  return (
    <div
      className={
        state.status === "success"
          ? "rounded-lg bg-emerald-50 px-3 py-2 text-sm leading-6 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-100"
          : "rounded-lg bg-red-50 px-3 py-2 text-sm leading-6 text-red-700 dark:bg-red-900/30 dark:text-red-100"
      }
    >
      {state.message}
    </div>
  )
}

const cardClass =
  "flex h-full min-w-0 flex-col rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
const dialogContentClass =
  "h-auto max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain"

function BalanceTile({
  icon,
  title,
  value,
  tone,
}: {
  icon: ReactNode
  title: string
  value: number
  tone: string
}) {
  return (
    <div className="flex min-w-0 flex-auto items-center justify-between gap-3 rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-900/40">
      <div className="flex min-w-0 items-center gap-2 text-xs text-gray-500">
        <span className={`text-base ${tone}`}>{icon}</span>
        <span className="truncate">{title}</span>
      </div>
      <div className="shrink-0 text-xs text-gray-900 dark:text-gray-100">
        {formatMoneyNoneLabel(value)}
      </div>
    </div>
  )
}

const WalletSidebar = ({
  summary,
  settlements,
  giftCards,
  settlementFee,
}: Props) => {
  const router = useRouter()
  const [withdrawOpen, setWithdrawOpen] = useState(false)
  const [chargeOpen, setChargeOpen] = useState(false)
  const [snappOpen, setSnappOpen] = useState(false)
  const [settlementsOpen, setSettlementsOpen] = useState(false)
  const [giftOpen, setGiftOpen] = useState(false)
  const [giftDialog, setGiftDialog] = useState<"redeem" | "manage">("redeem")
  const [giftMode, setGiftMode] = useState<"list" | "create">("list")
  const [chargeAmount, setChargeAmount] = useState("50000")
  const [snappAmount, setSnappAmount] = useState("1000000")
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [giftCode, setGiftCode] = useState("")
  const [giftAmount, setGiftAmount] = useState("")
  const [giftRedemptionLimit, setGiftRedemptionLimit] = useState("1")
  const [giftExpiresAt, setGiftExpiresAt] = useState<Date | null>(null)
  const [copiedGiftCode, setCopiedGiftCode] = useState<string | null>(null)
  const [chargeState, chargeAction, chargePending] = useActionState(
    chargeWallet,
    initialState,
  )
  const [snappState, snappAction, snappPending] = useActionState(
    chargeWallet,
    initialState,
  )
  const [withdrawState, withdrawAction, withdrawPending] = useActionState(
    requestWalletWithdrawal,
    initialState,
  )
  const [redeemState, redeemAction, redeemPending] = useActionState(
    redeemGiftCard,
    initialState,
  )
  const [createState, createAction, createPending] = useActionState(
    createGiftCard,
    initialState,
  )

  useEffect(() => {
    if (
      chargeState.status === "success" ||
      snappState.status === "success" ||
      createState.status === "success"
    ) {
      router.refresh()
    }
  }, [chargeState.status, createState.status, router, snappState.status])

  useEffect(() => {
    if (withdrawState.status === "success") {
      setWithdrawOpen(false)
      setWithdrawAmount("")
      router.refresh()
    }
  }, [router, withdrawState.status])

  useEffect(() => {
    if (redeemState.status === "success" || createState.status === "success") {
      setGiftOpen(false)
      setGiftCode("")
      setGiftAmount("")
      setGiftRedemptionLimit("1")
      setGiftExpiresAt(null)
      router.refresh()
    }
  }, [createState.status, redeemState.status, router])

  useEffect(() => {
    const paymentUrl = chargeState.paymentUrl ?? snappState.paymentUrl
    if (paymentUrl) {
      window.location.href = paymentUrl
    }
  }, [chargeState.paymentUrl, snappState.paymentUrl])

  const canWithdraw =
    summary.withdrawableBalance > 0 &&
    summary.isLevelTwoVerified &&
    summary.bankVerified &&
    Boolean(summary.iban)
  const canUseSnappPay = summary.isLevelTwoVerified
  const hasVerifiedIban = summary.bankVerified && Boolean(summary.iban)
  const requestedWithdrawalAmount = amountFromInput(withdrawAmount) || 0
  const payableSettlementFee = Math.min(
    settlementFee,
    requestedWithdrawalAmount,
  )
  const settlementPayableAmount = Math.max(
    requestedWithdrawalAmount - payableSettlementFee,
    0,
  )
  const giftTotal =
    amountFromInput(giftAmount) *
    Number(toEnglishDigits(giftRedemptionLimit).replace(/\D/g, "") || "0")
  const copyGiftCode = async (code: string) => {
    await navigator.clipboard.writeText(code)
    setCopiedGiftCode(code)
    window.setTimeout(() => setCopiedGiftCode(null), 1600)
  }

  return (
    <section className="grid min-w-0 items-stretch gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <div className={cardClass}>
        <div className="flex min-w-0 items-center justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
              کیف پول
            </h3>
          </div>
          <div className="flex min-w-0 items-center justify-center gap-2">
            <span className="min-w-0 truncate font-bold">
              {formatMoney(summary.balance)}
            </span>
            <span className="rounded-lg bg-primary/10 p-2 text-primary">
              <TbWallet />
            </span>
          </div>
        </div>

        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <BalanceTile
            icon={<TbBuildingBank />}
            title="قابل برداشت"
            value={summary.withdrawableBalance}
            tone="text-emerald-600"
          />
          <BalanceTile
            icon={<TbLock />}
            title="فریز شده"
            value={summary.blockedBalance}
            tone="text-amber-600"
          />
        </div>
        <Button
          className="mt-3"
          size="xs"
          variant="solid"
          block
          icon={<TbBuildingBank />}
          onClick={() => setChargeOpen(true)}
        >
          شارژ کیف پول
        </Button>
      </div>

      <div className={cardClass}>
        <div className="flex min-w-0 items-start gap-3">
          <span className="mt-1 text-lg text-primary">
            <TbBuildingBank />
          </span>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              پرداخت قسطی خدمات حقوقی
            </h3>
            <p className="mt-1 text-xs leading-5 text-gray-500">
              به زودی امکان شارژ قسطی فراهم خواهد شد
            </p>
          </div>
        </div>
        <Button
          className="mt-auto"
          size="xs"
          variant="solid"
          block
          onClick={() => setSnappOpen(true)}
        >
          پرداخت قسطی خدمات
        </Button>
      </div>

      <div className={cardClass}>
        <div className="flex min-w-0 items-start gap-3">
          <span className="mt-1 text-lg text-primary">
            <TbSend />
          </span>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              برداشت از کیف پول
            </h3>
            <p className="mt-1 text-xs leading-5 text-gray-500">
              برای درآمدها، سطح ۲ احراز هویت و شماره شبا الزامی است.
            </p>
          </div>
        </div>
        <div className="mt-4 grid gap-2 md:mt-auto md:grid-cols-2">
          <Button
            size="xs"
            variant="solid"
            block
            icon={<TbSend />}
            onClick={() => setWithdrawOpen(true)}
          >
            برداشت
          </Button>
          <Button
            size="xs"
            block
            icon={<TbReceipt2 />}
            onClick={() => setSettlementsOpen(true)}
          >
            تسویه حساب‌ها
          </Button>
        </div>
      </div>

      <div className={cardClass}>
        <div className="flex min-w-0 items-start gap-3">
          <span className="mt-1 text-lg text-primary">
            <TbGift />
          </span>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              کارت هدیه
            </h3>
            <p className="mt-1 text-xs leading-5 text-gray-500">
              کد هدیه را مصرف کنید یا برای دیگران کارت جدید بسازید.
            </p>
          </div>
        </div>
        <div className="mt-4 grid gap-2 md:mt-auto md:grid-cols-2">
          <Button
            className="mt-auto"
            size="xs"
            block
            variant="solid"
            icon={<TbGift />}
            onClick={() => {
              setGiftDialog("redeem")
              setGiftOpen(true)
            }}
          >
            ثبت کارت هدیه
          </Button>
          <Button
            size="xs"
            block
            icon={<TbGift />}
            onClick={() => {
              setGiftDialog("manage")
              setGiftMode("list")
              setGiftOpen(true)
            }}
          >
            مدیریت
          </Button>
        </div>
      </div>

      <Dialog
        isOpen={chargeOpen}
        width={560}
        contentClassName={dialogContentClass}
        onClose={() => setChargeOpen(false)}
        onRequestClose={() => setChargeOpen(false)}
      >
        <div className="space-y-4">
          <div className="pe-8">
            <h4 className="text-base font-bold">شارژ کیف پول</h4>
            <p className="mt-1 text-sm leading-6 text-gray-500">
              مبلغ دلخواه را از ۱۰٬۰۰۰ تومان به بالا وارد کنید یا یکی از مقادیر
              سریع را انتخاب کنید.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {quickChargeAmounts.map((amount) => (
              <Button
                key={amount}
                type="button"
                active={chargeAmount === String(amount)}
                onClick={() => setChargeAmount(String(amount))}
              >
                {formatMoney(amount)}
              </Button>
            ))}
          </div>

          <Form action={chargeAction} className="space-y-3">
            <input type="hidden" name="gateway" value="smart" />
            <FormItem
              label="مبلغ شارژ"
              invalid={Boolean(chargeState.fieldErrors?.amount)}
              errorMessage={chargeState.fieldErrors?.amount?.[0]}
            >
              <Input
                name="amount"
                inputMode="numeric"
                value={chargeAmount}
                onChange={(event) => setChargeAmount(event.target.value)}
              />
            </FormItem>
            <Alert state={chargeState} />
            <Button type="submit" variant="solid" loading={chargePending} block>
              پرداخت و شارژ کیف پول
            </Button>
          </Form>
        </div>
      </Dialog>

      <Dialog
        isOpen={snappOpen}
        width={560}
        contentClassName={dialogContentClass}
        onClose={() => setSnappOpen(false)}
        onRequestClose={() => setSnappOpen(false)}
      >
        <div className="space-y-4">
          <div className="pe-8">
            <h4 className="text-base font-bold">شارژ قسطی با اسنپ‌پی</h4>
            <p className="mt-1 text-sm leading-6 text-gray-500">
              مبلغ شارژ را وارد کنید تا پس از تایید، به درگاه قسطی اسنپ‌پی هدایت
              شوید
            </p>
          </div>

          <div className="rounded-lg bg-gray-50 p-3 text-sm leading-6 text-gray-600 dark:bg-gray-900/40 dark:text-gray-300">
            توجه: مبلغ پرداختی با اسنپ‌پی فقط برای استفاده در خدمات دادلاین است،
            به موجودی غیرقابل برداشت اضافه می‌شود و امکان تسویه یا برداشت آن وجود
            ندارد.
          </div>

          {!canUseSnappPay && (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm leading-6 text-amber-800 dark:bg-amber-900/30 dark:text-amber-100">
              <span>
                برای شارژ قسطی با اسنپ‌پی، ابتدا احراز هویت سطح ۲ را تکمیل کنید.
              </span>
              <Button
                type="button"
                size="xs"
                onClick={() => router.push("/pishkhan/profile/verification")}
              >
                احراز هویت
              </Button>
            </div>
          )}

          <Form action={snappAction} className="space-y-3">
            <input type="hidden" name="gateway" value="snapp_pay" />
            <FormItem
              label="مبلغ شارژ قسطی"
              invalid={Boolean(snappState.fieldErrors?.amount)}
              errorMessage={snappState.fieldErrors?.amount?.[0]}
            >
              <Input
                name="amount"
                inputMode="numeric"
                value={snappAmount}
                disabled={!canUseSnappPay}
                onChange={(event) => setSnappAmount(event.target.value)}
              />
            </FormItem>
            <Alert state={snappState} />
            <Button
              type="submit"
              variant="solid"
              loading={snappPending}
              disabled={!canUseSnappPay}
              block
            >
              ورود به درگاه اسنپ‌پی
            </Button>
          </Form>
        </div>
      </Dialog>

      <Dialog
        isOpen={withdrawOpen}
        width={520}
        contentClassName={dialogContentClass}
        onClose={() => setWithdrawOpen(false)}
        onRequestClose={() => setWithdrawOpen(false)}
      >
        <div className="space-y-4">
          <div className="pe-8">
            <h4 className="text-base font-bold">برداشت درآمد</h4>
            <p className="mt-1 text-sm leading-6 text-gray-500">
              {summary.hasActiveSubscription
                ? "اشتراک فعال دارید؛ درخواست شما برای پرداخت آنی ثبت می‌شود."
                : "درخواست عادی با وضعیت در انتظار ثبت می‌شود و انتهای ماه شمسی واریز خواهد شد."}
            </p>
          </div>

          <div className="grid gap-2 text-sm">
            <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-900/40">
              قابل برداشت: {formatMoney(summary.withdrawableBalance)}
            </div>
            <div className="flex min-w-0 items-center justify-between gap-2 rounded-lg bg-gray-50 p-3 dark:bg-gray-900/40">
              <span className="min-w-0 break-words">
                شبا:{" "}
                {hasVerifiedIban
                  ? summary.iban
                  : summary.iban
                    ? "در انتظار تایید"
                    : "ثبت نشده"}
              </span>
              <Button
                type="button"
                size="xs"
                shape="circle"
                icon={<TbEdit />}
                aria-label={
                  summary.iban ? "بروزرسانی شماره شبا" : "ثبت شماره شبا"
                }
                onClick={() => router.push("/pishkhan/profile")}
              />
            </div>
          </div>

          {!canWithdraw && (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm leading-6 text-amber-800 dark:bg-amber-900/30 dark:text-amber-100">
              <span>
                {!summary.isLevelTwoVerified
                  ? "برای برداشت، احراز هویت سطح ۲ را تکمیل کنید."
                  : !summary.iban
                    ? "برای برداشت، شماره شبا را در پروفایل ثبت کنید."
                    : !summary.bankVerified
                      ? "برای برداشت، شماره شبا باید تایید شده باشد."
                      : "موجودی قابل برداشت کافی نیست."}
              </span>
              {!summary.isLevelTwoVerified && (
                <Button
                  type="button"
                  size="xs"
                  onClick={() => router.push("/pishkhan/profile/verification")}
                >
                  احراز هویت
                </Button>
              )}
            </div>
          )}

          <Form action={withdrawAction} className="space-y-3">
            <FormItem
              label="مبلغ برداشت"
              invalid={Boolean(withdrawState.fieldErrors?.amount)}
              errorMessage={withdrawState.fieldErrors?.amount?.[0]}
            >
              <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
                <Input
                  name="amount"
                  inputMode="numeric"
                  placeholder="مثلاً ۵۰۰۰۰۰"
                  value={withdrawAmount}
                  disabled={!canWithdraw}
                  onChange={(event) => setWithdrawAmount(event.target.value)}
                />
                <Button
                  type="button"
                  disabled={!canWithdraw}
                  onClick={() =>
                    setWithdrawAmount(String(summary.withdrawableBalance))
                  }
                >
                  کل موجودی
                </Button>
              </div>
            </FormItem>
            <div className="grid gap-2 text-sm sm:grid-cols-2">
              <div className="rounded-lg bg-gray-50 p-3 leading-6 text-gray-600 dark:bg-gray-900/40 dark:text-gray-300">
                کارمزد تسویه: {formatMoney(settlementFee)}
              </div>
              <div className="rounded-lg bg-emerald-50 p-3 leading-6 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-100">
                مبلغ واریزی نهایی: {formatMoney(settlementPayableAmount)}
              </div>
            </div>
            <Alert state={withdrawState} />
            <Button
              type="submit"
              variant="solid"
              loading={withdrawPending}
              disabled={!canWithdraw}
              block
            >
              ثبت درخواست برداشت
            </Button>
          </Form>
        </div>
      </Dialog>

      <Dialog
        isOpen={settlementsOpen}
        width={680}
        contentClassName={dialogContentClass}
        onClose={() => setSettlementsOpen(false)}
        onRequestClose={() => setSettlementsOpen(false)}
      >
        <div className="space-y-4">
          <div className="pe-8">
            <h4 className="text-base font-bold">تسویه حساب‌ها</h4>
            <p className="mt-1 text-sm text-gray-500">
              آخرین درخواست‌های برداشت و وضعیت پردازش آن‌ها
            </p>
          </div>
          <div className="max-h-[60vh] space-y-2 overflow-y-auto pe-1">
            {settlements.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-200 p-5 text-center text-sm text-gray-500 dark:border-gray-700">
                هنوز درخواست تسویه‌ای ثبت نشده است.
              </div>
            ) : (
              settlements.map((settlement) => (
                <div
                  key={settlement.id}
                  className="min-w-0 rounded-lg border border-gray-200 p-3 dark:border-gray-700"
                >
                  <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      <span className="font-semibold">
                        {formatMoney(settlement.totalPayable)}
                      </span>
                      {settlement.receiptLink && (
                        <Button
                          size="xs"
                          type="button"
                          onClick={() =>
                            window.open(
                              settlement.receiptLink!,
                              "_blank",
                              "noreferrer",
                            )
                          }
                        >
                          مشاهده رسید
                        </Button>
                      )}
                    </div>
                    <WalletStatusTag
                      status={settlement.status}
                      label={settlement.statusLabel}
                    />
                  </div>
                  <div className="mt-2 grid min-w-0 gap-2 text-xs text-gray-500 sm:grid-cols-2">
                    <span className="break-words">شبا: {settlement.iban}</span>
                    <span className="break-words">
                      تاریخ: {formatPersianDate(settlement.createdAt)}
                    </span>
                    <span className="break-words">
                      کد رهگیری: {settlement.trackId ?? "-"}
                    </span>
                    <span className="break-words">
                      واریز: {formatPersianDate(settlement.paidAt)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </Dialog>

      <Dialog
        isOpen={giftOpen}
        width={560}
        contentClassName={dialogContentClass}
        onClose={() => setGiftOpen(false)}
        onRequestClose={() => setGiftOpen(false)}
      >
        <div className="space-y-4">
          <div className="pe-8">
            <h4 className="text-base font-bold">
              {giftDialog === "redeem" ? "ثبت کارت هدیه" : "مدیریت کارت هدیه"}
            </h4>
            {giftDialog === "manage" && (
              <p className="mt-1 text-sm leading-6 text-gray-500">
                کارت‌های ساخته‌شده را ببینید یا کارت جدید بسازید. مبلغ کسرشده از
                کیف پول برابر مبلغ کارت ضربدر تعداد مجاز استفاده است.
              </p>
            )}
          </div>

          {giftDialog === "redeem" ? (
            <Form action={redeemAction} className="space-y-3">
              <FormItem
                label="کد هدیه"
                invalid={Boolean(redeemState.fieldErrors?.code)}
                errorMessage={redeemState.fieldErrors?.code?.[0]}
              >
                <Input name="code" dir="ltr" placeholder="DAD-XXXXXXXXXX" />
              </FormItem>
              <Alert state={redeemState} />
              <Button
                type="submit"
                variant="solid"
                loading={redeemPending}
                block
              >
                ثبت کد هدیه
              </Button>
            </Form>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  active={giftMode === "list"}
                  onClick={() => setGiftMode("list")}
                >
                  لیست کارت‌ها
                </Button>
                <Button
                  type="button"
                  active={giftMode === "create"}
                  onClick={() => setGiftMode("create")}
                >
                  ساخت کارت جدید
                </Button>
              </div>

              {giftMode === "list" ? (
                <div className="max-h-[52vh] space-y-2 overflow-y-auto pe-1">
                  {giftCards.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-gray-200 p-5 text-center text-sm text-gray-500 dark:border-gray-700">
                      هنوز کارت هدیه‌ای نساخته‌اید.
                    </div>
                  ) : (
                    giftCards.map((giftCard) => (
                      <div
                        key={giftCard.id}
                        className="min-w-0 rounded-lg border border-gray-200 p-3 dark:border-gray-700"
                      >
                        <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-2">
                            <span className="min-w-0 truncate font-mono text-sm font-bold text-gray-900 dark:text-gray-100">
                              {giftCard.code}
                            </span>
                            <Button
                              type="button"
                              size="xs"
                              shape="circle"
                              icon={<TbCopy />}
                              aria-label="کپی کد کارت هدیه"
                              onClick={() => copyGiftCode(giftCard.code)}
                            />
                            {copiedGiftCode === giftCard.code && (
                              <span className="text-xs text-emerald-600">
                                کپی شد
                              </span>
                            )}
                          </div>
                          <span className="text-sm font-semibold">
                            {formatMoney(giftCard.amount)}
                          </span>
                        </div>
                        <div className="mt-2 grid min-w-0 gap-2 text-xs text-gray-500 sm:grid-cols-2">
                          <span className="break-words">
                            استفاده شده: {giftCard.redeemedCount} از{" "}
                            {giftCard.redemptionLimit}
                          </span>
                          <span className="break-words">
                            سقف هزینه:{" "}
                            {formatMoney(
                              giftCard.amount * giftCard.redemptionLimit,
                            )}
                          </span>
                          <span className="break-words">
                            ایجاد: {formatPersianDate(giftCard.createdAt)}
                          </span>
                          <span className="break-words">
                            انقضا: {formatPersianDate(giftCard.expiresAt)}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <Form action={createAction} className="space-y-3">
                  <FormItem
                    label="کد کارت هدیه"
                    invalid={Boolean(createState.fieldErrors?.giftCode)}
                    errorMessage={createState.fieldErrors?.giftCode?.[0]}
                  >
                    <Input
                      name="giftCode"
                      dir="ltr"
                      value={giftCode}
                      placeholder="DAD-XXXXXXXX"
                      onChange={(event) => setGiftCode(event.target.value)}
                      suffix={
                        <button
                          type="button"
                          className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-primary transition-colors hover:bg-primary/10"
                          aria-label="ساخت کد پیشنهادی"
                          onClick={() => setGiftCode(makeSuggestedGiftCode())}
                        >
                          <TbSparkles />
                        </button>
                      }
                    />
                  </FormItem>
                  <FormItem
                    label="مبلغ کارت"
                    invalid={Boolean(createState.fieldErrors?.amount)}
                    errorMessage={createState.fieldErrors?.amount?.[0]}
                  >
                    <Input
                      name="amount"
                      inputMode="numeric"
                      value={giftAmount}
                      placeholder="مثلاً ۲۰۰۰۰۰"
                      onChange={(event) => setGiftAmount(event.target.value)}
                    />
                  </FormItem>
                  <FormItem
                    label="تعداد مجاز استفاده"
                    invalid={Boolean(createState.fieldErrors?.redemptionLimit)}
                    errorMessage={createState.fieldErrors?.redemptionLimit?.[0]}
                  >
                    <Input
                      name="redemptionLimit"
                      inputMode="numeric"
                      value={giftRedemptionLimit}
                      onChange={(event) =>
                        setGiftRedemptionLimit(event.target.value)
                      }
                    />
                  </FormItem>
                  <FormItem
                    label="تاریخ انقضا"
                    invalid={Boolean(createState.fieldErrors?.expiresAt)}
                    errorMessage={createState.fieldErrors?.expiresAt?.[0]}
                  >
                    <input
                      type="hidden"
                      name="expiresAt"
                      value={
                        giftExpiresAt
                          ? dayjs(giftExpiresAt).format("YYYY-MM-DD")
                          : ""
                      }
                    />
                    <DatePicker
                      inputFormat="jYYYY/jMM/jDD"
                      inputPrefix={<TbCalendarStats />}
                      placeholder="انتخاب تاریخ انقضا"
                      value={giftExpiresAt}
                      minDate={new Date()}
                      onChange={setGiftExpiresAt}
                    />
                  </FormItem>
                  <Alert state={createState} />
                  <div className="rounded-lg bg-gray-50 p-3 text-sm leading-6 text-gray-600 dark:bg-gray-900/40 dark:text-gray-300">
                    مبلغ کسر از کیف پول: {formatMoney(giftTotal || 0)}
                  </div>
                  {createState.giftCode && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-center font-mono text-lg font-bold tracking-wider text-emerald-800 dark:border-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-100">
                      {createState.giftCode}
                    </div>
                  )}
                  <Button
                    type="submit"
                    variant="solid"
                    loading={createPending}
                    block
                  >
                    ساخت کارت هدیه
                  </Button>
                </Form>
              )}
            </>
          )}
        </div>
      </Dialog>
    </section>
  )
}

export default WalletSidebar
