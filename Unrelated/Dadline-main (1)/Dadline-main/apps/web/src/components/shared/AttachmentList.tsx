import Button from "@/components/ui/Button"
import {
  TbDownload,
  TbFile,
  TbFileTypeDoc,
  TbFileTypeJpg,
  TbFileTypePdf,
  TbFileTypeXls,
  TbMusic,
  TbTrash,
  TbVideo,
} from "react-icons/tb"

export type AttachmentListItem = {
  id: string | number
  name?: string | null
  mimeType?: string | null
  sizeBytes?: number | null
  url?: string | null
}

type Props = {
  items: AttachmentListItem[]
  emptyText?: string
  onRemove?: (item: AttachmentListItem, index: number) => void
}

const formatFileSize = (size?: number | null) => {
  if (!size) return "حجم نامشخص"
  const unit = size >= 1024 * 1024 ? "MB" : "KB"
  const value = size >= 1024 * 1024 ? size / 1024 / 1024 : size / 1024

  return `${value.toLocaleString("fa-IR", {
    maximumFractionDigits: 1,
  })} ${unit}`
}

const fileTypeDetails = (item: AttachmentListItem) => {
  const name = item.name?.toLowerCase() ?? ""
  const mimeType = item.mimeType?.toLowerCase() ?? ""

  if (mimeType.includes("pdf") || name.endsWith(".pdf")) {
    return {
      Icon: TbFileTypePdf,
      label: "PDF",
      className: "border-red-100 bg-red-50 text-red-700",
    }
  }

  if (
    mimeType.includes("word") ||
    name.endsWith(".doc") ||
    name.endsWith(".docx")
  ) {
    return {
      Icon: TbFileTypeDoc,
      label: "Word",
      className: "border-blue-100 bg-blue-50 text-blue-700",
    }
  }

  if (
    mimeType.includes("excel") ||
    mimeType.includes("spreadsheet") ||
    name.endsWith(".xls") ||
    name.endsWith(".xlsx")
  ) {
    return {
      Icon: TbFileTypeXls,
      label: "Excel",
      className: "border-emerald-100 bg-emerald-50 text-emerald-700",
    }
  }

  if (mimeType.startsWith("image/") || /\.(jpe?g|png|webp)$/i.test(name)) {
    return {
      Icon: TbFileTypeJpg,
      label: "تصویر",
      className: "border-violet-100 bg-violet-50 text-violet-700",
    }
  }

  if (mimeType.startsWith("video/") || /\.(mp4|mov|webm|mkv)$/i.test(name)) {
    return {
      Icon: TbVideo,
      label: "ویدیو",
      className: "border-fuchsia-100 bg-fuchsia-50 text-fuchsia-700",
    }
  }

  if (mimeType.startsWith("audio/") || /\.(mp3|wav|m4a|ogg)$/i.test(name)) {
    return {
      Icon: TbMusic,
      label: "صوت",
      className: "border-cyan-100 bg-cyan-50 text-cyan-700",
    }
  }

  return {
    Icon: TbFile,
    label: "فایل",
    className: "border-gray-200 bg-gray-50 text-gray-700",
  }
}

const AttachmentList = ({ items, emptyText, onRemove }: Props) => {
  if (items.length === 0) {
    return emptyText ? (
      <div className="rounded-lg border border-dashed border-gray-300 px-3 py-5 text-center text-sm text-gray-500 dark:border-gray-700">
        {emptyText}
      </div>
    ) : null
  }

  return (
    <div className="space-y-2">
      {items.map((item, index) => {
        const type = fileTypeDetails(item)
        const Icon = type.Icon

        return (
          <div
            key={item.id}
            className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 p-3 text-sm dark:border-gray-700"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${type.className}`}
                title={type.label}
              >
                <Icon className="text-2xl" />
              </div>
              <div className="min-w-0">
                <div className="truncate font-medium">
                  {item.name ?? `پیوست ${(index + 1).toLocaleString("fa-IR")}`}
                </div>
                <div className="text-xs text-gray-500">
                  {type.label} · {formatFileSize(item.sizeBytes)}
                </div>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {item.url && (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-lg text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                  aria-label="دانلود پیوست"
                >
                  <TbDownload />
                </a>
              )}
              {onRemove && (
                <Button
                  icon={<TbTrash />}
                  onClick={() => onRemove(item, index)}
                  aria-label="حذف پیوست"
                />
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default AttachmentList
