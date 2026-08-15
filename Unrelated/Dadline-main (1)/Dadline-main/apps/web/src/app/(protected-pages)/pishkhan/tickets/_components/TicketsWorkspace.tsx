"use client"

import type { Ticket, TicketMeta, TicketPagination } from "@/@types/tickets"
import Button from "@/components/ui/Button"
import Dialog from "@/components/ui/Dialog"
import Input from "@/components/ui/Input"
import {
  replyTicket,
  updateTicketStatus,
} from "@/server/actions/tickets/mutateTickets"
import classNames from "classnames"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import {
  type FormEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react"
import {
  TbAlertTriangle,
  TbArrowRight,
  TbBuilding,
  TbClock,
  TbFile,
  TbHeadset,
  TbLock,
  TbMessage2,
  TbPaperclip,
  TbPlus,
  TbSearch,
  TbSend,
  TbUserShield,
  TbX,
} from "react-icons/tb"
import TicketCreateForm from "./TicketCreateForm"
import {
  formatFileSize,
  formatTicketDate,
  priorityClasses,
  statusClasses,
  ticketListQuery,
} from "./ticket-ui"

type Props = {
  tickets: Ticket[]
  selectedTicket?: Ticket | null
  meta: TicketMeta
  pagination: TicketPagination
  error?: string | null
}

const selectClass =
  "h-10 min-w-0 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-600 outline-none focus:border-primary dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"

const TicketsWorkspace = ({
  tickets,
  selectedTicket,
  meta,
  pagination,
  error,
}: Props) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [createOpen, setCreateOpen] = useState(false)
  const [query, setQuery] = useState(searchParams.get("q") ?? "")

  const listQuery = useMemo(
    () =>
      ticketListQuery({
        q: searchParams.get("q") ?? undefined,
        status: searchParams.get("status") ?? undefined,
        priority: searchParams.get("priority") ?? undefined,
        department: searchParams.get("department") ?? undefined,
        page: Number(searchParams.get("page")) || 1,
      }),
    [searchParams],
  )

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (!value || value === "all") params.delete(key)
    else params.set(key, value)
    params.delete("page")
    const base = selectedTicket
      ? `/pishkhan/tickets/${selectedTicket.uuid}`
      : "/pishkhan/tickets"
    router.replace(`${base}?${params.toString()}`)
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="grid min-h-[calc(100vh-12.5rem)] md:grid-cols-[minmax(280px,360px)_minmax(0,1fr)]">
        <aside
          className={classNames(
            "min-w-0 border-gray-200 dark:border-gray-800 md:border-l",
            selectedTicket ? "hidden md:flex md:flex-col" : "flex flex-col",
          )}
        >
          <div className="border-b border-gray-200 p-4 dark:border-gray-800">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h1 className="text-xl font-black text-gray-900 dark:text-white">
                  تیکت‌های پشتیبانی
                </h1>
                <p className="mt-1 text-xs text-gray-500">
                  {pagination.total.toLocaleString("fa-IR")} درخواست ثبت‌شده
                </p>
              </div>
              <Button
                size="sm"
                variant="solid"
                icon={<TbPlus />}
                onClick={() => setCreateOpen(true)}
              >
                جدید
              </Button>
            </div>

            <form
              className="relative"
              onSubmit={(event) => {
                event.preventDefault()
                updateFilter("q", query.trim())
              }}
            >
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="جست‌وجوی عنوان یا متن..."
                suffix={<TbSearch className="text-lg" />}
              />
            </form>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <select
                aria-label="فیلتر وضعیت"
                className={selectClass}
                value={searchParams.get("status") ?? "all"}
                onChange={(event) => updateFilter("status", event.target.value)}
              >
                <option value="all">همه وضعیت‌ها</option>
                {Object.entries(meta.statuses).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <select
                aria-label="فیلتر دپارتمان"
                className={selectClass}
                value={searchParams.get("department") ?? "all"}
                onChange={(event) =>
                  updateFilter("department", event.target.value)
                }
              >
                <option value="all">همه واحدها</option>
                {meta.departments.map((department) => (
                  <option key={department.slug} value={department.slug}>
                    {department.label}
                  </option>
                ))}
              </select>
              <select
                aria-label="فیلتر اولویت"
                className={classNames(selectClass, "col-span-2")}
                value={searchParams.get("priority") ?? "all"}
                onChange={(event) =>
                  updateFilter("priority", event.target.value)
                }
              >
                <option value="all">همه اولویت‌ها</option>
                {Object.entries(meta.priorities).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div className="m-4 rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-200">
              {error}
            </div>
          )}

          <div className="flex-1 overflow-y-auto">
            {tickets.length === 0 ? (
              <EmptyTickets onCreate={() => setCreateOpen(true)} />
            ) : (
              tickets.map((ticket) => (
                <TicketListItem
                  key={ticket.uuid}
                  ticket={ticket}
                  selected={selectedTicket?.uuid === ticket.uuid}
                  query={listQuery}
                />
              ))
            )}
          </div>

          {pagination.lastPage > 1 && (
            <Pagination
              pagination={pagination}
              selectedTicket={selectedTicket}
            />
          )}
        </aside>

        <main
          className={classNames(
            "min-w-0",
            !selectedTicket && "hidden md:block",
          )}
        >
          {selectedTicket ? (
            <TicketConversation ticket={selectedTicket} listQuery={listQuery} />
          ) : (
            <ConversationPlaceholder onCreate={() => setCreateOpen(true)} />
          )}
        </main>
      </div>

      <Dialog
        isOpen={createOpen}
        width={720}
        onClose={() => setCreateOpen(false)}
        onRequestClose={() => setCreateOpen(false)}
        contentClassName="p-5 sm:p-7"
      >
        <div className="mb-6 pl-8">
          <h2 className="text-xl font-black text-gray-900 dark:text-white">
            ثبت تیکت جدید
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            موضوع را دقیق انتخاب کنید تا درخواست سریع‌تر به واحد مربوط برسد.
          </p>
        </div>
        <TicketCreateForm
          meta={meta}
          compact
          onCreated={() => setCreateOpen(false)}
        />
      </Dialog>
    </div>
  )
}

