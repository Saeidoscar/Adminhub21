"use client"

import Button from "@/components/ui/Button"
import Dialog from "@/components/ui/Dialog"
import Input from "@/components/ui/Input"
import Switcher from "@/components/ui/Switcher"
import { Form, FormItem } from "@/components/ui/Form"
import {
  buySmsPackage,
  updateNotificationSettings,
} from "@/server/actions/notifications/mutateNotificationSettings"
import type {
  NotificationMutationState,
  NotificationSettings,
} from "@/server/actions/notifications/notificationSettings.schemas"
import { useRouter } from "next/navigation"
import { useActionState, useEffect, useState } from "react"
import type { ReactNode } from "react"
import {
  TbBell,
  TbBrandTelegram,
  TbDeviceMobileMessage,
  TbMail,
  TbMessage2Bolt,
  TbRobot,
  TbWallet,
} from "react-icons/tb"

type Props = {
  settings: NotificationSettings
}

type ChannelKey = "smsEnabled" | "botEnabled" | "baleEnabled" | "eitaaEnabled" | "pushEnabled" | "emailEnabled"

type ChannelState = Record<ChannelKey, boolean>

const initialState: NotificationMutationState = {
  status: "idle",
  message: null,
}

const moneyFormatter = new Intl.NumberFormat("fa-IR")

const formatMoney = (value: number) => `${moneyFormatter.format(value)} تومان`

const formatNumber = (value: number) => moneyFormatter.format(value)

const channelCards: Array<{
  key: ChannelKey
  title: string
  detail: string
  icon: ReactNode
  tone: string
  botUrl?: string
}> = [
  {
    key: "botEnabled",
    title: "تلگرام",
    detail: "ارسال از طریق ربات و شناسه تلگرام ثبت‌شده.",
    icon: <TbBrandTelegram />,
    tone: "text-sky-600 bg-sky-50 dark:bg-sky-900/30 dark:text-sky-100",
    botUrl: "https://t.me/DadLineNetBOT",
  },
  {
    key: "baleEnabled",
    title: "بله",
    detail: "OTP با موبایل؛ اعلان‌های رباتی با شناسه بله.",
    icon: <TbMessage2Bolt />,
    tone: "text-violet-600 bg-violet-50 dark:bg-violet-900/30 dark:text-violet-100",
    botUrl: "https://ble.ir/dadlinebot",
  },
  {
    key: "eitaaEnabled",
    title: "ایتا",
    detail: "اعلان‌های رباتی برای کاربران متصل به ایتا.",
    icon: <TbRobot />,
    tone: "text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-100",
    botUrl: "https://eitaa.com/dadline_app",
  },
  {
    key: "smsEnabled",
    title: "پیامک",
    detail: "اعلان‌های عادی وابسته به سهمیه؛ پیام‌های حیاتی همیشه ارسال می‌شوند.",
    icon: <TbDeviceMobileMessage />,
    tone: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-100",
  },
  {
    key: "pushEnabled",
    title: "وب پوش",
    detail: "اعلان مرورگر و اپ برای رخدادهای قابل پیگیری.",
    icon: <TbBell />,
    tone: "text-cyan-600 bg-cyan-50 dark:bg-cyan-900/30 dark:text-cyan-100",
  },
  {
    key: "emailEnabled",
    title: "ایمیل",
    detail: "نسخه قابل آرشیو اعلان‌های مهم و گزارش‌ها.",
    icon: <TbMail />,
    tone: "text-rose-600 bg-rose-50 dark:bg-rose-900/30 dark:text-rose-100",
  },
]

