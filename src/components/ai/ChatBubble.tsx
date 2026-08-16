import type { AiMessageRow } from "@adminhub/shared"
import { Icon } from "../layout/Icon"
import { MarkdownMessage } from "./MarkdownMessage"
import { useCopyText } from "./CodeBlock"

function formatCost(value?: number) {
  if (value === undefined || value === null) return ""

  if (value === 0) return "free"

  if (value < 0.0001) {
    return `< $0.0001`
  }

  return `$${value.toFixed(4)}`
}

function formatTokens(value?: number) {
  if (value === undefined || value === null) return ""

  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`
  }

  return String(value)
}

function formatTime(value?: number) {
  if (value === undefined || value === null) return ""

  if (value < 1000) return `${value}ms`

  return `${(value / 1000).toFixed(1)}s`
}

export function ChatBubble({ message }: { message: AiMessageRow }) {
  const isUser = message.role === "user"
  const { copied: messageCopied, copy: copyMessage } = useCopyText()

  return (
    <div
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
          isUser ? "bg-primary text-white" : "bg-muted text-foreground"
        }`}
      >
        {isUser ? "U" : "AI"}
      </div>

      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? "bg-primary text-white rounded-br-sm"
            : "bg-muted text-foreground rounded-bl-sm"
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        ) : (
          <MarkdownMessage content={message.content} />
        )}

        {!isUser && (
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs opacity-70">
            <button
              type="button"
              onClick={() => copyMessage(message.content)}
              aria-label={messageCopied ? "Copied" : "Copy message"}
              className="inline-flex items-center gap-1 rounded-full bg-surface px-2 py-0.5 hover:opacity-80"
            >
              <Icon name={messageCopied ? "check" : "copy"} className="h-3 w-3" />
              {messageCopied ? "Copied" : "Copy"}
            </button>
            {message.provider && (
              <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2 py-0.5">
                <Icon name="bot" className="h-3 w-3" />
                {message.provider}
              </span>
            )}
            {message.modelCode && (
              <span className="rounded-full bg-surface px-2 py-0.5">
                {message.modelCode}
              </span>
            )}
            {message.promptTokens !== undefined && (
              <span className="rounded-full bg-surface px-2 py-0.5">
                {formatTokens(message.promptTokens)} in
              </span>
            )}
            {message.completionTokens !== undefined && (
              <span className="rounded-full bg-surface px-2 py-0.5">
                {formatTokens(message.completionTokens)} out
              </span>
            )}
            {message.totalCost !== undefined && (
              <span className="rounded-full bg-surface px-2 py-0.5">
                {formatCost(message.totalCost)}
              </span>
            )}
            {message.responseTimeMs !== undefined && (
              <span className="rounded-full bg-surface px-2 py-0.5">
                {formatTime(message.responseTimeMs)}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