const TicketListItem = ({
  ticket,
  selected,
  query,
}: {
  ticket: Ticket
  selected: boolean
  query: string
}) => (
  <Link
    href={`/pishkhan/tickets/${ticket.uuid}${query ? `?${query}` : ""}`}
    className={classNames(
      "relative block border-b border-gray-100 p-4 transition dark:border-gray-800",
      selected
        ? "bg-primary/5 dark:bg-primary/10"
        : "hover:bg-gray-50 dark:hover:bg-gray-800/60",
    )}
  >
    {selected && (
      <span className="absolute inset-y-3 right-0 w-1 rounded-l-full bg-primary" />
    )}
    <div className="flex items-start gap-3">
      <div className="relative mt-0.5 flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gray-100 text-xl text-gray-500 dark:bg-gray-800 dark:text-gray-300">
        <TbMessage2 />
        {ticket.hasUnread && !selected && (
          <span className="absolute -left-0.5 -top-0.5 size-3 rounded-full border-2 border-white bg-primary dark:border-gray-900" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3
            className={classNames(
              "line-clamp-1 text-sm text-gray-800 dark:text-gray-100",
              ticket.hasUnread && !selected && "font-black",
            )}
          >
            {ticket.title}
          </h3>
          <span className="shrink-0 text-[11px] text-gray-400">
            {formatTicketDate(ticket.activityAt, false)}
          </span>
        </div>
        <p className="mt-1 line-clamp-2 min-h-10 text-xs leading-5 text-gray-500">
          {ticket.lastMessage?.body ?? "بدون پیام"}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
          <span
            className={classNames(
              "rounded-full px-2 py-1 ring-1 ring-inset",
              statusClasses[ticket.status],
            )}
          >
            {ticket.statusLabel}
          </span>
          <span
            className={classNames(
              "font-semibold",
              priorityClasses[ticket.priority],
            )}
          >
            {ticket.priorityLabel}
          </span>
          <span className="truncate text-gray-400">
            {ticket.department.label}
          </span>
        </div>
      </div>
    </div>
  </Link>
)

const TicketConversation = ({
  ticket,
  listQuery,
}: {
  ticket: Ticket
  listQuery: string
}) => {
  const router = useRouter()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: "end" })
  }, [ticket.uuid, ticket.messages?.length])

  const reply = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    setError(null)
    startTransition(async () => {
      const result = await replyTicket(ticket.uuid, formData)
      if (!result.ok) return setError(result.error)
      form.reset()
      setFileName(null)
      router.refresh()
    })
  }

  const toggleStatus = () => {
    setError(null)
    startTransition(async () => {
      const result = await updateTicketStatus(
        ticket.uuid,
        ticket.status === "closed" ? "open" : "closed",
      )
      if (!result.ok) return setError(result.error)
      router.refresh()
    })
  }

  return (
    <div className="flex h-[calc(100vh-12.5rem)] min-h-[620px] flex-col">
      <header className="border-b border-gray-200 px-4 py-4 dark:border-gray-800 sm:px-6">
        <div className="flex items-start gap-3">
          <Link
            href={`/pishkhan/tickets${listQuery ? `?${listQuery}` : ""}`}
            className="mt-0.5 rounded-xl p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 md:hidden"
            aria-label="بازگشت به فهرست"
          >
            <TbArrowRight className="text-xl" />
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-black text-gray-900 dark:text-white sm:text-lg">
                {ticket.title}
              </h2>
              <span className="rounded-full bg-gray-100 px-2 py-1 font-mono text-[10px] text-gray-500 dark:bg-gray-800">
                #{ticket.uuid.slice(0, 8)}
              </span>
              <span
                className={classNames(
                  "rounded-full px-2.5 py-1 text-xs ring-1 ring-inset",
                  statusClasses[ticket.status],
                )}
              >
                {ticket.statusLabel}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
              <span className="inline-flex items-center gap-1">
                <TbBuilding />
                {ticket.department.label}
              </span>
              <span
                className={classNames(
                  "inline-flex items-center gap-1 font-semibold",
                  priorityClasses[ticket.priority],
                )}
              >
                {ticket.priority === "urgent" && <TbAlertTriangle />}
                {ticket.priorityLabel}
              </span>
              <span className="inline-flex items-center gap-1">
                <TbClock />
                {formatTicketDate(ticket.createdAt)}
              </span>
            </div>
          </div>
          {ticket.permissions.canChangeStatus && (
            <Button size="sm" loading={pending} onClick={toggleStatus}>
              {ticket.status === "closed" ? "بازگشایی" : "بستن تیکت"}
            </Button>
          )}
        </div>
        {(ticket.assignedTo || ticket.provider) && (
          <div className="mt-4 flex flex-wrap gap-2">
            {ticket.assignedTo && (
              <PersonChip
                icon={<TbHeadset />}
                label="پشتیبان"
                name={ticket.assignedTo.name}
              />
            )}
            {ticket.provider && (
              <PersonChip
                icon={<TbUserShield />}
                label="وکیل/کارشناس"
                name={ticket.provider.name}
              />
            )}
          </div>
        )}
      </header>

      <section className="flex-1 overflow-y-auto bg-gray-50/70 px-3 py-5 dark:bg-gray-950/30 sm:px-6">
        <div className="mx-auto max-w-3xl space-y-4">
          {(ticket.messages ?? []).map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </section>

      <footer className="border-t border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900 sm:p-5">
        {error && (
          <p className="mx-auto mb-3 max-w-3xl rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-200">
            {error}
          </p>
        )}
        {ticket.status === "closed" ? (
          <div className="flex items-center justify-center gap-2 rounded-xl bg-gray-100 px-4 py-3 text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-300">
            <TbLock /> این تیکت بسته شده است. برای ادامه ابتدا آن را بازگشایی
            کنید.
          </div>
        ) : ticket.permissions.canReply ? (
          <form className="mx-auto max-w-3xl" onSubmit={reply}>
            <Input
              name="body"
              textArea
              rows={3}
              required
              maxLength={10000}
              placeholder="پاسخ خود را بنویسید..."
            />
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
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <TbPaperclip className="text-lg" />
                  {fileName ? "تغییر فایل" : "افزودن فایل"}
                </button>
                {fileName && (
                  <span className="mr-2 inline-flex max-w-52 items-center gap-1 truncate text-xs text-gray-500">
                    {fileName}
                    <button
                      type="button"
                      onClick={() => {
                        if (fileRef.current) fileRef.current.value = ""
                        setFileName(null)
                      }}
                    >
                      <TbX />
                    </button>
                  </span>
                )}
              </div>
              <Button
                type="submit"
                variant="solid"
                loading={pending}
                icon={<TbSend />}
              >
                ارسال پاسخ
              </Button>
            </div>
          </form>
        ) : null}
      </footer>
    </div>
  )
}