function Alert({ state }: { state: NotificationMutationState }) {
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

const NotificationSettingsClient = ({ settings }: Props) => {
  const router = useRouter()
  const [smsDialogOpen, setSmsDialogOpen] = useState(false)
  const [selectedUnits, setSelectedUnits] = useState(
    settings.sms.packages[0]?.units ?? 50,
  )
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(
    Boolean(
      settings.preferences.quietHoursStart &&
        settings.preferences.quietHoursEnd,
    ),
  )
  const [quietHoursStart, setQuietHoursStart] = useState(
    settings.preferences.quietHoursStart ?? "23:00",
  )
  const [quietHoursEnd, setQuietHoursEnd] = useState(
    settings.preferences.quietHoursEnd ?? "08:00",
  )
  const [channels, setChannels] = useState<ChannelState>({
    smsEnabled: settings.preferences.smsEnabled,
    botEnabled: settings.preferences.botEnabled,
    baleEnabled: settings.preferences.baleEnabled,
    eitaaEnabled: settings.preferences.eitaaEnabled,
    pushEnabled: settings.preferences.pushEnabled,
    emailEnabled: settings.preferences.emailEnabled,
  })
  const [saveState, saveAction, savePending] = useActionState(
    updateNotificationSettings,
    initialState,
  )
  const [purchaseState, purchaseAction, purchasePending] = useActionState(
    buySmsPackage,
    initialState,
  )

  const selectedPackage = settings.sms.packages.find(
    (item) => item.units === selectedUnits,
  )
  const walletShortage = selectedPackage
    ? Math.max(selectedPackage.price - settings.wallet.balance, 0)
    : 0

  useEffect(() => {
    if (saveState.status === "success" || purchaseState.status === "success") {
      router.refresh()
    }
  }, [purchaseState.status, router, saveState.status])

  useEffect(() => {
    if (purchaseState.status === "success") {
      setSmsDialogOpen(false)
    }
  }, [purchaseState.status])

  const setChannel = (key: ChannelKey, checked: boolean) => {
    setChannels((current) => ({ ...current, [key]: checked }))
  }

  return (
    <div className="space-y-5">
      <div className="grid min-w-0 gap-3 lg:grid-cols-[260px_minmax(0,1fr)]">
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between gap-3">
            <span className="rounded-lg bg-emerald-50 p-2 text-lg text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-100">
              <TbDeviceMobileMessage />
            </span>
            <span className="text-xs text-gray-500">سهمیه پیامک</span>
          </div>
          <div className="mt-3 text-2xl font-bold text-gray-900 dark:text-gray-100">
            {formatNumber(settings.preferences.smsBalance)}
          </div>
          <Button
            className="mt-3"
            size="xs"
            variant="solid"
            block
            icon={<TbWallet />}
            onClick={() => setSmsDialogOpen(true)}
          >
            خرید بسته
          </Button>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="grid min-w-0 gap-3 md:grid-cols-[minmax(140px,1fr)_160px_160px] md:items-end">
            <div className="flex min-w-0 items-center justify-between gap-3 md:block">
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  ساعت سکوت
                </h3>
                <p className="mt-1 text-xs leading-5 text-gray-500">
                  توقف اعلان‌های غیرحیاتی
                </p>
              </div>
              <Switcher
                className="md:mt-3"
                checked={quietHoursEnabled}
                onChange={setQuietHoursEnabled}
              />
            </div>
            <FormItem label="شروع">
              <Input
                type="time"
                value={quietHoursStart}
                disabled={!quietHoursEnabled}
                onChange={(event) => setQuietHoursStart(event.target.value)}
              />
            </FormItem>
            <FormItem label="پایان">
              <Input
                type="time"
                value={quietHoursEnd}
                disabled={!quietHoursEnabled}
                onChange={(event) => setQuietHoursEnd(event.target.value)}
              />
            </FormItem>
          </div>
        </div>
      </div>

      <Form action={saveAction} className="space-y-4">
        {Object.entries(channels).map(([key, value]) => (
          <input key={key} type="hidden" name={key} value={String(value)} />
        ))}
        <input
          type="hidden"
          name="quietHoursEnabled"
          value={String(quietHoursEnabled)}
        />
        <input type="hidden" name="quietHoursStart" value={quietHoursStart} />
        <input type="hidden" name="quietHoursEnd" value={quietHoursEnd} />

        <div className="grid min-w-0 gap-3 md:grid-cols-3">
          {channelCards.map((channel) => (
            <div
              key={channel.key}
              className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="flex min-w-0 items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <span
                    className={`mt-1 rounded-lg p-2 text-lg ${channel.tone}`}
                  >
                    {channel.icon}
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                      {channel.title}
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-gray-500">
                      {channel.detail}
                    </p>
                    {channel.botUrl && (
                      <a
                        className="mt-2 inline-flex text-xs font-semibold text-primary hover:text-primary-mild"
                        href={channel.botUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        ورود به ربات
                      </a>
                    )}
                  </div>
                </div>
                <Switcher
                  checked={channels[channel.key]}
                  onChange={(checked) => setChannel(channel.key, checked)}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 pt-3 sm:flex-row sm:items-center sm:justify-between">
          <Alert state={saveState} />
          <Button
            className="sm:min-w-40"
            type="submit"
            variant="solid"
            loading={savePending}
            icon={<TbBell />}
          >
            ذخیره تنظیمات
          </Button>
        </div>
      </Form>

      <Dialog
        isOpen={smsDialogOpen}
        width={760}
        contentClassName="h-auto max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain"
        onClose={() => setSmsDialogOpen(false)}
        onRequestClose={() => setSmsDialogOpen(false)}
      >
        <div className="space-y-4">
          <div className="pe-8">
            <h4 className="text-base font-bold">خرید بسته پیامکی</h4>
            <p className="mt-1 text-sm leading-6 text-gray-500">
              پرداخت بسته‌ها فقط از کیف پول انجام می‌شود.
            </p>
          </div>

          <div className="grid gap-2 rounded-lg bg-gray-50 p-3 text-sm text-gray-600 dark:bg-gray-900/40 dark:text-gray-300 sm:grid-cols-3">
            <span>
              قیمت پایه هر پیامک: {formatMoney(settings.sms.feePerSms)}
            </span>
            <span>موجودی کیف پول: {formatMoney(settings.wallet.balance)}</span>
            <span>
              سهمیه فعلی: {formatNumber(settings.preferences.smsBalance)}
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {settings.sms.packages.map((item) => (
              <button
                key={item.units}
                type="button"
                className={`min-h-32 rounded-lg border p-4 text-start transition ${
                  selectedUnits === item.units
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-gray-200 bg-white hover:border-primary dark:border-gray-700 dark:bg-gray-800"
                }`}
                onClick={() => setSelectedUnits(item.units)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      {formatNumber(item.units)} پیامک
                    </div>
                    <div className="mt-1 text-sm font-semibold text-primary">
                      {formatMoney(item.price)}
                    </div>
                  </div>
                  <span className="rounded-lg bg-gray-100 px-2 py-1 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-100">
                    {item.discountPercent === 0
                      ? "بدون تخفیف"
                      : `${formatNumber(item.discountPercent)}٪`}
                  </span>
                </div>
                <div className="mt-3 text-xs leading-5 text-gray-500">
                  {item.discountPercent > 0
                    ? `قیمت قبل از تخفیف: ${formatMoney(item.originalPrice)}`
                    : `هر پیامک: ${formatMoney(item.unitPrice)}`}
                </div>
              </button>
            ))}
          </div>

          {walletShortage > 0 && (
            <div className="flex flex-col gap-3 rounded-lg bg-amber-50 px-3 py-3 text-sm leading-6 text-amber-800 dark:bg-amber-900/30 dark:text-amber-100 sm:flex-row sm:items-center sm:justify-between">
              <span>
                کسری کیف پول برای این بسته: {formatMoney(walletShortage)}
              </span>
              <Button
                size="xs"
                icon={<TbWallet />}
                onClick={() => router.push("/pishkhan/wallet")}
              >
                شارژ کیف پول
              </Button>
            </div>
          )}

          <Form action={purchaseAction} className="space-y-3">
            <input type="hidden" name="units" value={selectedUnits} />
            <Alert state={purchaseState} />
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
              <Button type="button" onClick={() => setSmsDialogOpen(false)}>
                انصراف
              </Button>
              <Button
                type="submit"
                variant="solid"
                loading={purchasePending}
                disabled={walletShortage > 0 || !selectedPackage}
                icon={<TbWallet />}
              >
                پرداخت از کیف پول
              </Button>
            </div>
          </Form>
        </div>
      </Dialog>
    </div>
  )
}

export default NotificationSettingsClient
