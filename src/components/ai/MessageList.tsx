import { useRef, useEffect } from "react"
import type { AiMessageRow } from "@adminhub/shared"
import { ChatBubble } from "./ChatBubble"

export function MessageList({ messages }: { messages: AiMessageRow[] }) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages.length])

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted">
        No messages yet. Start the conversation below.
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-4">
      {messages.map((message) => (
        <ChatBubble key={message.id} message={message} />
      ))}
      <div ref={bottomRef} />
    </div>
  )
}