const MessageBubble = ({
  message,
}: {
  message: NonNullable<Ticket["messages"]>[number]
}) => {
  const support = message.actorType === "support"
  const provider = message.actorType === "provider"
  return (
    <div
      className={classNames(
        "flex",
        message.isMine ? "justify-start" : "justify-end",
      )}
    >
      <div
        className={classNames(
          "max-w-[88%] rounded-2xl px-4 py-3 shadow-sm sm:max-w-[75%]",
          message.isMine
            ? "rounded-tr-md bg-primary text-white"
            : support
              ? "rounded-tl-md border border-blue-100 bg-white text-gray-700 dark:border-blue-900 dark:bg-gray-800 dark:text-gray-100"
              : provider
                ? "rounded-tl-md border border-violet-100 bg-violet-50 text-gray-700 dark:border-violet-900 dark:bg-violet-950/30 dark:text-gray-100"
                : "rounded-tl-md bg-white text-gray-700 dark:bg-gray-800 dark:text-gray-100",
        )}
      >
        <div
          className={classNames(
            "mb-1 flex items-center gap-2 text-xs font-bold",
            message.isMine ? "text-white/80" : "text-gray-500",
          )}
        >
          {support ? (
            <TbHeadset />
          ) : provider ? (
            <TbUserShield />
          ) : (
            <TbMessage2 />
          )}
          {message.user.name}
          <span className="font-normal">{message.user.roleLabel}</span>
        </div>
        <p className="whitespace-pre-wrap text-sm leading-7">{message.body}</p>
        {message.attachment &&
          (message.attachment.url ? (
            <a
              href={message.attachment.url}
              target="_blank"
              rel="noreferrer"
              className={classNames(
                "mt-3 flex items-center gap-3 rounded-xl p-3 text-xs",
                message.isMine
                  ? "bg-white/10"
                  : "bg-gray-100 dark:bg-gray-900/70",
              )}
            >
              <TbFile className="shrink-0 text-xl" />
              <span className="min-w-0 flex-1 truncate">
                {message.attachment.name ?? "فایل پیوست"}
              </span>
              <span className="shrink-0 opacity-70">
                {formatFileSize(message.attachment.sizeBytes)}
              </span>
            </a>
          ) : (
            <div
              className={classNames(
                "mt-3 flex items-center gap-3 rounded-xl p-3 text-xs opacity-70",
                message.isMine
                  ? "bg-white/10"
                  : "bg-gray-100 dark:bg-gray-900/70",
              )}
            >
              <TbFile className="shrink-0 text-xl" />
              <span className="min-w-0 flex-1 truncate">
                {message.attachment.name ?? "فایل پیوست"}
              </span>
              <span>لینک فایل منقضی شده است</span>
            </div>
          ))}
        <div
          className={classNames(
            "mt-2 text-[10px]",
            message.isMine ? "text-white/65" : "text-gray-400",
          )}
        >
          {formatTicketDate(message.createdAt)}
        </div>
      </div>
    </div>
  )
}

