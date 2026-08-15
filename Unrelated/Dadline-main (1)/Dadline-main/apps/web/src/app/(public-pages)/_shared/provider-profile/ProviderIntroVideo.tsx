"use client"

import { useEffect, useState } from "react"
import { TbPlayerPlayFilled, TbX } from "react-icons/tb"

export const ProviderIntroVideo = ({
  videoUrl,
  providerName,
}: {
  videoUrl: string
  providerName: string
}) => {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }
    document.addEventListener("keydown", closeOnEscape)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", closeOnEscape)
      document.body.style.overflow = ""
    }
  }, [open])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="h-10 w-10 flex items-center justify-center rounded-full border-4 border-white bg-primary text-white shadow-lg dark:border-gray-950"
        aria-label={`پخش ویدیوی معرفی ${providerName}`}
      >
        <span className="items-center justify-center rounded-full shadow-xl transition group-hover:scale-110 dark:border-gray-950">
          <TbPlayerPlayFilled size={22} />
        </span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-gray-950/85 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={`ویدیوی معرفی ${providerName}`}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false)
          }}
        >
          <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-black shadow-2xl">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute left-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black"
              aria-label="بستن ویدیو"
            >
              <TbX size={22} />
            </button>
            <video
              key={videoUrl}
              src={videoUrl}
              controls
              autoPlay
              playsInline
              preload="metadata"
              className="max-h-[80vh] w-full bg-black"
            >
              مرورگر شما امکان پخش ویدیو را ندارد.
            </video>
          </div>
        </div>
      )}
    </>
  )
}
