import type { AiConversationRow } from "@adminhub/shared"
import { Icon } from "../layout/Icon"
import { Button } from "../ui/Button"

export function ConversationSidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  onRename,
  onDelete,
}: {
  conversations: AiConversationRow[]
  activeId?: string
  onSelect: (id: string) => void
  onNew: () => void
  onRename: (id: string, title: string) => void
  onDelete: (id: string) => void
}) {
  return (
    <div className="flex h-full w-full flex-col border-r border-border bg-surface">
      <div className="flex items-center justify-between px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground">Conversations</h2>
        <Button
          variant="ghost"
          className="h-8 w-8 p-0"
          onClick={onNew}
          title="New conversation"
        >
          <Icon name="plus" className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-2">
        {conversations.length === 0 && (
          <p className="px-2 py-4 text-xs text-muted">No conversations yet.</p>
        )}

        {conversations.map((conversation) => (
          <div
            key={conversation.id}
            className={`group flex items-center gap-2 rounded-lg px-2 py-2 text-sm cursor-pointer transition-colors ${
              conversation.id === activeId
                ? "bg-primary/10 text-primary"
                : "text-foreground hover:bg-muted"
            }`}
            onClick={() => onSelect(conversation.id)}
          >
            <span className="flex-1 truncate">{conversation.title}</span>

            <div className="hidden items-center gap-1 group-hover:flex">
              <Button
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation()
                  const next = prompt("Rename conversation", conversation.title)
                  if (next && next.trim()) {
                    onRename(conversation.id, next.trim())
                  }
                }}
                title="Rename"
              >
                <Icon name="edit" className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                className="h-6 w-6 p-0 text-red-500"
                onClick={(e) => {
                  e.stopPropagation()
                  if (confirm("Delete this conversation?")) {
                    onDelete(conversation.id)
                  }
                }}
                title="Delete"
              >
                <Icon name="trash" className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