const PersonChip = ({
  icon,
  label,
  name,
}: {
  icon: ReactNode
  label: string
  name: string
}) => (
  <span className="inline-flex items-center gap-2 rounded-xl bg-gray-100 px-3 py-2 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300">
    <span className="text-base text-primary">{icon}</span>
    <span className="text-gray-400">{label}:</span>
    <strong>{name}</strong>
  </span>
)

const EmptyTickets = ({ onCreate }: { onCreate: () => void }) => (
  <div className="flex h-full min-h-72 flex-col items-center justify-center px-6 text-center">
    <div className="flex size-16 items-center justify-center rounded-3xl bg-primary/10 text-3xl text-primary">
      <TbHeadset />
    </div>
    <h3 className="mt-4 font-black text-gray-800 dark:text-gray-100">
      هنوز تیکتی ندارید
    </h3>
    <p className="mt-2 max-w-xs text-sm leading-7 text-gray-500">
      درخواست خود را ثبت کنید تا تیم مربوط آن را پیگیری کند.
    </p>
    <Button className="mt-4" size="sm" variant="solid" onClick={onCreate}>
      ثبت اولین تیکت
    </Button>
  </div>
)

const ConversationPlaceholder = ({ onCreate }: { onCreate: () => void }) => (
  <div className="flex h-full min-h-[620px] flex-col items-center justify-center px-6 text-center">
    <div className="flex size-24 items-center justify-center rounded-[2rem] bg-primary/10 text-5xl text-primary">
      <TbMessage2 />
    </div>
    <h2 className="mt-6 text-xl font-black text-gray-900 dark:text-white">
      یک مکالمه را انتخاب کنید
    </h2>
    <p className="mt-2 max-w-md text-sm leading-7 text-gray-500">
      پیام‌ها، وضعیت پیگیری، پشتیبان مسئول و فایل‌های مرتبط با تیکت در این بخش
      نمایش داده می‌شوند.
    </p>
    <Button
      className="mt-5"
      variant="solid"
      icon={<TbPlus />}
      onClick={onCreate}
    >
      تیکت جدید
    </Button>
  </div>
)

