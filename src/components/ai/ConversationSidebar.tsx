import type { AiConversationRow } from "@adminhub/shared"
import { Icon } from "../layout/Icon"
import { Button } from "../ui/Button"
import type { t } from "../../i18n"

export function ConversationSidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  onRename,
  onDelete,
  tr,
}: {
  conversations: AiConversationRow[]
  activeId?: string
  onSelect: (id: string) => void
  onNew: () => void
  onRename: (id: string, title: string) => void
  onDelete: (id: string) => void
  tr: typeof t["en"]
}) {
  return (
    <div className="flex h-full w-full flex-col border-r border-border bg-surface">
      <div className="flex items-center justify-between px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground">
          {tr.ai.conversations}
        </h2>
        <Button
          variant="ghost"
          className="h-8 w-8 p-0"
          onClick={onNew}
          aria-label={tr.ai.newConversation}
        >
          <Icon name="plus" className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-2">
        {conversations.length === 0 && (
          <p className="px-2 py-4 text-xs text-muted">
            {tr.ai.noConversations}
          </p>
        )}

        {conversations.map((conversation) => (
          <div
            key={conversation.id}
            className={`group flex items-center gap-2 rounded-lg px-2 py-2 text-sm cursor-pointer transition-colors ${
              conversation.id === activeId
                ? "bg-primary/10 text-primary"
                : "text-foreground hover:bg-subtle"
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
                  const next = prompt(tr.ai.renamePrompt, conversation.title)
                  if (next && next.trim()) {
                    onRename(conversation.id, next.trim())
                  }
                }}
                title={tr.ai.rename}
              >
                <Icon name="edit" className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                className="h-6 w-6 p-0 text-red-500"
                onClick={(e) => {
                  e.stopPropagation()
                  if (confirm(tr.ai.deleteConfirm)) {
                    onDelete(conversation.id)
                  }
                }}
                title={tr.ai.delete}
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
