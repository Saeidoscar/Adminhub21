"use client"

import Dialog from "@/components/ui/Dialog"
import { createShortLink } from "@/server/actions/short-links/createShortLink"
import { useState, type ReactNode } from "react"
import {
  TbBrandInstagram,
  TbBrandTelegram,
  TbBrandWhatsapp,
  TbBrandX,
  TbCheck,
  TbCopy,
  TbMail,
  TbMessage,
  TbShare3,
} from "react-icons/tb"

export type ShareButtonProps = {
  shortCode?: string
  title?: string
  text?: string
  label?: string
  className?: string
}

type ShareStatus = {
  type: "success" | "error"
  message: string
} | null

const shortCodePattern = /^[A-Za-z0-9]{1,10}$/

export default function ShareButton({
  shortCode,
  title,
  text,
  label = "اشتراک‌گذاری",
  className,
}: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isResolving, setIsResolving] = useState(false)
  const [shortUrl, setShortUrl] = useState("")
  const [resolvedSource, setResolvedSource] = useState("")
  const [copied, setCopied] = useState(false)

  const pageTitle =
    title || (typeof document !== "undefined" ? document.title : "دادلاین")
  const shareText = text || pageTitle

  const openDialog = () => {
    setIsOpen(true)
    void ensureShortUrl()
  }

  const ensureShortUrl = async () => {
    if (typeof window === "undefined" || isResolving) return

    if (shortCode) {
      if (!shortCodePattern.test(shortCode)) {
        setShortUrl("")
        setResolvedSource("")
        return
      }

      const source = `code:${shortCode}`
      if (resolvedSource !== source) {
        setShortUrl(
          `${window.location.origin}/go/${encodeURIComponent(shortCode)}`,
        )
        setResolvedSource(source)
      }
      return
    }

    const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`
    if (shortUrl && resolvedSource === currentPath) return

    setIsResolving(true)
    setShortUrl("")
    setResolvedSource("")

    const result = await createShortLink(currentPath)

    if (result.shortCode) {
      setShortUrl(
        `${window.location.origin}/go/${encodeURIComponent(result.shortCode)}`,
      )
      setResolvedSource(currentPath)
    }

    setIsResolving(false)
  }

  const copyLink = async (message = "لینک کوتاه کپی شد.") => {
    if (!shortUrl) return false

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shortUrl)
      } else {
        const textarea = document.createElement("textarea")
        textarea.value = shortUrl
        textarea.style.position = "fixed"
        textarea.style.opacity = "0"
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand("copy")
        textarea.remove()
      }

      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
      return true
    } catch {
      return false
    }
  }

  const nativeShare = async (target?: string) => {
    if (!shortUrl) return

    if (navigator.share) {
      try {
        await navigator.share({
          title: pageTitle,
          text: shareText,
          url: shortUrl,
        })
        return
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return
        }
      }
    }

    await copyLink(
      target
        ? `لینک کپی شد؛ آن را در ${target} ارسال کنید.`
        : "لینک برای اشتراک‌گذاری کپی شد.",
    )
  }

  const openDirectTarget = (href: string) => {
    if (href.startsWith("mailto:") || href.startsWith("sms:")) {
      window.location.href = href
      return
    }

    window.open(href, "_blank", "noopener,noreferrer")
  }

  const encodedUrl = encodeURIComponent(shortUrl)
  const encodedText = encodeURIComponent(shareText)
  const encodedMessage = encodeURIComponent(`${shareText}\n${shortUrl}`)

  const directTargets = [
    {
      key: "sms",
      label: "پیامک",
      icon: <TbMessage aria-hidden size={24} />,
      color: "bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300",
      href: `sms:?body=${encodedMessage}`,
    },
    {
      key: "email",
      label: "ایمیل",
      icon: <TbMail aria-hidden size={24} />,
      color:
        "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
      href: `mailto:?subject=${encodeURIComponent(pageTitle)}&body=${encodedMessage}`,
    },
    {
      key: "telegram",
      label: "تلگرام",
      icon: <TbBrandTelegram aria-hidden size={24} />,
      color: "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-300",
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
    },
    {
      key: "whatsapp",
      label: "واتساپ",
      icon: <TbBrandWhatsapp aria-hidden size={24} />,
      color:
        "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
      href: `https://wa.me/?text=${encodedMessage}`,
    },
    {
      key: "x",
      label: "ایکس",
      icon: <TbBrandX aria-hidden size={24} />,
      color: "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100",
      href: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    },
    {
      key: "instagram",
      label: "اینستاگرام",
      icon: <TbBrandInstagram aria-hidden size={24} />,
      color:
        "bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-950/50 dark:text-fuchsia-300",
      href: "https://www.instagram.com/direct/inbox/",
    },
  ]

  const buttonClassName = [
    "inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:border-primary hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200",
    className,
  ]
    .filter(Boolean)
    .join(" ")

  return (
    <>
      <button type="button" className={buttonClassName} onClick={openDialog}>
        <TbShare3 aria-hidden size={18} />
        {label}
      </button>

      <Dialog
        isOpen={isOpen}
        width={580}
        onClose={() => setIsOpen(false)}
        onRequestClose={() => setIsOpen(false)}
        contentLabel="اشتراک‌گذاری لینک"
      >
        <div dir="rtl" className="p-1 sm:p-2">
          <div className="mb-5 pl-10">
            <h2 className="text-lg font-bold text-gray-950 dark:text-white">
              اشتراک‌گذاری
            </h2>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900/60">
            {isResolving ? (
              <div
                className="flex min-h-11 items-center justify-center gap-2 text-sm text-gray-500"
                aria-live="polite"
              >
                <span className="size-4 animate-spin rounded-full border-2 border-gray-300 border-t-primary" />
                در حال ساخت لینک کوتاه...
              </div>
            ) : shortUrl ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => void copyLink()}
                  className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  {copied ? (
                    <TbCheck aria-hidden size={18} />
                  ) : (
                    <TbCopy aria-hidden size={18} />
                  )}
                  <span className="hidden sm:inline">
                    {copied ? "کپی شد" : "کپی"}
                  </span>
                </button>
                <input
                  readOnly
                  dir="ltr"
                  value={shortUrl}
                  aria-label="لینک کوتاه"
                  onFocus={(event) => event.currentTarget.select()}
                  className="h-11 min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-3 text-left text-sm text-gray-800 outline-none focus:border-primary dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => void ensureShortUrl()}
                className="flex min-h-11 w-full items-center justify-center text-sm font-semibold text-primary"
              >
                تلاش دوباره برای ساخت لینک
              </button>
            )}
          </div>

          <div
            className={`mt-6 transition-opacity ${
              shortUrl ? "opacity-100" : "pointer-events-none opacity-40"
            }`}
            aria-disabled={!shortUrl}
          >
            <div className="grid grid-cols-3 gap-3">
              {directTargets.map((target) => (
                <ShareTargetButton
                  key={target.key}
                  label={target.label}
                  icon={target.icon}
                  color={target.color}
                  onClick={() => openDirectTarget(target.href)}
                />
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  برنامه‌های نصب‌شده
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  برنامه را از پنجره اشتراک‌گذاری دستگاه انتخاب کنید.
                </p>
              </div>
              <button
                type="button"
                onClick={() => void nativeShare()}
                className="shrink-0 rounded-xl border border-primary/30 px-3 py-2 text-xs font-semibold text-primary transition hover:bg-primary/5"
              >
                نمایش برنامه‌های بیشتر
              </button>
            </div>
          </div>
        </div>
      </Dialog>
    </>
  )
}

function ShareTargetButton({
  label,
  icon,
  color,
  onClick,
}: {
  label: string
  icon: ReactNode
  color: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex min-w-0 flex-col items-center gap-2 rounded-2xl border border-transparent p-2 text-xs font-medium text-gray-700 transition hover:border-gray-200 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:text-gray-200 dark:hover:border-gray-700 dark:hover:bg-gray-800"
    >
      <span
        className={`flex size-11 items-center justify-center rounded-2xl transition group-hover:scale-105 ${color}`}
      >
        {icon}
      </span>
      <span className="max-w-full truncate">{label}</span>
    </button>
  )
}