const Pagination = ({
  pagination,
  selectedTicket,
}: {
  pagination: TicketPagination
  selectedTicket?: Ticket | null
}) => {
  const searchParams = useSearchParams()
  const base = selectedTicket
    ? `/pishkhan/tickets/${selectedTicket.uuid}`
    : "/pishkhan/tickets"
  const pageLink = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", String(page))
    return `${base}?${params}`
  }
  return (
    <div className="flex items-center justify-between border-t border-gray-200 p-3 text-xs dark:border-gray-800">
      <Link
        className={classNames(
          "rounded-lg px-3 py-2",
          pagination.currentPage <= 1
            ? "pointer-events-none text-gray-300"
            : "text-primary hover:bg-primary/10",
        )}
        href={pageLink(Math.max(1, pagination.currentPage - 1))}
      >
        قبلی
      </Link>
      <span className="text-gray-500">
        صفحه {pagination.currentPage.toLocaleString("fa-IR")} از{" "}
        {pagination.lastPage.toLocaleString("fa-IR")}
      </span>
      <Link
        className={classNames(
          "rounded-lg px-3 py-2",
          pagination.currentPage >= pagination.lastPage
            ? "pointer-events-none text-gray-300"
            : "text-primary hover:bg-primary/10",
        )}
        href={pageLink(
          Math.min(pagination.lastPage, pagination.currentPage + 1),
        )}
      >
        بعدی
      </Link>
    </div>
  )
}

export default TicketsWorkspace
