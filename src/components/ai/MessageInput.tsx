import { useState, type FormEvent } from "react"
import { Icon } from "../layout/Icon"
import { Button } from "../ui/Button"

export function MessageInput({
  onSend,
  disabled,
}: {
  onSend: (content: string) => void
  disabled?: boolean
}) {
  const [content, setContent] = useState("")

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    const trimmed = content.trim()
    if (!trimmed) return

    onSend(trimmed)
    setContent("")
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex shrink-0 items-end gap-2 border-t border-border bg-surface px-4 py-3"
    >
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Type a message..."
        rows={1}
        disabled={disabled}
        className="flex-1 resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary disabled:opacity-50"
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSubmit(e)
          }
        }}
      />
      <Button
        type="submit"
        disabled={disabled || !content.trim()}
        variant="primary"
        className="h-9 w-9 shrink-0 p-0"
      >
        <Icon name="send" className="h-4 w-4" />
      </Button>
    </form>
  )
}
