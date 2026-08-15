"use client"

import type { TicketMeta } from "@/@types/tickets"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import { createTicket } from "@/server/actions/tickets/mutateTickets"
import { useRouter } from "next/navigation"
import { type FormEvent, useRef, useState, useTransition } from "react"
import { TbFileUpload, TbSend, TbX } from "react-icons/tb"

type Props = {
  meta: TicketMeta
  onCreated?: () => void
  compact?: boolean
}

const selectClass =
  "h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm text-gray-700 outline-none transition focus:border-primary focus:ring-1 focus:ring-primary dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"

const TicketCreateForm = ({ meta, onCreated, compact = false }: Props) => {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    const form = event.currentTarget
    const formData = new FormData(form)

    startTransition(async () => {
      const result = await createTicket(formData)
      if (!result.ok || !result.data) {
        setError(result.error)
        return
      }

      form.reset()
      setFileName(null)
      onCreated?.()
      router.push(`/pishkhan/tickets/${result.data.uuid}`)
      router.refresh()
    })
  }

  return (
    <form className="space-y-5" onSubmit={submit}>
      <div className={compact ? "grid gap-4" : "grid gap-4 md:grid-cols-2"}>
        <label className={compact ? "" : "md:col-span-2"}>
          <span className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200">
            عنوان تیکت
          </span>
          <Input
            name="title"
            required
            minLength={5}
            maxLength={150}
            placeholder="موضوع درخواست را کوتاه و دقیق بنویسید"
          />
        </label>

        <label>
          <span className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200">
            دپارتمان
          </span>
          <select
            name="department"
            defaultValue={meta.defaults.department}
            className={selectClass}
          >
            {meta.departments.map((department) => (
              <option key={department.slug} value={department.slug}>
                {department.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200">
            اولویت
          </span>
          <select
            name="priority"
            defaultValue={meta.defaults.priority}
            className={selectClass}
          >
            {Object.entries(meta.priorities).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200">
          شرح درخواست
        </span>
        <Input
          name="body"
          textArea
          rows={compact ? 6 : 8}
          required
          minLength={10}
          maxLength={10000}
          placeholder="جزئیات لازم، شماره پیگیری یا توضیح مسئله را کامل وارد کنید..."
        />
      </label>

      <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50/70 p-4 dark:border-gray-700 dark:bg-gray-900/50">
        <input
          ref={fileRef}
          name="file"
          type="file"
          className="hidden"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.webp,.zip,.rar,.txt"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file && file.size > 10 * 1024 * 1024) {
              event.target.value = ""
              setFileName(null)
              setError("حجم فایل نباید بیشتر از ۱۰ مگابایت باشد.")
              return
            }
            setError(null)
            setFileName(file?.name ?? null)
          }}
        />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 font-semibold text-gray-700 dark:text-gray-200">
              <TbFileUpload className="text-xl text-primary" />
              فایل پیوست اختیاری
            </div>
            <p className="mt-1 text-xs leading-6 text-gray-500">
              تصویر، PDF، فایل آفیس یا ZIP تا سقف ۱۰ مگابایت
            </p>
          </div>
          <div className="flex items-center gap-2">
            {fileName && (
              <button
                type="button"
                aria-label="حذف فایل"
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800"
                onClick={() => {
                  if (fileRef.current) fileRef.current.value = ""
                  setFileName(null)
                }}
              >
                <TbX />
              </button>
            )}
            <Button
              type="button"
              size="sm"
              onClick={() => fileRef.current?.click()}
            >
              {fileName ? "تغییر فایل" : "انتخاب فایل"}
            </Button>
          </div>
        </div>
        {fileName && (
          <p className="mt-3 truncate rounded-lg bg-white px-3 py-2 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300">
            {fileName}
          </p>
        )}
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </div>
      )}

      <div className="flex justify-end">
        <Button
          type="submit"
          variant="solid"
          loading={pending}
          icon={<TbSend />}
        >
          ثبت و ارسال تیکت
        </Button>
      </div>
    </form>
  )
}

export default TicketCreateForm
